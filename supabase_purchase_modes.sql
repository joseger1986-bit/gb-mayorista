-- Punto X Mayor: modalidades de compra. Ejecutar completo, una sola transaccion.
-- No actualiza products, stock, precios, costos ni pedidos/movimientos historicos.
begin;

create table if not exists public.product_pack_settings (
  product_id uuid primary key references public.products(id) on delete cascade,
  mode text not null default 'same' check (mode in ('same','custom')),
  quantity integer not null default 1 check (quantity between 1 and 1000000),
  enabled boolean not null default true,
  base_kind text not null default 'unit' check (base_kind in ('unit','dozen','valijita','presentation')),
  mix_group text,
  revision bigint not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.product_pack_settings enable row level security;
revoke all on public.product_pack_settings from public,anon,authenticated;
grant select on public.product_pack_settings to anon,authenticated;
drop policy if exists catalog_read_pack_settings on public.product_pack_settings;
create policy catalog_read_pack_settings on public.product_pack_settings for select to anon,authenticated
using (auth.uid() is not null or exists(select 1 from public.products_safe_catalog p where p.id=product_id and p.active is true and p.show_in_catalog is true));

alter table public.orders add column if not exists purchase_mode text;
alter table public.orders add column if not exists purchase_request_id uuid;
alter table public.orders add column if not exists purchase_request_hash text;
alter table public.order_items add column if not exists purchase_details jsonb;
create unique index if not exists orders_purchase_request_id_key on public.orders(purchase_request_id) where purchase_request_id is not null;

-- Respuestas comerciales por lista blanca: nunca devuelven costos ni rentabilidad.
create or replace function public.purchase_order_result(p_id uuid)
returns jsonb language sql stable security definer set search_path=pg_catalog,public as $$
  select jsonb_build_object('order',jsonb_build_object(
    'id',o.id,'order_number',o.order_number,'origin',o.origin,'status',o.status,
    'stock_applied',o.stock_applied,'customer_name',o.customer_name,'customer_phone',o.customer_phone,
    'customer_location',o.customer_location,'payment_method',o.payment_method,'delivery_type',o.delivery_type,
    'delivery_notes',o.delivery_notes,'subtotal',o.subtotal,'total',o.total,'discount_type',o.discount_type,
    'discount_value',o.discount_value,'discount_amount',o.discount_amount,'created_at',o.created_at,
    'updated_at',o.updated_at,'paid_at',o.paid_at,'deleted_at',o.deleted_at,'manual_revision',o.manual_revision,
    'purchase_mode',o.purchase_mode),
    'items',coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'order_id',i.order_id,
      'product_id',i.product_id,'product_name',i.product_name,'variant_name',i.variant_name,
      'presentation',i.presentation,'stock_unit',i.stock_unit,'quantity',i.quantity,'unit_price',i.unit_price,
      'subtotal',i.subtotal,'prepared',i.prepared,'created_at',i.created_at,'purchase_details',i.purchase_details)
      order by i.created_at,i.id) from public.order_items i where i.order_id=o.id),'[]'::jsonb))
  from public.orders o where o.id=p_id;
$$;
revoke all on function public.purchase_order_result(uuid) from public,anon,authenticated;

create or replace function public.catalog_stock_factor(p_presentation text,p_stock_unit text)
returns numeric language plpgsql immutable set search_path=pg_catalog as $$
declare m text[];
begin
  m:=regexp_match(lower(coalesce(p_presentation,'')),'pack\s*x\s*([0-9]+)');
  if m is not null then return greatest(1,m[1]::numeric); end if;
  if lower(coalesce(p_presentation,'')) like '%docena%' and p_stock_unit<>'docenas' then return 12; end if;
  return 1;
end $$;

create or replace function public.catalog_purchase_spec(p_product_id uuid,p_mode text,p_variant text default '')
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,public as $$
declare p public.products%rowtype; c public.product_pack_settings%rowtype;
  v public.product_variants%rowtype; factor numeric; price numeric; qty integer:=1;
  kind text; noun text; label text; canonical text; stock numeric; variant_count integer;
begin
  if p_mode is null or p_mode not in ('surtida','packs') then raise exception 'Modalidad invalida.'; end if;
  select * into p from public.products where id=p_product_id and active is true and show_in_catalog is true;
  if not found then raise exception 'El producto no esta disponible.'; end if;
  p.stock_unit:=case when lower(coalesce(p.stock_unit,'')) like '%docena%' then 'docenas'
    when nullif(trim(p.stock_unit),'') is null and lower(p.presentation) like '%docena%' then 'docenas' else 'unidades' end;
  price:=p.sale_price; stock:=p.stock;
  select count(*) into variant_count from public.product_variants where product_id=p.id and active is true;
  if variant_count>0 then
    select * into v from public.product_variants where product_id=p.id and active is true and name=p_variant;
    if not found then raise exception 'Elegí una variante disponible.'; end if;
    price:=coalesce(v.sale_price,price); stock:=v.stock;
  end if;
  if price is null or price<=0 then raise exception 'Falta el precio vigente del producto.'; end if;
  select * into c from public.product_pack_settings where product_id=p.id;
  if not found then
    c.mode:='same';c.quantity:=1;c.enabled:=true;c.revision:=0;
    c.base_kind:=case when p.stock_unit='docenas' or lower(p.presentation) like '%docena%' then 'dozen'
      when lower(p.presentation) ~ 'unidad|pack' then 'unit' else 'presentation' end;
  end if;
  if p_mode='packs' and not c.enabled then raise exception 'Este producto no se ofrece por packs.'; end if;
  canonical:=p.presentation;
  factor:=public.catalog_stock_factor(p.presentation,p.stock_unit);
  kind:=case when c.base_kind='valijita' then 'valijita'
    when p.stock_unit='docenas' or lower(p.presentation) like '%docena%' then 'dozen'
    when lower(p.presentation) ~ 'unidad|pack' then 'unit' else 'presentation' end;
  if p_mode='packs' and c.mode='custom' then
    qty:=c.quantity;
    factor:=case when kind='valijita' then 2 when kind='dozen' and p.stock_unit<>'docenas' then 12
      when kind='presentation' then factor else 1 end;
    canonical:=case kind when 'valijita' then 'Pack x2 unidades' when 'dozen' then 'Docena' when 'unit' then 'Unidad' else p.presentation end;
  end if;
  noun:=case kind when 'valijita' then 'valijitas' when 'dozen' then 'docenas' when 'presentation' then
    case when lower(p.presentation) like '%valijita%' then 'valijitas' when lower(p.presentation) like '%juego%' then 'juegos'
      when lower(p.presentation) ~ '\mpar(es)?\M' then 'pares' else 'presentaciones' end else 'unidades' end;
  label:=case when p_mode='surtida' or c.mode='same' then p.presentation
    when kind='valijita' then format('Pack x%s valijitas (%s juegos)',qty,qty*2)
    when qty=1 and kind='dozen' then 'Docena' else format('Pack x%s %s',qty,noun) end;
  price:=case when p_mode='surtida' or c.mode='same' then round(price*factor) else price*factor end;
  return jsonb_build_object('presentation',label,'quantity',qty,'orderPresentation',canonical,'orderUnitPrice',price,
    'price',price*qty,'stockPerBase',factor,'stock',greatest(0,coalesce(stock,0)),'kind',kind,'noun',noun,
    'revision',c.revision,'same',p_mode='surtida' or c.mode='same','mixGroup',case when p_mode='packs' and c.mode='custom' then c.mix_group else null end,
    'productName',p.name,'stockUnit',p.stock_unit,'variantName',p_variant);
end $$;

create or replace function public.internal_set_product_pack(p_product_id uuid,p_profile_token text,p_mode text,p_quantity integer,p_enabled boolean,p_revision bigint)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare c public.product_pack_settings%rowtype; p public.products%rowtype;
begin
  if not coalesce(public.internal_is_admin_profile(p_profile_token),false) then raise exception 'Solo Administrador puede configurar packs.' using errcode='42501'; end if;
  if p_mode is null or p_mode not in ('same','custom') or p_quantity is null or p_quantity not between 1 and 1000000 or p_enabled is null then raise exception 'Configuracion invalida.'; end if;
  perform pg_advisory_xact_lock(hashtextextended('pack-config:'||p_product_id::text,0));
  select * into p from public.products where id=p_product_id;
  if not found then raise exception 'El producto no existe.'; end if;
  insert into public.product_pack_settings(product_id,base_kind) values(p.id,
    case when p.stock_unit='docenas' or lower(p.presentation) like '%docena%' then 'dozen' when lower(p.presentation) ~ 'unidad|pack' then 'unit' else 'presentation' end)
    on conflict(product_id) do nothing;
  select * into c from public.product_pack_settings where product_id=p.id for update;
  if p_revision is null or c.revision<>p_revision then raise exception 'Otro usuario modifico el pack. Volve a abrir el producto.' using errcode='40001'; end if;
  update public.product_pack_settings set mode=p_mode,quantity=case when p_mode='same' then 1 else p_quantity end,
    enabled=p_enabled,revision=revision+1,updated_at=now() where product_id=p.id returning * into c;
  return to_jsonb(c);
end $$;

-- Conserva la implementacion actual de guardado y sus triggers; solo agrega validacion previa.
do $$ begin
  if to_regprocedure('public.pxm_create_web_order_legacy(jsonb,jsonb)') is null then
    alter function public.create_web_order(jsonb,jsonb) rename to pxm_create_web_order_legacy;
  end if;
  if to_regprocedure('public.pxm_manual_order_legacy(uuid,text,text,bigint,jsonb,jsonb)') is null then
    alter function public.internal_manual_order(uuid,text,text,bigint,jsonb,jsonb) rename to pxm_manual_order_legacy;
  end if;
  if to_regprocedure('public.pxm_create_local_order_legacy(jsonb,jsonb)') is null then
    alter function public.create_local_order(jsonb,jsonb) rename to pxm_create_local_order_legacy;
  end if;
end $$;
revoke all on function public.pxm_create_web_order_legacy(jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.pxm_manual_order_legacy(uuid,text,text,bigint,jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.pxm_create_local_order_legacy(jsonb,jsonb) from public,anon,authenticated;

create or replace function public.submit_catalog_order(order_payload jsonb,item_payload jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare mode text:=coalesce(order_payload->>'purchase_mode','surtida'); request_id uuid;
  fingerprint text; saved public.orders%rowtype; item jsonb; spec jsonb; details jsonb;
  canonical jsonb:='[]'; canonical_item jsonb; quantities jsonb:='{}'; batches jsonb:='{}'; batch jsonb;
  result jsonb; v_order_id uuid; quantity numeric; price numeric; total numeric:=0; k text; group_key text; old_qty numeric;
begin
  if mode not in ('surtida','packs') then raise exception 'Modalidad invalida.'; end if;
  if item_payload is null or jsonb_typeof(item_payload)<>'array' or jsonb_array_length(item_payload)=0 or jsonb_array_length(item_payload)>500 then raise exception 'Agrega productos al pedido.'; end if;
  if nullif(trim(order_payload->>'customer_name'),'') is null or nullif(trim(order_payload->>'customer_phone'),'') is null or nullif(trim(order_payload->>'customer_location'),'') is null then raise exception 'Completa nombre, telefono y localidad.'; end if;
  request_id:=nullif(order_payload->>'purchase_request_id','')::uuid;
  fingerprint:=md5((order_payload-'updated_at'-'purchase_request_id')::text||item_payload::text);
  if request_id is not null then
    perform pg_advisory_xact_lock(hashtextextended('web-purchase:'||request_id::text,0));
    select * into saved from public.orders where purchase_request_id=request_id;
    if found then
      if saved.purchase_request_hash<>fingerprint then raise exception 'El intento anterior ya fue guardado. Revisa el pedido antes de reenviar.'; end if;
      return public.purchase_order_result(saved.id);
    end if;
  end if;
  for item in select value from jsonb_array_elements(item_payload) loop
    quantity:=(item->>'quantity')::numeric;
    if quantity is null or quantity<=0 or quantity<>trunc(quantity) or quantity>1000000 then raise exception 'Cantidad invalida.'; end if;
    spec:=public.catalog_purchase_spec((item->>'product_id')::uuid,mode,coalesce(item->>'variant_name',''));
    price:=(spec->>'orderUnitPrice')::numeric;
    if nullif(item->>'presentation','') is distinct from spec->>'orderPresentation' or coalesce((item->>'unit_price')::numeric,-1)<>price then raise exception 'Cambio el precio o la presentacion. Actualiza el carrito antes de enviar.'; end if;
    k:=(item->>'product_id')||':'||coalesce(item->>'variant_name','');
    old_qty:=coalesce((quantities->>k)::numeric,0)+quantity*(spec->>'stockPerBase')::numeric;
    if old_qty>(spec->>'stock')::numeric then raise exception 'El carrito supera el stock disponible.'; end if;
    quantities:=jsonb_set(quantities,array[k],to_jsonb(old_qty));
    details:=null;
    if mode='packs' then
      details:=item->'purchase_details';
      if details is null or jsonb_typeof(details)<>'object' or nullif(details->>'packId','') is null
        or coalesce((details->>'packs')::numeric,0)<=0 or (details->>'packs')::numeric<>trunc((details->>'packs')::numeric)
        or coalesce((details->>'unitsPerPack')::integer,0)<>(spec->>'quantity')::integer
        or coalesce((details->>'allocated')::numeric,0)<>quantity
        or coalesce((details->>'revision')::bigint,-1)<>(spec->>'revision')::bigint then raise exception 'Pack incompleto o desactualizado.'; end if;
      perform (details->>'packId')::uuid;
      group_key:=coalesce(spec->>'mixGroup',item->>'product_id')||':'||price::text||':'||(spec->>'quantity')||':'||(spec->>'kind');
      batch:=batches->(details->>'packId');
      if batch is not null and (batch->>'key'<>group_key or (batch->>'packs')::numeric<>(details->>'packs')::numeric) then raise exception 'No se pueden mezclar esas variantes en un pack.'; end if;
      batch:=jsonb_build_object('key',group_key,'packs',(details->>'packs')::numeric,'total',coalesce((batch->>'total')::numeric,0)+quantity,'required',(details->>'packs')::numeric*(spec->>'quantity')::numeric);
      batches:=jsonb_set(batches,array[details->>'packId'],batch);
      details:=details||jsonb_build_object('presentation',spec->>'presentation','noun',spec->>'noun','same',spec->'same','mixed',spec->>'mixGroup' is not null);
    end if;
    canonical_item:=jsonb_build_object('product_id',item->>'product_id','product_name',spec->>'productName','variant_name',spec->>'variantName',
      'quantity',quantity,'unit_price',price,'unit_cost',0,'subtotal',quantity*price,'presentation',spec->>'orderPresentation','stock_unit',spec->>'stockUnit','purchase_details',details);
    canonical:=canonical||jsonb_build_array(canonical_item);total:=total+quantity*price;
  end loop;
  for batch in select value from jsonb_each(batches) loop
    if (batch->>'total')::numeric<>(batch->>'required')::numeric then raise exception 'Completa todas las cantidades del pack.'; end if;
  end loop;
  if mode='surtida' and total<150000 then raise exception 'La compra surtida requiere un total de $150.000.'; end if;
  if coalesce((order_payload->>'total')::numeric,-1)<>total then raise exception 'El total cambio. Revisa los precios vigentes.'; end if;
  result:=public.pxm_create_web_order_legacy(order_payload||jsonb_build_object('subtotal',total,'total',total,'discount_type','fixed','discount_value',0,'discount_amount',0,'status','En revisión','stock_applied',false),canonical);
  v_order_id:=(result->'order'->>'id')::uuid;
  if v_order_id is null then raise exception 'No se pudo verificar el pedido guardado.'; end if;
  update public.orders set purchase_mode=mode,purchase_request_id=request_id,purchase_request_hash=fingerprint where id=v_order_id returning * into saved;
  -- Solo los renglones recien creados reciben el detalle comercial; ningun pedido anterior se modifica.
  for item in select value from jsonb_array_elements(canonical) loop
    update public.order_items i set purchase_details=nullif(item->'purchase_details','null'::jsonb)
    where i.id=(select oi.id from public.order_items oi where oi.order_id=v_order_id
      and oi.product_id=(item->>'product_id')::uuid and oi.variant_name=coalesce(item->>'variant_name','')
      and oi.quantity=(item->>'quantity')::numeric and oi.unit_price=(item->>'unit_price')::numeric
      and oi.purchase_details is null order by oi.id limit 1);
  end loop;
  return public.purchase_order_result(v_order_id);
end $$;

-- Compatibilidad con el frontend anterior durante la transicion. No permite evitar la validacion.
create or replace function public.create_web_order(order_payload jsonb,item_payload jsonb)
returns jsonb language sql security definer set search_path=pg_catalog,public as $$
  select public.submit_catalog_order(order_payload,item_payload);
$$;

create or replace function public.internal_manual_order(p_order_id uuid,p_action text,p_profile_token text,p_revision bigint default 0,p_order_payload jsonb default '{}',p_items jsonb default '[]')
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare result jsonb; item jsonb; already_applied boolean;
begin
  perform pg_advisory_xact_lock(hashtextextended('manual-order:'||p_order_id::text,0));
  select stock_applied into already_applied from public.orders where id=p_order_id;
  result:=public.pxm_manual_order_legacy(p_order_id,p_action,p_profile_token,p_revision,p_order_payload,p_items);
  if p_action in ('save','pay') and not coalesce(already_applied,false) then
    update public.orders set purchase_mode=case when p_order_payload->>'purchase_mode'='packs' then 'packs' else 'habitual' end where id=p_order_id;
    for item in select value from jsonb_array_elements(p_items) loop
      update public.order_items i set purchase_details=case when (item->'purchase_details'->>'allocated')::numeric=i.quantity then item->'purchase_details' else null end
      where i.order_id=p_order_id and i.product_id=(item->>'product_id')::uuid and i.variant_name=coalesce(item->>'variant_name','');
    end loop;
  end if;
  return public.purchase_order_result(p_order_id);
end $$;

create or replace function public.create_local_order(order_payload jsonb,item_payload jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare result jsonb; v_id uuid; item jsonb;
begin
  if auth.uid() is null then raise exception 'Inicia sesion en Gestion.' using errcode='42501'; end if;
  result:=public.pxm_create_local_order_legacy(order_payload,item_payload);
  v_id:=(result->'order'->>'id')::uuid;
  if v_id is null then raise exception 'No se pudo verificar la venta guardada.'; end if;
  update public.orders set purchase_mode=case when order_payload->>'purchase_mode'='packs' then 'packs' else 'habitual' end where id=v_id;
  for item in select value from jsonb_array_elements(item_payload) loop
    update public.order_items i set purchase_details=case when (item->'purchase_details'->>'allocated')::numeric=i.quantity then item->'purchase_details' else null end
    where i.order_id=v_id and i.product_id=(item->>'product_id')::uuid and i.variant_name=coalesce(item->>'variant_name','');
  end loop;
  return public.purchase_order_result(v_id);
end $$;

revoke all on function public.catalog_stock_factor(text,text) from public,anon,authenticated;
revoke all on function public.catalog_purchase_spec(uuid,text,text) from public,anon,authenticated;
revoke all on function public.internal_set_product_pack(uuid,text,text,integer,boolean,bigint) from public,anon,authenticated;
revoke all on function public.submit_catalog_order(jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.create_web_order(jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.internal_manual_order(uuid,text,text,bigint,jsonb,jsonb) from public,anon,authenticated;
revoke all on function public.create_local_order(jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.catalog_purchase_spec(uuid,text,text) to anon,authenticated;
grant execute on function public.submit_catalog_order(jsonb,jsonb) to anon,authenticated;
grant execute on function public.create_web_order(jsonb,jsonb) to anon,authenticated;
grant execute on function public.internal_set_product_pack(uuid,text,text,integer,boolean,bigint) to authenticated;
grant execute on function public.internal_manual_order(uuid,text,text,bigint,jsonb,jsonb) to authenticated;
grant execute on function public.create_local_order(jsonb,jsonb) to authenticated;

insert into public.product_pack_settings(product_id,mode,quantity,enabled,base_kind,mix_group)
select p.id,s.mode,s.quantity,s.enabled,s.base_kind,s.mix_group
from jsonb_to_recordset($pack_seed$[
{"product_id":"61662d1c-64e2-4119-8916-40c28a15e2e2","mode":"custom","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"5de5b639-0ffc-410d-9794-7b96080875cd","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"5818626a-2104-4f5e-a7f5-f774fefa6b5d","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer xy art. 1387 liso","revision":0},
{"product_id":"85d6e4f7-e6f9-48a0-b2ea-822bbd0a2d9e","mode":"custom","quantity":3,"enabled":true,"base_kind":"dozen","mix_group":"medias|soquetes elastizados nenas","revision":0},
{"product_id":"5b23a041-9154-4ce0-8fd7-6079fba4bec4","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"b7573fe3-f0f0-431f-b98c-80d03fab357c","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer lody adulto art. 742","revision":0},
{"product_id":"70ef1d7f-b294-4677-a7dc-b72dbf62b273","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"3126d06f-0402-4057-b253-5e4b592c411b","mode":"custom","quantity":5,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"36741b3a-50a2-4d44-9104-60783c7ad4d8","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"4dc26f6d-890b-47f7-8d37-06fb7f107303","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"b8935466-c256-400e-90bb-7c674862ddb6","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"ac4a1950-2659-41fe-999b-753497fe1890","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"d2380dc6-242c-49a3-baea-7d394f5cac6f","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"f3ba3980-0284-4e72-bfbf-8225a22731bb","mode":"custom","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"e56bed31-51d1-4647-911e-706ea89e1ee9","mode":"custom","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"5c26eccf-ed7a-4719-bff7-ac50010059dc","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer dufour art. 11855","revision":0},
{"product_id":"7e13f6c0-dc03-4760-a633-a71336c8700c","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"f37f2af1-76d4-4a2e-8935-cfddf7829717","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"ab6b2869-4720-43f0-8a64-13e659a5cc12","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"3a43594c-f882-415a-a003-48f23c8c1248","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"0783175f-cf94-4dcf-a3b2-61b3728aaeaf","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer dufour art. 11855","revision":0},
{"product_id":"79a8a99b-b61f-4413-be93-9e5333fd4d83","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"8260a653-4bc5-4962-8c31-748327d19beb","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"7bdb2701-2182-426f-8518-69b3a6321753","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"103f4f31-69ce-4942-9a5d-98dc079bf87b","mode":"custom","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"cde8cfda-88c3-4e35-9774-e708941253ed","mode":"custom","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"097fad98-028c-461d-84f2-75150cdcb09b","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"a2e27dff-7554-467e-8e42-c65db41d1882","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"5482fff9-ef45-45d4-8ec2-4f096660ae39","mode":"custom","quantity":3,"enabled":true,"base_kind":"dozen","mix_group":"medias|soquetes elastizados nenes","revision":0},
{"product_id":"9215949e-11d0-4339-b73b-9a15cd74b33f","mode":"custom","quantity":3,"enabled":true,"base_kind":"dozen","mix_group":"medias|soquetes elastizados nenes","revision":0},
{"product_id":"95781694-051c-4d45-818e-86eb27648a53","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"ed02c44b-30ee-4f8e-a028-0a1c1eea64e3","mode":"custom","quantity":6,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"7d76167a-6a74-414e-a844-cfd884711186","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"fd357315-d33b-4908-8396-3df93395f390","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer maxton","revision":0},
{"product_id":"703cb355-cdd5-42c4-95a3-3d794dcbc618","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer lody adulto art. 742","revision":0},
{"product_id":"cb1df866-5cf3-4241-b3c8-3378d17c49f8","mode":"custom","quantity":3,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"e50cc340-29f1-461a-95ae-c57984a0d315","mode":"custom","quantity":3,"enabled":true,"base_kind":"dozen","mix_group":"medias|soquetes elastizados nenas","revision":0},
{"product_id":"e5138d6b-ddfc-4084-90b1-d6a04d2156ff","mode":"custom","quantity":3,"enabled":true,"base_kind":"dozen","mix_group":"medias|soquetes elastizados nenas","revision":0},
{"product_id":"d95cb7b5-cbbe-4a90-a653-8ce2813d9d19","mode":"custom","quantity":3,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"e2d89e3d-5fb9-4e2e-9d6f-265ed1097584","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"42cf67d5-5ddb-4ad1-b1b9-51e61d34d77e","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer lody adulto art. 742","revision":0},
{"product_id":"62be59da-2098-45af-8f2a-f09849e4fbee","mode":"custom","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"79d9d056-8565-44fe-a685-6c604419b271","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer dufour art. 11855","revision":0},
{"product_id":"304df3dd-9bb5-40c6-ba28-20a2f5752188","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"0c14b005-e99d-4523-a6d3-cd5f926540e5","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer dufour art. 11855","revision":0},
{"product_id":"67125816-8f94-4172-ac6c-c4103c011135","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"c77a0a6f-8acb-4b20-8d33-d7f83a6786c1","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"0e80eb53-f669-4f42-8b3d-6fb3a9cf9419","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"9291c0d6-6836-4ba1-ba77-fc43686642ab","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer lody adulto art. 742","revision":0},
{"product_id":"e043db82-9e25-4807-a126-5f3e928feaeb","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer xy art. 1387 liso","revision":0},
{"product_id":"2b27ec33-3fcb-4113-b7a9-96dc348042f5","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer lody adulto art. 742","revision":0},
{"product_id":"af269fd5-8560-40db-b657-9d676e194b32","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer lody adulto art. 742","revision":0},
{"product_id":"e0b3b587-4fc3-492a-b6d5-40619dffb624","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer xy art. 1387 liso","revision":0},
{"product_id":"be17707c-86fe-41d5-a545-e67cfcdc3214","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"11a0a724-4e03-487a-8a64-b7ed750807c1","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer xy art. 1387 liso","revision":0},
{"product_id":"ac690724-53e9-45f7-9eec-b99dc1d0537e","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"0a805bc3-af67-4efd-8c6d-5579dc9b7162","mode":"custom","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"fb985553-47e7-4b7a-a573-496855a09225","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"877ee1d2-ff89-4abb-a6bf-be38f66b537e","mode":"custom","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"1e278178-8639-452d-b9c2-b8b7d5e555b4","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"05f50d0c-caa1-495b-a9d8-cae058edf200","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"b8188b17-d989-442e-82ed-ecd934042433","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"2361f469-a153-4564-acfc-fd2dfe771ef7","mode":"custom","quantity":6,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"eea00d8f-4b6c-4f8a-90d3-a94ddf684be1","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer maxton","revision":0},
{"product_id":"e2284d8c-57d0-4aad-869b-4faeef48ca67","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer maxton","revision":0},
{"product_id":"95e71c2d-8acf-446d-9b4b-c7b7fd2e0a54","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"e9744544-4222-4574-af6b-7b5d5d688bb2","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"039ae43e-20d6-4ce4-a9a8-755f886c7b69","mode":"same","quantity":1,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"eb885591-27fb-4fd6-90f9-10bcab32fdb8","mode":"same","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"2597e082-685e-44da-8a28-fe127cf6451f","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"f1e4a46d-4945-44b0-a05c-dc82d2b38319","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"cae7330a-74bd-4bf2-bcbf-5b5ec3a3906b","mode":"custom","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"254f1c9a-f7eb-450f-a2eb-a1c61cadcf21","mode":"custom","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"f31012aa-441f-4310-9c51-ca1e0131c2c2","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer maxton","revision":0},
{"product_id":"7a822fc2-f6a9-4e3a-9468-2bef54e61c9d","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer maxton","revision":0},
{"product_id":"58955351-f6f2-4bfa-af95-69be1cd56f68","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"a76af400-f718-48f5-af57-4940006590bd","mode":"custom","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"8c517a1e-4505-4e3b-873e-224faaeb27e4","mode":"custom","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"d0b38242-54ec-42e2-91bb-7b990eba27a4","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"0b751304-4ed4-49b5-8acc-3d14ff3aa1c6","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer xy art. 1387 liso","revision":0},
{"product_id":"e6f1fb74-d211-41ba-bec3-b7c3978b67c1","mode":"custom","quantity":5,"enabled":false,"base_kind":"unit","mix_group":"ropa interior hombre|boxer xy art. 1387 liso","revision":0},
{"product_id":"24743a92-bfb9-4c07-a9fb-f957f1d19165","mode":"custom","quantity":3,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"be47d42a-b9af-43d1-b6fe-26fbb16d52f9","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"081bf7f6-bb91-423c-8702-9cee05dbe510","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"5bffd8ce-ea5a-46b0-ae91-a14c1c1a1b43","mode":"custom","quantity":3,"enabled":true,"base_kind":"dozen","mix_group":"medias|soquetes elastizados nenes","revision":0},
{"product_id":"92cbe8f6-46a4-4ab9-bc8e-aa43ee7d9171","mode":"custom","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"38173f92-86eb-40d1-8e01-e55c14a96ee0","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":"ropa interior hombre|boxer dufour art. 11855","revision":0},
{"product_id":"f24984bf-7252-4913-a695-de2eead03ec8","mode":"custom","quantity":1,"enabled":true,"base_kind":"dozen","mix_group":null,"revision":0},
{"product_id":"992202f6-f3f0-43bf-8270-709a984c4789","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"d2cf4e70-3fc8-4c73-9708-4609a3122085","mode":"custom","quantity":2,"enabled":true,"base_kind":"valijita","mix_group":null,"revision":0},
{"product_id":"7dcbd94e-4e16-41c8-8b65-36336458d362","mode":"custom","quantity":2,"enabled":true,"base_kind":"valijita","mix_group":null,"revision":0},
{"product_id":"11b9f853-514c-489c-9f4d-2f788ffbaa82","mode":"custom","quantity":5,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"50bba1cb-a14d-4305-b50c-3626508c1d4d","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"0c8ba956-b727-4901-a706-726f8bbd4c61","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"b2b7672f-b777-4f4f-bcf3-e7530eb77849","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0},
{"product_id":"3db1b94f-c1c3-4e57-9cf4-37e167d37734","mode":"custom","quantity":4,"enabled":true,"base_kind":"unit","mix_group":null,"revision":0}
]$pack_seed$::jsonb)
  as s(product_id uuid,mode text,quantity integer,enabled boolean,base_kind text,mix_group text)
join public.products p on p.id=s.product_id
on conflict(product_id) do nothing;

do $$ begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='product_pack_settings') then
    alter publication supabase_realtime add table public.product_pack_settings;
  end if;
end $$;
notify pgrst, 'reload schema';
commit;

select 'purchase_modes_ready' as result,
  (select count(*) from public.product_pack_settings) as configured_products,
  has_function_privilege('authenticated','public.internal_set_product_pack(uuid,text,text,integer,boolean,bigint)','EXECUTE') as authenticated_can_configure,
  has_function_privilege('anon','public.internal_set_product_pack(uuid,text,text,integer,boolean,bigint)','EXECUTE') as anon_can_configure,
  has_function_privilege('anon','public.submit_catalog_order(jsonb,jsonb)','EXECUTE') as public_can_submit;
