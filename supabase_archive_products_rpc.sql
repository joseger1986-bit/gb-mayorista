-- Punto X Mayor - archivado seguro de productos
-- Ejecutar en Supabase SQL Editor del proyecto wcnxwjqfmpmoyzbdovqp.
-- No modifica datos existentes. Solo crea/reemplaza una RPC para que Gestion
-- pueda archivar/restaurar productos con usuario autenticado administrador.

create or replace function public.set_product_archived(product_id uuid, archived boolean)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  current_email text;
  saved_product public.products%rowtype;
begin
  current_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  if auth.uid() is null or current_email = '' then
    raise exception 'Usuario no autenticado.';
  end if;

  if not exists (
    select 1
    from public.internal_admin_keys
    where active is true
      and lower(admin_email) = current_email
  ) then
    raise exception 'Solo el Administrador puede archivar o restaurar productos.';
  end if;

  update public.products
  set active = not coalesce(archived, false)
  where id = product_id
  returning *
  into saved_product;

  if not found then
    raise exception 'No se encontro el producto indicado para archivar/restaurar.';
  end if;

  return jsonb_build_object(
    'id', saved_product.id,
    'name', saved_product.name,
    'active', saved_product.active,
    'show_in_catalog', saved_product.show_in_catalog
  );
end;
$$;

revoke all on function public.set_product_archived(uuid, boolean) from public;
revoke all on function public.set_product_archived(uuid, boolean) from anon;
grant execute on function public.set_product_archived(uuid, boolean) to authenticated;

-- Verificaciones despues de ejecutar:
-- select routine_schema, routine_name
-- from information_schema.routines
-- where routine_schema = 'public'
--   and routine_name = 'set_product_archived';
--
-- La prueba real debe hacerse desde la app con sesion autenticada de Administrador.
