-- Punto X Mayor - corregir constraint de estados de pedidos
-- Necesario si existia un constraint previo orders_status_valid incompatible con "En revisión".

alter table public.orders
  drop constraint if exists orders_status_valid;

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_valid
  check (status in ('En revisión', 'Pagado'));

update public.orders
set status = 'En revisión'
where status is null
   or status not in ('En revisión', 'Pagado');
