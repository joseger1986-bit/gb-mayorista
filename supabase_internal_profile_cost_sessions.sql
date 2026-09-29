begin;

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.internal_profile_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  auth_user_id uuid not null,
  username text not null,
  role text not null,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  constraint internal_profile_sessions_username_check check (username in ('admin', 'empleado')),
  constraint internal_profile_sessions_role_check check (role in ('admin', 'employee'))
);

create index if not exists internal_profile_sessions_auth_user_idx
  on public.internal_profile_sessions (auth_user_id, role, revoked_at, expires_at);

alter table public.internal_profile_sessions enable row level security;

revoke all on table public.internal_profile_sessions from anon, authenticated;

create or replace function public.internal_hash_profile_token(p_profile_token text)
returns text
language sql
stable
security definer
set search_path = public, extensions
as $$
  select encode(digest(coalesce(p_profile_token, ''), 'sha256'), 'hex');
$$;

create or replace function public.internal_start_profile_session(
  p_username text,
  p_password text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  verification jsonb;
  verified_username text;
  verified_role text;
  raw_token text;
  token_hash_value text;
  token_expires_at timestamptz := now() + interval '365 days';
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  end if;

  verification := public.internal_verify_profile_password(p_username, p_password);

  if coalesce((verification->>'ok')::boolean, false) is not true then
    return verification;
  end if;

  verified_username := lower(trim(coalesce(verification->>'username', p_username, '')));
  verified_role := lower(trim(coalesce(verification->>'role', '')));

  if verified_username not in ('admin', 'empleado') or verified_role not in ('admin', 'employee') then
    return jsonb_build_object('ok', false, 'reason', 'invalid_profile');
  end if;

  raw_token := encode(gen_random_bytes(32), 'hex');
  token_hash_value := public.internal_hash_profile_token(raw_token);

  update public.internal_profile_sessions
     set revoked_at = now()
   where auth_user_id = auth.uid()
     and username = verified_username
     and role = verified_role
     and revoked_at is null;

  insert into public.internal_profile_sessions (
    auth_user_id,
    username,
    role,
    token_hash,
    expires_at
  )
  values (
    auth.uid(),
    verified_username,
    verified_role,
    token_hash_value,
    token_expires_at
  );

  return verification || jsonb_build_object(
    'ok', true,
    'username', verified_username,
    'role', verified_role,
    'profile_session_token', raw_token,
    'profile_session_expires_at', token_expires_at
  );
end;
$$;

create or replace function public.internal_validate_profile_session(p_profile_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.internal_profile_sessions%rowtype;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  end if;

  if trim(coalesce(p_profile_token, '')) = '' then
    return jsonb_build_object('ok', false, 'reason', 'missing_profile_session');
  end if;

  select *
    into s
    from public.internal_profile_sessions
   where auth_user_id = auth.uid()
     and token_hash = public.internal_hash_profile_token(p_profile_token)
     and revoked_at is null
     and expires_at > now()
   limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'profile_session_not_found');
  end if;

  update public.internal_profile_sessions
     set last_used_at = now()
   where id = s.id;

  return jsonb_build_object(
    'ok', true,
    'username', s.username,
    'role', s.role,
    'expires_at', s.expires_at
  );
end;
$$;

create or replace function public.internal_end_profile_session(p_profile_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  end if;

  update public.internal_profile_sessions
     set revoked_at = now()
   where auth_user_id = auth.uid()
     and token_hash = public.internal_hash_profile_token(p_profile_token)
     and revoked_at is null;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.internal_is_admin_profile(p_profile_token text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
     and trim(coalesce(p_profile_token, '')) <> ''
     and exists (
       select 1
         from public.internal_profile_sessions s
        where s.auth_user_id = auth.uid()
          and s.role = 'admin'
          and s.token_hash = public.internal_hash_profile_token(p_profile_token)
          and s.revoked_at is null
          and s.expires_at > now()
     );
$$;

drop function if exists public.internal_admin_products_with_cost();
drop function if exists public.internal_admin_products_with_cost(text);

create or replace function public.internal_admin_products_with_cost(p_profile_token text)
returns table (
  id uuid,
  category_id uuid,
  category_name text,
  name text,
  brand text,
  presentation text,
  sale_price numeric,
  cost_price numeric,
  stock numeric,
  show_in_catalog boolean,
  image_path text,
  active boolean,
  sort_order integer,
  description text,
  gallery_images jsonb,
  stock_unit text,
  base_name text,
  option_name text,
  assortment_name text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.internal_is_admin_profile(p_profile_token) then
    raise exception 'No autorizado';
  end if;

  return query
  select
    p.id,
    p.category_id,
    c.name as category_name,
    p.name,
    p.brand,
    p.presentation,
    p.sale_price,
    p.cost_price,
    p.stock,
    p.show_in_catalog,
    p.image_path,
    p.active,
    p.sort_order,
    p.description,
    p.gallery_images,
    p.stock_unit,
    p.base_name,
    p.option_name,
    p.assortment_name,
    p.created_at,
    p.updated_at
  from public.products p
  left join public.categories c on c.id = p.category_id
  where p.active is true
  order by p.sort_order asc nulls last, p.name asc;
end;
$$;

revoke all on function public.internal_hash_profile_token(text) from public;
revoke all on function public.internal_start_profile_session(text, text) from public;
revoke all on function public.internal_validate_profile_session(text) from public;
revoke all on function public.internal_end_profile_session(text) from public;
revoke all on function public.internal_is_admin_profile(text) from public;
revoke all on function public.internal_admin_products_with_cost(text) from public;

grant execute on function public.internal_start_profile_session(text, text) to authenticated;
grant execute on function public.internal_validate_profile_session(text) to authenticated;
grant execute on function public.internal_end_profile_session(text) to authenticated;
grant execute on function public.internal_admin_products_with_cost(text) to authenticated;

commit;

select
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  p.prosecdef as security_definer,
  pg_get_functiondef(p.oid) ilike '%auth.users%' as references_auth_users,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'internal_start_profile_session',
    'internal_validate_profile_session',
    'internal_end_profile_session',
    'internal_admin_products_with_cost'
  )
order by p.proname, pg_get_function_arguments(p.oid);
