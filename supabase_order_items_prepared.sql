-- Punto X Mayor - marcar productos separados en pedidos
-- No modifica cantidades, precios, stock, estados ni datos comerciales.

begin;

alter table public.order_items
  add column if not exists prepared boolean not null default false;

comment on column public.order_items.prepared is
  'Marca interna de Gestion: producto separado/preparado para el pedido. No afecta precios, stock ni estado.';

commit;

select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'order_items'
  and column_name = 'prepared';
