-- Punto X Mayor - corregir policies de pedidos que consultan auth.users
-- Objetivo: que Gestion pueda leer/administrar orders y order_items sin dar SELECT sobre auth.users.
-- No modifica datos de pedidos, productos, stock ni usuarios.

begin;

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Eliminar solamente policies de orders/order_items que referencian auth.users.
do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('orders', 'order_items')
      and (
        coalesce(qual, '') ilike '%auth.users%'
        or coalesce(with_check, '') ilike '%auth.users%'
      )
  loop
    execute format('drop policy if exists %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- Asegurar las policies correctas para Gestion Interna autenticada.
drop policy if exists "Authenticated can manage orders" on public.orders;
create policy "Authenticated can manage orders"
  on public.orders
  for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "Authenticated can manage order items" on public.order_items;
create policy "Authenticated can manage order items"
  on public.order_items
  for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

commit;

-- Verificacion: estas dos tablas no deben tener policies que consulten auth.users.
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check,
  (
    coalesce(qual, '') ilike '%auth.users%'
    or coalesce(with_check, '') ilike '%auth.users%'
  ) as references_auth_users
from pg_policies
where schemaname = 'public'
  and tablename in ('orders', 'order_items')
order by tablename, policyname;

