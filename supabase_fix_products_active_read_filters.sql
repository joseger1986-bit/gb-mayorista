-- Punto X Mayor - asegurar que Gestion normal no lea productos archivados.
-- No modifica datos. No archiva/restaura productos. Solo reemplaza objetos de lectura.

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

revoke all on function public.internal_admin_products_with_cost() from public;
grant execute on function public.internal_admin_products_with_cost() to authenticated;
grant select on public.products_safe_catalog to anon, authenticated;

-- Verificacion: ambos objetos deben conservar el filtro de activos.
select
  'products_safe_catalog' as object_name,
  pg_get_viewdef('public.products_safe_catalog'::regclass, true) ilike '%p.active IS TRUE%' as filters_active_true;

select
  p.proname as function_name,
  pg_get_functiondef(p.oid) ilike '%where p.active is true%' as filters_active_true,
  pg_get_functiondef(p.oid) ilike '%auth.users%' as references_auth_users
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'internal_admin_products_with_cost';
