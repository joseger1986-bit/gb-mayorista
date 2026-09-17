-- Punto X Mayor - Seguridad Gestion Interna
-- Preparado para ejecutar en Supabase SQL Editor cuando se apruebe.
-- No consulta auth.users. Toda autorizacion interna se basa en auth.uid()
-- y en tablas propias del schema public.

begin;

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.internal_users (
  id uuid primary key default extensions.gen_random_uuid(),
  auth_user_id uuid unique,
  username text not null unique,
  login_email text not null unique,
  role text not null,
  recovery_email text,
  active boolean not null default true,
  mfa_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint internal_users_username_check check (username in ('admin', 'empleado')),
  constraint internal_users_role_check check (role in ('admin', 'employee'))
);

create table if not exists public.internal_devices (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.internal_users(id) on delete cascade,
  device_hash text not null,
  device_secret_hash text not null,
  device_label text not null default 'Dispositivo sin nombre',
  user_agent text not null default '',
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  authorized_at timestamptz,
  rejected_at timestamptz,
  revoked_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint internal_devices_status_check check (status in ('pending', 'authorized', 'rejected', 'revoked')),
  constraint internal_devices_user_device_unique unique (user_id, device_hash)
);

create table if not exists public.internal_login_attempts (
  id uuid primary key default extensions.gen_random_uuid(),
  username text not null,
  device_hash text not null default '',
  failed_count integer not null default 0,
  locked_until timestamptz,
  last_failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint internal_login_attempts_unique unique (username, device_hash)
);

alter table public.internal_users enable row level security;
alter table public.internal_devices enable row level security;
alter table public.internal_login_attempts enable row level security;

revoke all on table public.internal_users from anon, authenticated;
revoke all on table public.internal_devices from anon, authenticated;
revoke all on table public.internal_login_attempts from anon, authenticated;

create or replace function public.internal_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists internal_users_touch_updated_at on public.internal_users;
create trigger internal_users_touch_updated_at
before update on public.internal_users
for each row execute function public.internal_touch_updated_at();

drop trigger if exists internal_devices_touch_updated_at on public.internal_devices;
create trigger internal_devices_touch_updated_at
before update on public.internal_devices
for each row execute function public.internal_touch_updated_at();

drop trigger if exists internal_login_attempts_touch_updated_at on public.internal_login_attempts;
create trigger internal_login_attempts_touch_updated_at
before update on public.internal_login_attempts
for each row execute function public.internal_touch_updated_at();

create or replace function public.internal_resolve_login_user(p_username text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  u public.internal_users%rowtype;
begin
  select *
  into u
  from public.internal_users
  where username = lower(trim(coalesce(p_username, '')))
    and active is true
  limit 1;

  if not found then
    return jsonb_build_object('found', false);
  end if;

  return jsonb_build_object(
    'found', true,
    'username', u.username,
    'login_email', u.login_email,
    'role', u.role,
    'mfa_required', u.mfa_required
  );
end;
$$;

create or replace function public.internal_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.internal_users iu
    where iu.auth_user_id = auth.uid()
      and iu.active is true
      and iu.role = 'admin'
  );
$$;

create or replace function public.internal_current_user()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  u public.internal_users%rowtype;
begin
  if auth.uid() is null then
    return jsonb_build_object('authenticated', false);
  end if;

  select *
  into u
  from public.internal_users
  where auth_user_id = auth.uid()
    and active is true
  limit 1;

  if not found then
    return jsonb_build_object('authenticated', true, 'allowed', false, 'reason', 'internal_user_not_found');
  end if;

  return jsonb_build_object(
    'authenticated', true,
    'allowed', true,
    'user_id', u.id,
    'username', u.username,
    'role', u.role,
    'mfa_required', u.mfa_required,
    'recovery_enabled', u.role = 'admin' and coalesce(u.recovery_email, '') <> ''
  );
end;
$$;

create or replace function public.internal_get_login_lock(p_username text, p_device_hash text default '')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row_data public.internal_login_attempts%rowtype;
begin
  select *
  into row_data
  from public.internal_login_attempts
  where username = lower(trim(coalesce(p_username, '')))
    and device_hash = coalesce(p_device_hash, '')
  limit 1;

  if not found then
    return jsonb_build_object('locked', false, 'failed_count', 0, 'locked_until', null);
  end if;

  return jsonb_build_object(
    'locked', row_data.locked_until is not null and row_data.locked_until > now(),
    'failed_count', row_data.failed_count,
    'locked_until', row_data.locked_until
  );
end;
$$;

create or replace function public.internal_record_failed_login(p_username text, p_device_hash text default '')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_username text := lower(trim(coalesce(p_username, '')));
  clean_device text := coalesce(p_device_hash, '');
  row_data public.internal_login_attempts%rowtype;
  next_count integer;
  next_locked_until timestamptz;
begin
  if clean_username not in ('admin', 'empleado') then
    clean_username := 'unknown';
  end if;

  insert into public.internal_login_attempts (username, device_hash, failed_count, last_failed_at)
  values (clean_username, clean_device, 0, now())
  on conflict (username, device_hash)
  do update set updated_at = now()
  returning * into row_data;

  if row_data.locked_until is not null and row_data.locked_until > now() then
    return jsonb_build_object('locked', true, 'failed_count', row_data.failed_count, 'locked_until', row_data.locked_until);
  end if;

  next_count := coalesce(row_data.failed_count, 0) + 1;
  next_locked_until := case when next_count >= 3 then now() + interval '15 minutes' else null end;

  update public.internal_login_attempts
  set failed_count = next_count,
      locked_until = next_locked_until,
      last_failed_at = now(),
      updated_at = now()
  where id = row_data.id
  returning * into row_data;

  return jsonb_build_object(
    'locked', row_data.locked_until is not null and row_data.locked_until > now(),
    'failed_count', row_data.failed_count,
    'locked_until', row_data.locked_until
  );
end;
$$;

create or replace function public.internal_clear_login_attempts(p_username text, p_device_hash text default '')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_username text := lower(trim(coalesce(p_username, '')));
begin
  if auth.uid() is null then
    return false;
  end if;

  if not exists (
    select 1 from public.internal_users
    where auth_user_id = auth.uid()
      and username = clean_username
      and active is true
  ) then
    return false;
  end if;

  delete from public.internal_login_attempts
  where username = clean_username
    and device_hash = coalesce(p_device_hash, '');

  return true;
end;
$$;

create or replace function public.internal_admin_recovery_email(p_username text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  u public.internal_users%rowtype;
begin
  select *
  into u
  from public.internal_users
  where username = lower(trim(coalesce(p_username, '')))
    and role = 'admin'
    and active is true
  limit 1;

  if not found or coalesce(u.recovery_email, '') = '' then
    return jsonb_build_object('allowed', false);
  end if;

  return jsonb_build_object('allowed', true, 'email', u.recovery_email);
end;
$$;

create or replace function public.internal_check_device(
  p_device_hash text,
  p_device_secret_hash text,
  p_device_label text default '',
  p_user_agent text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  u public.internal_users%rowtype;
  d public.internal_devices%rowtype;
  clean_hash text := trim(coalesce(p_device_hash, ''));
  clean_secret text := trim(coalesce(p_device_secret_hash, ''));
begin
  if auth.uid() is null then
    return jsonb_build_object('authenticated', false, 'allowed', false, 'device_status', 'none');
  end if;

  if clean_hash = '' or clean_secret = '' then
    return jsonb_build_object('authenticated', true, 'allowed', false, 'device_status', 'invalid_device');
  end if;

  select *
  into u
  from public.internal_users
  where auth_user_id = auth.uid()
    and active is true
  limit 1;

  if not found then
    return jsonb_build_object('authenticated', true, 'allowed', false, 'device_status', 'user_not_allowed');
  end if;

  select *
  into d
  from public.internal_devices
  where user_id = u.id
    and device_hash = clean_hash
  limit 1;

  if not found then
    insert into public.internal_devices (user_id, device_hash, device_secret_hash, device_label, user_agent, status)
    values (
      u.id,
      clean_hash,
      clean_secret,
      left(coalesce(nullif(trim(p_device_label), ''), 'Dispositivo nuevo'), 160),
      left(coalesce(p_user_agent, ''), 500),
      'pending'
    )
    returning * into d;
  end if;

  if d.device_secret_hash <> clean_secret then
    return jsonb_build_object(
      'authenticated', true,
      'allowed', false,
      'username', u.username,
      'role', u.role,
      'mfa_required', u.mfa_required,
      'device_id', d.id,
      'device_status', 'secret_mismatch'
    );
  end if;

  if d.status = 'authorized' then
    update public.internal_devices
    set last_seen_at = now(),
        device_label = left(coalesce(nullif(trim(p_device_label), ''), d.device_label), 160),
        user_agent = left(coalesce(p_user_agent, d.user_agent), 500)
    where id = d.id
    returning * into d;
  end if;

  return jsonb_build_object(
    'authenticated', true,
    'allowed', d.status = 'authorized',
    'username', u.username,
    'role', u.role,
    'mfa_required', u.mfa_required,
    'device_id', d.id,
    'device_status', d.status,
    'last_seen_at', d.last_seen_at
  );
end;
$$;

create or replace function public.internal_admin_list_devices()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.internal_is_admin() then
    raise exception 'No autorizado';
  end if;

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', d.id,
        'username', u.username,
        'role', u.role,
        'device_label', d.device_label,
        'status', d.status,
        'requested_at', d.requested_at,
        'authorized_at', d.authorized_at,
        'rejected_at', d.rejected_at,
        'revoked_at', d.revoked_at,
        'last_seen_at', d.last_seen_at,
        'user_agent', d.user_agent
      )
      order by d.requested_at desc
    )
    from public.internal_devices d
    join public.internal_users u on u.id = d.user_id
  ), '[]'::jsonb);
end;
$$;

create or replace function public.internal_admin_set_device_status(p_device_id uuid, p_status text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.internal_devices%rowtype;
  clean_status text := lower(trim(coalesce(p_status, '')));
begin
  if not public.internal_is_admin() then
    raise exception 'No autorizado';
  end if;

  if clean_status not in ('authorized', 'rejected', 'revoked') then
    raise exception 'Estado invalido';
  end if;

  update public.internal_devices
  set status = clean_status,
      authorized_at = case when clean_status = 'authorized' then now() else authorized_at end,
      rejected_at = case when clean_status = 'rejected' then now() else rejected_at end,
      revoked_at = case when clean_status = 'revoked' then now() else revoked_at end,
      updated_at = now()
  where id = p_device_id
  returning * into d;

  if not found then
    raise exception 'Dispositivo no encontrado';
  end if;

  return to_jsonb(d);
end;
$$;

create or replace view public.products_safe_catalog
with (security_invoker = true)
as
select
  p.id,
  p.category_id,
  c.name as category_name,
  p.name,
  p.brand,
  p.presentation,
  p.sale_price,
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
where p.active is true;

create or replace function public.internal_admin_products_with_cost()
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
  if not public.internal_is_admin() then
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

revoke all on function public.internal_resolve_login_user(text) from public;
revoke all on function public.internal_is_admin() from public;
revoke all on function public.internal_current_user() from public;
revoke all on function public.internal_get_login_lock(text, text) from public;
revoke all on function public.internal_record_failed_login(text, text) from public;
revoke all on function public.internal_clear_login_attempts(text, text) from public;
revoke all on function public.internal_admin_recovery_email(text) from public;
revoke all on function public.internal_check_device(text, text, text, text) from public;
revoke all on function public.internal_admin_list_devices() from public;
revoke all on function public.internal_admin_set_device_status(uuid, text) from public;
revoke all on function public.internal_admin_products_with_cost() from public;

grant execute on function public.internal_resolve_login_user(text) to anon, authenticated;
grant execute on function public.internal_current_user() to authenticated;
grant execute on function public.internal_get_login_lock(text, text) to anon, authenticated;
grant execute on function public.internal_record_failed_login(text, text) to anon, authenticated;
grant execute on function public.internal_clear_login_attempts(text, text) to authenticated;
grant execute on function public.internal_admin_recovery_email(text) to anon, authenticated;
grant execute on function public.internal_check_device(text, text, text, text) to authenticated;
grant execute on function public.internal_admin_list_devices() to authenticated;
grant execute on function public.internal_admin_set_device_status(uuid, text) to authenticated;
grant execute on function public.internal_admin_products_with_cost() to authenticated;

grant select on public.products_safe_catalog to anon, authenticated;

-- Endurecimiento final de costos:
-- Ejecutar estas lineas SOLO cuando el frontend ya este desplegado leyendo:
-- - products_safe_catalog para publico/empleado
-- - internal_admin_products_with_cost() para admin
--
-- revoke select on public.products from anon, authenticated;
-- grant select (
--   id, category_id, name, brand, presentation, sale_price, stock,
--   show_in_catalog, image_path, active, sort_order, description,
--   gallery_images, stock_unit, base_name, option_name, assortment_name,
--   created_at, updated_at
-- ) on public.products to anon, authenticated;

select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_functiondef(p.oid) ilike '%auth.users%' as references_auth_users
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname like 'internal_%'
order by p.proname;

commit;
