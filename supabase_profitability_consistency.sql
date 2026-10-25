-- Aplicar completo antes de publicar profitability-consistency-1.
-- No actualiza productos, ventas, snapshots ni movimientos existentes.
begin;

-- Los costos de recepcion no se publican en stock_movements (visible al empleado).
create table if not exists public.internal_stock_cost_receipts (
  operation_id uuid primary key,
  product_id uuid not null,
  variant_name text not null default '',
  quantity numeric not null check (quantity > 0),
  incoming_cost numeric not null check (incoming_cost > 0),
  previous_stock numeric not null,
  previous_cost numeric not null,
  new_stock numeric not null,
  new_cost numeric not null,
  reason text not null,
  user_id uuid not null,
  created_at timestamptz not null default now()
);
alter table public.internal_stock_cost_receipts enable row level security;
revoke all on public.internal_stock_cost_receipts from public, anon, authenticated;

-- Solo para variantes antiguas que comparten una fila de products.
-- Los talles que ya son productos distintos siguen usando products.cost_price.
create table if not exists public.internal_variant_average_costs (
  variant_id uuid primary key references public.product_variants(id),
  product_id uuid not null references public.products(id),
  cost_price numeric not null check (cost_price >= 0)
);
alter table public.internal_variant_average_costs enable row level security;
revoke all on public.internal_variant_average_costs from public, anon, authenticated;

create or replace function public.internal_receive_stock_weighted(
  p_product_id uuid, p_quantity numeric, p_unit_cost numeric,
  p_profile_token text, p_operation_id uuid,
  p_variant_name text default '', p_reason text default 'Ingreso de mercaderia'
)
returns jsonb
language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_receipt public.internal_stock_cost_receipts%rowtype;
  v_movement public.stock_movements%rowtype;
  v_previous numeric; v_cost numeric; v_next numeric; v_average numeric;
  v_name text := coalesce(nullif(trim(p_variant_name), 'Base / sin variante'), '');
  v_reason text := coalesce(nullif(trim(p_reason), ''), 'Ingreso de mercaderia');
begin
  if not public.internal_is_admin_profile(p_profile_token) then
    raise exception 'Se requiere el perfil Administrador para registrar costos de compra.' using errcode='42501';
  end if;
  if p_operation_id is null or p_product_id is null or p_quantity is null
    or p_quantity::text in ('NaN','Infinity','-Infinity') or p_quantity <= 0 or trunc(p_quantity) <> p_quantity
    or p_unit_cost is null or p_unit_cost::text in ('NaN','Infinity','-Infinity') or p_unit_cost <= 0 then
    raise exception 'Ingresá cantidad entera y costo de compra mayores a cero.';
  end if;
  -- Serializa reintentos incluso si llegan desde dispositivos distintos.
  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text, 48531));
  select * into v_receipt from public.internal_stock_cost_receipts where operation_id=p_operation_id;
  if found then
    if v_receipt.product_id<>p_product_id or v_receipt.variant_name<>v_name
      or v_receipt.quantity<>p_quantity or v_receipt.incoming_cost<>p_unit_cost or v_receipt.reason<>v_reason
      or v_receipt.user_id<>auth.uid() then
      raise exception 'El identificador ya corresponde a otra entrada.';
    end if;
    select * into strict v_movement from public.stock_movements where id=p_operation_id;
    return jsonb_build_object('product_id',p_product_id,'previous_stock',v_receipt.previous_stock,
      'new_stock',v_receipt.new_stock,'new_cost',v_receipt.new_cost,'movement',to_jsonb(v_movement),'replayed',true);
  end if;
  select * into v_product from public.products where id=p_product_id for update;
  if not found or v_product.active is not true then raise exception 'Producto activo no encontrado.'; end if;
  if exists(select 1 from public.product_variants where product_id=p_product_id and active is true) then
    if (select count(*) from public.product_variants where product_id=p_product_id and active is true and name=v_name)<>1 then
      raise exception 'La variante debe coincidir con un unico talle activo.';
    end if;
    select * into v_variant from public.product_variants
      where product_id=p_product_id and active is true and name=v_name for update;
    if not found then raise exception 'Seleccioná el talle o variante de la entrada.'; end if;
    -- Se conserva el costo compartido vigente como base inicial, sin inventar un costo antiguo.
    insert into public.internal_variant_average_costs(variant_id,product_id,cost_price)
      select id,product_id,coalesce(v_product.cost_price,0) from public.product_variants
      where product_id=p_product_id on conflict (variant_id) do nothing;
    select cost_price into v_cost from public.internal_variant_average_costs where variant_id=v_variant.id;
    v_previous:=v_variant.stock;
  else
    if v_name<>'' then raise exception 'La variante no corresponde a este producto.'; end if;
    v_previous:=v_product.stock;
    v_cost:=v_product.cost_price;
  end if;
  if v_previous is null or v_previous < 0 or (v_previous>0 and coalesce(v_cost,0)<=0) then
    raise exception 'Falta el costo del stock existente. No se calculará un promedio con costo cero.';
  end if;
  v_next:=v_previous+p_quantity;
  v_average:=round((v_previous*coalesce(v_cost,0)+p_quantity*p_unit_cost)/v_next,6);
  if v_variant.id is not null then
    update public.product_variants set stock=v_next where id=v_variant.id;
    update public.internal_variant_average_costs set cost_price=v_average where variant_id=v_variant.id;
    -- Solo actualiza el costo agregado; no cambia el stock base ni otros talles.
    update public.products p set cost_price=(
      select sum(v.stock*c.cost_price)/nullif(sum(v.stock),0)
      from public.product_variants v join public.internal_variant_average_costs c on c.variant_id=v.id
      where v.product_id=p.id and v.active is true
    ) where p.id=p_product_id;
  else
    update public.products set stock=v_next,cost_price=v_average where id=p_product_id
      returning cost_price into v_average;
  end if;
  insert into public.stock_movements(id,product_id,product_name,movement_type,reason,quantity,stock_unit,
    previous_stock,new_stock,order_id,user_id,user_email,unit_cost,previous_cost,new_cost,total_cost)
  values(p_operation_id,p_product_id,v_product.name,'add',
    v_reason||case when v_name<>'' then ': '||v_name else '' end,p_quantity,v_product.stock_unit,
    v_previous,v_next,null,auth.uid(),null,null,null,null,null)
  returning * into v_movement;
  insert into public.internal_stock_cost_receipts(operation_id,product_id,variant_name,quantity,incoming_cost,
    previous_stock,previous_cost,new_stock,new_cost,reason,user_id)
  values(p_operation_id,p_product_id,v_name,p_quantity,p_unit_cost,v_previous,coalesce(v_cost,0),
    v_next,v_average,v_reason,auth.uid());
  return jsonb_build_object('product_id',p_product_id,'previous_stock',v_previous,'new_stock',v_next,
    'new_cost',v_average,'movement',to_jsonb(v_movement),'replayed',false);
end;
$$;
revoke all on function public.internal_receive_stock_weighted(uuid,numeric,numeric,text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.internal_receive_stock_weighted(uuid,numeric,numeric,text,uuid,text,text) to authenticated;

-- Misma RPC Admin: agrega costos individuales protegidos para variantes antiguas.
drop function public.internal_admin_products_with_cost(text);
create function public.internal_admin_products_with_cost(p_profile_token text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public
as $$
declare v_result jsonb;
begin
  if not public.internal_is_admin_profile(p_profile_token) then
    raise exception 'Se requiere el perfil Administrador.' using errcode='42501';
  end if;
  select coalesce(jsonb_agg(to_jsonb(p)||jsonb_build_object('category_name',c.name,
    'cost_price',coalesce((select sum(v.stock*coalesce(vc.cost_price,p.cost_price))/nullif(sum(v.stock),0)
      from public.product_variants v left join public.internal_variant_average_costs vc on vc.variant_id=v.id
      where v.product_id=p.id and v.active is true),p.cost_price),
    'variant_costs',coalesce((select jsonb_object_agg(v.name,coalesce(vc.cost_price,p.cost_price))
      from public.product_variants v left join public.internal_variant_average_costs vc on vc.variant_id=v.id
      where v.product_id=p.id and v.active is true),'{}'::jsonb)) order by p.sort_order,p.name),'[]'::jsonb)
  into v_result from public.products p left join public.categories c on c.id=p.category_id where p.active is true;
  return v_result;
end;
$$;
revoke all on function public.internal_admin_products_with_cost(text) from public,anon,authenticated;
grant execute on function public.internal_admin_products_with_cost(text) to authenticated;

-- Solo cambia la captura FUTURA. Una copia ya existente nunca se sobrescribe.
create or replace function public.internal_capture_sale_financials(p_order_id uuid,p_existing boolean default false)
returns void language plpgsql security definer set search_path=pg_catalog,public
as $$
declare v_order public.orders%rowtype; v_items jsonb; v_cost numeric; v_missing bigint;
begin
  if exists(select 1 from public.internal_sale_financial_snapshots where order_id=p_order_id) then return; end if;
  select * into v_order from public.orders where id=p_order_id for update;
  if not found or v_order.status<>'Pagado' then return; end if;
  if exists(select 1 from public.order_items i where i.order_id=p_order_id and
    (select count(*) from public.product_variants v where v.product_id=i.product_id and v.name=i.variant_name and v.active is true)>1) then
    raise exception 'Hay talles duplicados: no se puede fijar un costo inequivoco.';
  end if;
  -- El mismo bloqueo que una recepcion: se lee un costo confirmado, no uno concurrente.
  perform p.id from public.products p where p.id in
    (select product_id from public.order_items where order_id=p_order_id) order by p.id for share;
  with item_values as (
    select i.*,
      case when i.presentation ~* 'pack\s*x\s*[0-9]+' then
        greatest(1,substring(i.presentation from '(?i)pack\s*x\s*([0-9]+)')::numeric)
      when i.presentation ~* 'docena' then case when i.stock_unit='docenas' then 1 else 12 end
      else 1 end as multiplier,
      case when exists(select 1 from public.product_variants av where av.product_id=p.id and av.active is true)
        and v.id is null then null else coalesce(vc.cost_price,p.cost_price) end as catalog_cost
    from public.order_items i left join public.products p on p.id=i.product_id
    left join public.product_variants v on v.product_id=p.id and v.name=i.variant_name and v.active is true
    left join public.internal_variant_average_costs vc on vc.variant_id=v.id
    where i.order_id=p_order_id
  ), resolved as (
    select i.*,
      case when p_existing and i.unit_cost>0 then i.unit_cost
        when i.catalog_cost>0 then i.catalog_cost*i.multiplier
        else null end as frozen_cost,
      case when p_existing and i.unit_cost>0 then 'recorded'
        when i.catalog_cost>0 and p_existing then 'estimated'
        when i.catalog_cost>0 then 'confirmed' else 'missing' end as source
    from item_values i
  ) select coalesce(jsonb_agg(jsonb_build_object(
    'id',i.id,'product_id',i.product_id,'product_name',i.product_name,
    'variant_name',i.variant_name,'presentation',i.presentation,'stock_unit',i.stock_unit,
    'quantity',i.quantity,'unit_price',i.unit_price,'unit_cost',i.frozen_cost,
    'subtotal',i.subtotal,'cost_source',i.source,
    'net_revenue',case when v_order.subtotal>0 then i.subtotal*v_order.total/v_order.subtotal else 0 end,
    'net_unit_price',case when v_order.subtotal>0 and i.quantity>0 then i.subtotal*v_order.total/v_order.subtotal/i.quantity else 0 end,
    'cost_total',i.frozen_cost*i.quantity,
    'gross_profit',(case when v_order.subtotal>0 then i.subtotal*v_order.total/v_order.subtotal else 0 end)-i.frozen_cost*i.quantity,
    'margin_percent',case when v_order.total>0 and i.subtotal>0 then
      (1-i.frozen_cost*i.quantity/(i.subtotal*v_order.total/v_order.subtotal))*100 else 0 end,
    'markup_percent',case when i.frozen_cost*i.quantity>0 then
      ((case when v_order.subtotal>0 then i.subtotal*v_order.total/v_order.subtotal else 0 end)/(i.frozen_cost*i.quantity)-1)*100 end,
    'cost_per_stock_unit',case when i.multiplier>0 then i.frozen_cost/i.multiplier end,
    'stock_units_per_presentation',i.multiplier
  ) order by i.created_at,i.id),'[]'::jsonb),sum(i.frozen_cost*i.quantity),
    count(*) filter(where i.frozen_cost is null) into v_items,v_cost,v_missing from resolved i;
  if jsonb_array_length(v_items)=0 then raise exception 'No se puede fijar una venta sin productos.'; end if;
  if v_missing>0 and not p_existing then
    raise exception 'Falta el costo vigente de % renglones. No se confirmara una ganancia ficticia.',v_missing;
  end if;
  insert into public.internal_sale_financial_snapshots(order_id,created_at,paid_at,total,items,cost_total)
    values(v_order.id,v_order.created_at,coalesce(v_order.paid_at,v_order.created_at),v_order.total,v_items,
      case when v_missing=0 then v_cost else null end) on conflict(order_id) do nothing;
end;
$$;
revoke all on function public.internal_capture_sale_financials(uuid,boolean) from public,anon,authenticated;

create or replace function public.internal_admin_historical_sales(p_profile_token text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public
as $$
declare v_result jsonb;
begin
  if not public.internal_is_admin_profile(p_profile_token) then
    raise exception 'Se requiere el perfil Administrador.' using errcode='42501';
  end if;
  if exists(select 1 from public.orders o left join public.internal_sale_financial_snapshots s on s.order_id=o.id
    where o.status='Pagado' and s.order_id is null) then
    raise exception 'Hay ventas pagadas sin registro financiero historico. No se calculara una rentabilidad incompleta.';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',s.order_id,'status',o.status,'created_at',s.created_at,
    'paid_at',s.paid_at,'total',s.total,'order_items',s.items,'cost_total',s.cost_total,
    'gross_profit',s.gross_profit,'margin_percent',s.margin_percent,'markup_percent',s.markup_percent,
    'order_number',o.order_number,'origin',o.origin) order by s.paid_at desc,s.order_id),'[]'::jsonb)
  into v_result from public.internal_sale_financial_snapshots s join public.orders o on o.id=s.order_id
  where o.status='Pagado';
  return v_result;
end;
$$;
revoke all on function public.internal_admin_historical_sales(text) from public,anon,authenticated;
grant execute on function public.internal_admin_historical_sales(text) to authenticated;

commit;

select 'profitability_consistency_ready' as result,
  (select count(*) from public.internal_sale_financial_snapshots) as unchanged_frozen_sales,
  (select count(*) from public.internal_sale_financial_snapshots s,lateral jsonb_array_elements(s.items) i
    where i->>'cost_source'='estimated') as preserved_estimated_lines,
  (select coalesce(jsonb_agg(jsonb_build_object('order_id',s.order_id,'order_number',o.order_number,
    'product_id',i->>'product_id','product',i->>'product_name','variant',i->>'variant_name',
    'presentation',i->>'presentation','quantity',i->'quantity','frozen_cost_per_presentation',i->'unit_cost',
    'frozen_line_cost',(i->>'unit_cost')::numeric*(i->>'quantity')::numeric,
    'source',i->>'cost_source','captured_at',s.captured_at) order by s.paid_at,s.order_id),'[]'::jsonb)
    from public.internal_sale_financial_snapshots s join public.orders o on o.id=s.order_id,
      lateral jsonb_array_elements(s.items) i where i->>'cost_source' in ('estimated','missing')) as historical_cost_details,
  has_function_privilege('authenticated','public.internal_receive_stock_weighted(uuid,numeric,numeric,text,uuid,text,text)','execute') as authenticated_can_execute,
  has_function_privilege('anon','public.internal_receive_stock_weighted(uuid,numeric,numeric,text,uuid,text,text)','execute') as anon_can_execute;
