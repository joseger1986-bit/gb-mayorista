-- Ejecutar en Supabase SQL Editor del proyecto GB Mayorista.
-- Crea una validacion segura para el perfil Administrador sin guardar la clave en el frontend.

create extension if not exists pgcrypto;

create table if not exists public.internal_admin_keys (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null unique,
  key_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.internal_admin_keys enable row level security;

revoke all on table public.internal_admin_keys from anon;
revoke all on table public.internal_admin_keys from authenticated;

create or replace function public.verify_internal_admin_key(admin_key text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  current_email text;
begin
  current_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  if auth.uid() is null or current_email = '' or coalesce(admin_key, '') = '' then
    return false;
  end if;

  return exists (
    select 1
    from public.internal_admin_keys
    where active is true
      and lower(admin_email) = current_email
      and extensions.crypt(admin_key, key_hash) = key_hash
  );
end;
$$;

revoke all on function public.verify_internal_admin_key(text) from public;
revoke all on function public.verify_internal_admin_key(text) from anon;
grant execute on function public.verify_internal_admin_key(text) to authenticated;

-- Cargar o cambiar la clave interna del administrador con este comando,
-- reemplazando los dos valores entre <> desde el SQL Editor:
--
-- insert into public.internal_admin_keys (admin_email, key_hash)
-- values (lower('<MAIL_ADMIN>'), extensions.crypt('<CLAVE_INTERNA_ADMIN>', extensions.gen_salt('bf')))
-- on conflict (admin_email)
-- do update set
--   key_hash = excluded.key_hash,
--   active = true,
--   updated_at = now();
--
-- Verificacion esperada despues de iniciar sesion en la app:
-- select public.verify_internal_admin_key('<CLAVE_INTERNA_ADMIN>');
