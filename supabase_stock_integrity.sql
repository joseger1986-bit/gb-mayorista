-- Forward-only. No backfill or DML on existing stock, movements or orders.
begin;

create table if not exists public.internal_stock_requests (
  id uuid primary key,
  actor uuid not null,
  kind text not null,
  request jsonb not null,
  result jsonb
);
alter table public.internal_stock_requests enable row level security;
revoke all on public.internal_stock_requests from public,anon,authenticated;

create or replace function public.internal_guard_direct_stock()
returns trigger language plpgsql set search_path=pg_catalog,public as $$
begin
  if current_user in ('anon','authenticated') then
    if tg_op='DELETE' then
      if coalesce(old.stock,0)<>0 then
        raise exception 'Retira el stock antes de eliminar este registro.' using errcode='42501';
      end if;
      return old;
    end if;
    if new.stock is distinct from old.stock then
      raise exception 'El stock se modifica solo mediante una operacion registrada.' using errcode='42501';
    end if;
  end if;
  if tg_op='DELETE' then return old; end if;
  return new;
end $$;
drop trigger if exists pxm_guard_product_stock on public.products;
create trigger pxm_guard_product_stock before update of stock or delete on public.products
for each row execute function public.internal_guard_direct_stock();
drop trigger if exists pxm_guard_variant_stock on public.product_variants;
create trigger pxm_guard_variant_stock before update of stock or delete on public.product_variants
for each row execute function public.internal_guard_direct_stock();

create or replace function public.internal_guard_order_stock()
returns trigger language plpgsql set search_path=pg_catalog,public as $$
begin
  if current_user in ('anon','authenticated') and
    (new.stock_applied is distinct from old.stock_applied or
    (new.status is distinct from old.status and (new.status='Pagado' or old.status='Pagado'))) then
    raise exception 'El pago y su stock se confirman juntos desde Gestion.' using errcode='42501';
  end if;
  return new;
end $$;
drop trigger if exists pxm_guard_order_stock on public.orders;
create trigger pxm_guard_order_stock before update of stock_applied,status on public.orders
for each row execute function public.internal_guard_order_stock();

create or replace function public.internal_log_initial_stock()
returns trigger language plpgsql security definer set search_path=pg_catalog,public as $$
declare p public.products%rowtype; v_reason text;
begin
  if coalesce(new.stock,0)=0 then return new; end if;
  if new.stock<0 then raise exception 'Stock inicial invalido.'; end if;
  if tg_table_name='products' then
    p:=new; v_reason:='Stock inicial';
  else
    select * into strict p from public.products where id=new.product_id;
    v_reason:='Stock inicial: '||new.name;
  end if;
  insert into public.stock_movements(product_id,product_name,movement_type,reason,quantity,stock_unit,
    previous_stock,new_stock,user_id,user_email)
  values(p.id,p.name,'add',v_reason,new.stock,p.stock_unit,0,new.stock,auth.uid(),null);
  return new;
end $$;
drop trigger if exists pxm_log_initial_product_stock on public.products;
create trigger pxm_log_initial_product_stock after insert on public.products
for each row execute function public.internal_log_initial_stock();
drop trigger if exists pxm_log_initial_variant_stock on public.product_variants;
create trigger pxm_log_initial_variant_stock after insert on public.product_variants
for each row execute function public.internal_log_initial_stock();

create or replace function public.internal_sync_product_metadata(p_products jsonb)
returns jsonb language plpgsql security invoker set search_path=pg_catalog,public as $$
declare r jsonb; v_id uuid; v_cols text; v_values text; v_assign text; v_ids jsonb:='[]';
begin
  if auth.uid() is null then raise exception 'Inicia sesion en Gestion.' using errcode='42501'; end if;
  for r in select value from jsonb_array_elements(p_products) order by value->>'id' loop
    v_id:=(r->>'id')::uuid;
    select string_agg(format('%I',k),',' order by k),string_agg(format('x.%I',k),',' order by k),
           string_agg(format('%I=excluded.%I',k,k),',' order by k)
      into v_cols,v_values,v_assign from jsonb_object_keys(r) k
      where k in ('category_id','name','brand','presentation','sale_price','cost_price','show_in_catalog',
        'image_path','active','sort_order','description','gallery_images','stock_unit','base_name','option_name','assortment_name');
    execute format('insert into public.products(id,stock,%s)
      select x.id,coalesce(($1->>''initial_stock'')::numeric,0),%s from jsonb_populate_record(null::public.products,$1) x
      on conflict(id) do update set %s returning id',v_cols,v_values,v_assign)
      into strict v_id using r;
    v_ids:=v_ids||jsonb_build_array(jsonb_build_object('id',v_id));
  end loop;
  return v_ids;
end $$;

create or replace function public.internal_sync_variant_metadata(p_variants jsonb)
returns jsonb language plpgsql security invoker set search_path=pg_catalog,public as $$
declare r public.product_variants%rowtype; v_id uuid; v_ids jsonb:='[]';
begin
  if auth.uid() is null then raise exception 'Inicia sesion en Gestion.' using errcode='42501'; end if;
  for r in select * from jsonb_populate_recordset(null::public.product_variants,p_variants) order by product_id,name loop
    perform pg_advisory_xact_lock(hashtextextended(r.product_id::text||':'||r.name,147));
    select id into v_id from public.product_variants where product_id=r.product_id and name=r.name order by active desc,id limit 1;
    if not found then
      insert into public.product_variants(product_id,name,presentation,sale_price,stock,active,sort_order)
      values(r.product_id,r.name,r.presentation,r.sale_price,0,true,r.sort_order) returning id into v_id;
    end if;
    v_ids:=v_ids||jsonb_build_array(jsonb_build_object('id',v_id));
  end loop;
  return v_ids;
end $$;

create or replace function public.internal_confirm_order_stock(
  p_order_id uuid,p_expected_updated_at timestamptz,p_order jsonb,p_items jsonb
) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare o public.orders%rowtype; p public.products%rowtype; v public.product_variants%rowtype;
  ln record; v_prev numeric; v_next numeric; v_variants bigint; v_expected bigint;
begin
  if auth.uid() is null then raise exception 'Inicia sesion en Gestion.' using errcode='42501'; end if;
  select * into strict o from public.orders where id=p_order_id for update;
  if o.origin not in ('web','local') or o.deleted_at is not null then raise exception 'Pedido no disponible.'; end if;
  if o.status='Pagado' and o.stock_applied then return public.purchase_order_result(o.id); end if;
  if o.status not in ('En revisión','Pendiente') or coalesce(o.stock_applied,false) then
    raise exception 'El estado del pedido requiere revision. No se desconto stock.';
  end if;
  if p_expected_updated_at is distinct from o.updated_at then
    raise exception 'El pedido cambio. Actualiza Gestion antes de confirmar.';
  end if;
  if exists(select 1 from public.stock_movements where order_id=o.id) then
    raise exception 'El pedido ya tiene movimientos. Requiere revision antes de confirmar.';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items)=0 then
    raise exception 'El pedido no tiene productos.';
  end if;
  perform public.validate_catalog_minimum_order_items(o.id,p_items);
  perform p0.id from public.products p0 where p0.id in
    (select (j->>'product_id')::uuid from jsonb_array_elements(p_items) j)
    order by p0.id for update;
  delete from public.order_items where order_id=o.id;
  insert into public.order_items(order_id,product_id,product_name,variant_name,presentation,
    stock_unit,quantity,unit_price,unit_cost,subtotal,prepared,purchase_details)
  select o.id,p0.id,coalesce(j->>'product_name',p0.name),coalesce(j->>'variant_name',''),j->>'presentation',
    p0.stock_unit,(j->>'quantity')::integer,(j->>'unit_price')::numeric,0,
    (j->>'quantity')::numeric*(j->>'unit_price')::numeric,coalesce((j->>'prepared')::boolean,false),j->'purchase_details'
  from jsonb_array_elements(p_items) j join public.products p0 on p0.id=(j->>'product_id')::uuid
  where (j->>'quantity')::integer>0 and (j->>'unit_price')::numeric>=0
    and coalesce(j->>'stock_unit','')=p0.stock_unit;
  get diagnostics v_expected=row_count;
  if v_expected<>jsonb_array_length(p_items) then raise exception 'Productos o unidades de stock invalidos.'; end if;

  for ln in select i.product_id,
    case when exists(select 1 from public.product_variants pv where pv.product_id=i.product_id and pv.active)
      then i.variant_name else '' end as variant,
    sum(i.quantity*case
      when i.presentation ~* 'pack\s*x\s*[0-9]+' then greatest(1,substring(i.presentation from '(?i)pack\s*x\s*([0-9]+)')::numeric)
      when i.presentation ~* 'docena' then case when i.stock_unit='docenas' then 1 else 12 end
      else 1 end) as qty
    from public.order_items i where i.order_id=o.id group by 1,2 order by 1,2
  loop
    select * into strict p from public.products where id=ln.product_id;
    select count(*) into v_variants from public.product_variants pv where pv.product_id=p.id and pv.active;
    if v_variants>0 then
      select * into strict v from public.product_variants pv where pv.product_id=p.id and pv.active and pv.name=ln.variant for update;
      v_prev:=coalesce(v.stock,0);
    else
      v_prev:=coalesce(p.stock,0);
    end if;
    v_next:=v_prev-ln.qty;
    if v_next<0 then raise exception 'Stock insuficiente para % %.',p.name,ln.variant; end if;
    if v_variants>0 then
      update public.product_variants set stock=v_next where id=v.id;
    else
      update public.products set stock=v_next where id=p.id;
    end if;
    insert into public.stock_movements(product_id,product_name,movement_type,reason,quantity,stock_unit,
      previous_stock,new_stock,order_id,user_id,user_email)
    values(p.id,p.name,'subtract',case when v_variants>0 then 'Venta: '||ln.variant else 'Venta' end,
      ln.qty,p.stock_unit,v_prev,v_next,o.id,auth.uid(),null);
  end loop;
  update public.orders set status='Pagado',stock_applied=true,paid_at=now(),updated_at=now(),
    customer_name=coalesce(p_order->>'customer_name',o.customer_name),
    customer_phone=coalesce(p_order->>'customer_phone',o.customer_phone),
    customer_location=coalesce(p_order->>'customer_location',o.customer_location),
    payment_method=coalesce(p_order->>'payment_method',o.payment_method),
    delivery_notes=coalesce(p_order->>'delivery_notes',o.delivery_notes),
    subtotal=(select sum(subtotal) from public.order_items where order_id=o.id),
    total=(p_order->>'total')::numeric,discount_type=p_order->>'discount_type',
    discount_value=(p_order->>'discount_value')::numeric,discount_amount=(p_order->>'discount_amount')::numeric
  where id=o.id;
  return public.purchase_order_result(o.id);
end $$;

create or replace function public.internal_create_paid_sale(p_request_id uuid,p_order jsonb,p_items jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare r public.internal_stock_requests%rowtype; created jsonb; v_result jsonb; v_request jsonb;
begin
  if auth.uid() is null then raise exception 'Inicia sesion en Gestion.' using errcode='42501'; end if;
  v_request:=jsonb_build_object(
    'items',(select jsonb_agg(j.value-'unit_cost' order by j.ordinality)
             from jsonb_array_elements(p_items) with ordinality j),
    'order',p_order - 'updated_at' - 'paid_at');
  insert into public.internal_stock_requests(id,actor,kind,request)
  values(p_request_id,auth.uid(),'local_sale',v_request)
  on conflict(id) do nothing;
  select * into strict r from public.internal_stock_requests where id=p_request_id for update;
  if r.actor<>auth.uid() or r.kind<>'local_sale' then raise exception 'Identificador de operacion invalido.'; end if;
  if r.result is not null then
    if r.request<>v_request then raise exception 'La venta ya se guardo con otros datos. Revisa Pedidos.'; end if;
    return r.result;
  end if;
  created:=public.create_local_order(p_order||'{"status":"En revisión","stock_applied":false,"paid_at":null}'::jsonb,p_items);
  v_result:=public.internal_confirm_order_stock((created->'order'->>'id')::uuid,
    (created->'order'->>'updated_at')::timestamptz,p_order,p_items);
  update public.internal_stock_requests set result=v_result where id=p_request_id;
  return v_result;
end $$;

create or replace function public.internal_adjust_stock_once(
  p_request_id uuid,p_product_id uuid,p_type text,p_quantity numeric,p_reason text,p_expected_stock numeric default null
) returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare r public.internal_stock_requests%rowtype; v_request jsonb; v_result jsonb; v_stock numeric;
begin
  if auth.uid() is null then raise exception 'Inicia sesion en Gestion.' using errcode='42501'; end if;
  v_request:=jsonb_build_array(p_product_id,p_type,p_quantity,p_reason,p_expected_stock);
  insert into public.internal_stock_requests(id,actor,kind,request)
  values(p_request_id,auth.uid(),'adjustment',v_request) on conflict(id) do nothing;
  select * into strict r from public.internal_stock_requests where id=p_request_id for update;
  if r.actor<>auth.uid() or r.kind<>'adjustment' or r.request<>v_request then
    raise exception 'Identificador de operacion invalido.';
  end if;
  if r.result is not null then return r.result; end if;
  if p_expected_stock is not null then
    select stock into strict v_stock from public.products where id=p_product_id for update;
    if v_stock is distinct from p_expected_stock then
      raise exception 'El stock cambio durante la importacion. Actualiza antes de volver a intentar.';
    end if;
  end if;
  v_result:=public.adjust_product_stock(p_product_id,p_type,p_quantity,p_reason,null,null);
  v_result:=jsonb_set(v_result,'{movement}',(v_result->'movement') -
    array['unit_cost','previous_cost','new_cost','total_cost','user_email']);
  update public.internal_stock_requests set result=v_result where id=p_request_id;
  return v_result;
end $$;

create or replace function public.internal_import_product_stock(
  p_request_id uuid,p_product_id uuid,p_expected numeric,p_target numeric,p_metadata jsonb,
  p_expected_sale numeric,p_expected_cost numeric
) returns jsonb language plpgsql security invoker set search_path=pg_catalog,public as $$
declare v_result jsonb; v_assign text; v_count bigint; v_delta numeric;
begin
  if p_expected is null or p_target is null or p_target<0 or trunc(p_target)<>p_target then
    raise exception 'Stock de importacion invalido.';
  end if;
  v_delta:=p_target-p_expected;
  v_result:=public.internal_adjust_stock_once(p_request_id,p_product_id,
    case when v_delta>0 then 'entrada' else 'salida' end,abs(v_delta),'Importacion Excel',p_expected);
  select string_agg(format('%I=x.%I',k,k),',' order by k) into v_assign from jsonb_object_keys(p_metadata) k
    where k in ('category_id','name','brand','presentation','sale_price','cost_price','show_in_catalog',
      'image_path','description','gallery_images','stock_unit','base_name','option_name','assortment_name');
  if v_assign is not null then
    execute format('update public.products p set %s,updated_at=now()
      from jsonb_populate_record(null::public.products,$1) x where p.id=$2 and p.active
      and (not ($1 ? ''sale_price'') or coalesce(p.sale_price,0)=$3)
      and (not ($1 ? ''cost_price'') or coalesce(p.cost_price,0)=$4)',v_assign)
      using p_metadata,p_product_id,p_expected_sale,p_expected_cost;
    get diagnostics v_count=row_count;
    if v_count<>1 then raise exception 'El producto cambio durante la importacion.'; end if;
  end if;
  return v_result;
end $$;

revoke all on function public.internal_sync_product_metadata(jsonb),public.internal_sync_variant_metadata(jsonb),
  public.internal_confirm_order_stock(uuid,timestamptz,jsonb,jsonb),public.internal_create_paid_sale(uuid,jsonb,jsonb),
  public.internal_adjust_stock_once(uuid,uuid,text,numeric,text,numeric) from public,anon;
grant execute on function public.internal_sync_product_metadata(jsonb),public.internal_sync_variant_metadata(jsonb),
  public.internal_confirm_order_stock(uuid,timestamptz,jsonb,jsonb),public.internal_create_paid_sale(uuid,jsonb,jsonb),
  public.internal_adjust_stock_once(uuid,uuid,text,numeric,text,numeric) to authenticated;
revoke all on function public.internal_import_product_stock(uuid,uuid,numeric,numeric,jsonb,numeric,numeric) from public,anon;
grant execute on function public.internal_import_product_stock(uuid,uuid,numeric,numeric,jsonb,numeric,numeric) to authenticated;
revoke insert on public.stock_movements from public,anon,authenticated;
revoke execute on function public.create_local_order(jsonb,jsonb),
  public.adjust_product_stock(uuid,text,numeric,text,uuid,numeric) from public,anon,authenticated;
commit;

select 'stock_integrity_ready' as result,
  has_function_privilege('authenticated','public.internal_confirm_order_stock(uuid,timestamptz,jsonb,jsonb)','execute') as authenticated_can_confirm,
  has_function_privilege('anon','public.internal_confirm_order_stock(uuid,timestamptz,jsonb,jsonb)','execute') as anon_can_confirm;
