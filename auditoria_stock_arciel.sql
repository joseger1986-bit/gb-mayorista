-- Solo lectura. No muestra datos de clientes ni costos.

with target as (
  select id,name,stock,stock_unit,updated_at
  from public.products where id='05f50d0c-caa1-495b-a9d8-cae058edf200'::uuid
), timeline as (
  select m.id,m.created_at,m.movement_type,m.reason,m.quantity,m.stock_unit,
    m.previous_stock,m.new_stock,m.order_id,
    lag(m.new_stock) over(order by m.created_at,m.id) as previous_logged_balance,
    count(*) over(partition by m.order_id,m.product_id,m.movement_type,m.quantity,m.previous_stock,m.new_stock) as equal_rows
  from public.stock_movements m join target p on p.id=m.product_id
), events as (
  select 'movimiento' as event, m.created_at as at, to_jsonb(m)-'created_at'-'equal_rows'
    ||jsonb_build_object('gap',m.previous_stock-m.previous_logged_balance,
      'potential_duplicate',m.order_id is not null and m.equal_rows>1) as detail
  from timeline m
  where m.created_at>='2026-11-05 00:00:00-03' and m.created_at<'2026-11-07 00:00:00-03'
  union all
  select 'renglon de pedido',coalesce(o.paid_at,o.created_at),jsonb_build_object(
    'order_id',o.id,'order_number',o.order_number,'origin',o.origin,'status',o.status,
    'stock_applied',o.stock_applied,'item_id',i.id,'quantity',i.quantity,'presentation',i.presentation,
    'stock_unit',i.stock_unit,'variant',i.variant_name,
    'expected_stock_units',i.quantity*case
      when i.presentation ~* 'pack\s*x\s*[0-9]+' then greatest(1,substring(i.presentation from '(?i)pack\s*x\s*([0-9]+)')::numeric)
      when i.presentation ~* 'docena' then case when i.stock_unit='docenas' then 1 else 12 end
      else 1 end,
    'linked_movements',(select count(*) from timeline m where m.order_id=o.id))
  from public.order_items i join target p on p.id=i.product_id join public.orders o on o.id=i.order_id
  where coalesce(o.paid_at,o.created_at)>='2026-11-05 00:00:00-03'
    and coalesce(o.paid_at,o.created_at)<'2026-11-07 00:00:00-03'
  union all
  select 'saldo actual',p.updated_at,to_jsonb(p)-'updated_at' from target p
), base_movements as (
  select m.product_id,m.created_at,m.id,m.previous_stock,
    lag(m.new_stock) over(partition by m.product_id order by m.created_at,m.id) as prior_stock
  from public.stock_movements m
  where not exists(select 1 from public.product_variants v where v.product_id=m.product_id)
)
select event,at at time zone 'America/Argentina/Buenos_Aires' as fecha_argentina,detail
from events
union all
select 'otros productos: discontinuidades',null,jsonb_build_object(
  'product_id',p.id,'name',p.name,'gaps',count(*),
  'max_gap',max(abs(m.previous_stock-m.prior_stock)))
from base_movements m join public.products p on p.id=m.product_id
where m.product_id<>'05f50d0c-caa1-495b-a9d8-cae058edf200'::uuid
  and m.created_at>='2026-11-05 00:00:00-03' and m.created_at<'2026-11-07 00:00:00-03'
  and m.previous_stock<>m.prior_stock
group by p.id,p.name
order by fecha_argentina nulls last,event,detail;
