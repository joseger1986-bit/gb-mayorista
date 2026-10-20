-- Ejecutar completo una vez en Supabase SQL Editor.
-- No actualiza orders, order_items, products ni movimientos.
begin;

create table if not exists public.internal_sale_financial_snapshots (
  order_id uuid primary key,
  created_at timestamptz not null,
  paid_at timestamptz not null,
  captured_at timestamptz not null default now(),
  total numeric not null,
  items jsonb not null,
  cost_total numeric,
  gross_profit numeric generated always as (total - cost_total) stored,
  margin_percent numeric generated always as (
    case when total > 0 then (total - cost_total) / total * 100 else 0 end
  ) stored,
  markup_percent numeric generated always as (
    case when cost_total > 0 then (total - cost_total) / cost_total * 100 else null end
  ) stored,
  constraint internal_sale_snapshot_items_array check (jsonb_typeof(items) = 'array')
);

alter table public.internal_sale_financial_snapshots enable row level security;
revoke all on table public.internal_sale_financial_snapshots from public, anon, authenticated;

create or replace function public.internal_capture_sale_financials(p_order_id uuid, p_existing boolean default false)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_order public.orders%rowtype;
  v_items jsonb;
  v_cost numeric;
  v_missing bigint;
begin
  if exists (select 1 from public.internal_sale_financial_snapshots where order_id = p_order_id) then
    return;
  end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.status <> 'Pagado' then return; end if;

  -- El multiplicador reproduce getStockUnitsPerSoldPresentation del sistema.
  with item_values as (
    select i.*,
      case
        when i.presentation ~* 'pack\s*x\s*[0-9]+' then
          greatest(1, substring(i.presentation from '(?i)pack\s*x\s*([0-9]+)')::numeric)
        when i.presentation ~* 'docena' then
          case when i.stock_unit = 'docenas' then 1 else 12 end
        else 1
      end as multiplier,
      p.cost_price as catalog_cost
    from public.order_items i
    left join public.products p on p.id = i.product_id
    where i.order_id = p_order_id
  ), resolved as (
    select i.*,
      case
        when p_existing and i.unit_cost > 0 then i.unit_cost
        when i.catalog_cost > 0 then round(i.catalog_cost * i.multiplier)
        when not p_existing and i.unit_cost > 0 then i.unit_cost
        else null
      end as frozen_cost,
      case
        when p_existing and i.unit_cost > 0 then 'recorded'
        when i.catalog_cost > 0 and p_existing then 'estimated'
        when i.catalog_cost > 0 then 'confirmed'
        when not p_existing and i.unit_cost > 0 then 'recorded'
        else 'missing'
      end as cost_source
    from item_values i
  )
  select
    coalesce(jsonb_agg(jsonb_build_object(
      'id', i.id, 'product_id', i.product_id, 'product_name', i.product_name,
      'variant_name', i.variant_name, 'presentation', i.presentation,
      'stock_unit', i.stock_unit, 'quantity', i.quantity,
      'unit_price', i.unit_price, 'unit_cost', i.frozen_cost,
      'subtotal', i.subtotal, 'cost_source', i.cost_source
    ) order by i.created_at, i.id), '[]'::jsonb),
    sum(i.frozen_cost * i.quantity),
    count(*) filter (where i.frozen_cost is null)
  into v_items, v_cost, v_missing
  from resolved i;

  if jsonb_array_length(v_items) = 0 then
    raise exception 'No se puede fijar la rentabilidad de una venta sin productos.';
  end if;
  insert into public.internal_sale_financial_snapshots
    (order_id, created_at, paid_at, total, items, cost_total)
  values (
    v_order.id, v_order.created_at, coalesce(v_order.paid_at, v_order.created_at),
    v_order.total, v_items, case when v_missing = 0 then v_cost else null end
  ) on conflict (order_id) do nothing;
end;
$$;

revoke all on function public.internal_capture_sale_financials(uuid, boolean) from public, anon, authenticated;

create or replace function public.internal_capture_sale_financials_trigger()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_table_name = 'orders' then
    perform public.internal_capture_sale_financials(new.id, false);
  else
    perform public.internal_capture_sale_financials(new.order_id, false);
  end if;
  return null;
end;
$$;

revoke all on function public.internal_capture_sale_financials_trigger() from public, anon, authenticated;

-- El bloqueo evita que se confirme una venta entre la carga inicial y el alta de triggers.
lock table public.orders in share row exclusive mode;
lock table public.order_items in share row exclusive mode;

-- Se copian los datos financieros existentes; los ceros no se inventan como costos originales.
do $$
declare v_id uuid;
begin
  for v_id in select id from public.orders where status = 'Pagado' order by id loop
    perform public.internal_capture_sale_financials(v_id, true);
  end loop;
end;
$$;

drop trigger if exists internal_freeze_sale_on_order on public.orders;
create constraint trigger internal_freeze_sale_on_order
after insert or update on public.orders
deferrable initially deferred
for each row execute function public.internal_capture_sale_financials_trigger();

drop trigger if exists internal_freeze_sale_on_item on public.order_items;
create constraint trigger internal_freeze_sale_on_item
after insert or update on public.order_items
deferrable initially deferred
for each row execute function public.internal_capture_sale_financials_trigger();

create or replace function public.internal_admin_historical_sales(p_profile_token text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare v_result jsonb;
begin
  if not public.internal_is_admin_profile(p_profile_token) then
    raise exception 'Se requiere el perfil Administrador.' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.orders o
    left join public.internal_sale_financial_snapshots s on s.order_id = o.id
    where o.status = 'Pagado' and s.order_id is null
  ) then
    raise exception 'Hay ventas pagadas sin registro financiero histórico. No se calculará una rentabilidad incompleta.';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', s.order_id, 'status', o.status, 'created_at', s.created_at,
    'paid_at', s.paid_at, 'total', s.total, 'order_items', s.items,
    'cost_total', s.cost_total, 'gross_profit', s.gross_profit,
    'margin_percent', s.margin_percent, 'markup_percent', s.markup_percent
  ) order by s.paid_at desc, s.order_id), '[]'::jsonb)
  into v_result
  from public.internal_sale_financial_snapshots s
  join public.orders o on o.id = s.order_id
  where o.status = 'Pagado';
  return v_result;
end;
$$;

revoke all on function public.internal_admin_historical_sales(text) from public, anon, authenticated;
grant execute on function public.internal_admin_historical_sales(text) to authenticated;

commit;

select
  'historical_sale_financials_ready' as result,
  (select count(*) from public.internal_sale_financial_snapshots) as frozen_sales,
  (select count(*) from public.internal_sale_financial_snapshots s,
    lateral jsonb_array_elements(s.items) i where i->>'cost_source' = 'estimated') as estimated_lines,
  (select count(*) from public.internal_sale_financial_snapshots s,
    lateral jsonb_array_elements(s.items) i where i->>'cost_source' = 'missing') as missing_cost_lines,
  has_function_privilege('authenticated', 'public.internal_admin_historical_sales(text)', 'execute') as authenticated_can_execute,
  has_function_privilege('anon', 'public.internal_admin_historical_sales(text)', 'execute') as anon_can_execute;
