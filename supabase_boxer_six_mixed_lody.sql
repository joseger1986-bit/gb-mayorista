-- Punto X Mayor: minimo de seis en boxers y combinacion de precios por talle solo para Lody.
-- NO modifica public.products, variantes, precios, costos, stock, movimientos ni pedidos existentes.
-- Solo agrega una opcion comercial a product_pack_settings y actualiza 22 configuraciones verificadas.
begin;
alter table public.product_pack_settings add column if not exists allow_mixed_prices boolean not null default false;

do $config$
declare target record; current_config public.product_pack_settings%rowtype;
begin
  for target in select * from jsonb_to_recordset($targets$[{"id":"5818626a-2104-4f5e-a7f5-f774fefa6b5d","name":"Boxer XY Art. 1387 Liso","size":"1","mixed":false,"mix_group":"ropa interior hombre|boxer xy art. 1387 liso"},{"id":"fd357315-d33b-4908-8396-3df93395f390","name":"Boxer Maxton","size":"6","mixed":false,"mix_group":"ropa interior hombre|boxer maxton"},{"id":"b7573fe3-f0f0-431f-b98c-80d03fab357c","name":"Boxer Lody Adulto Art. 742","size":"1","mixed":true,"mix_group":"ropa interior hombre|boxer lody adulto art. 742"},{"id":"5c26eccf-ed7a-4719-bff7-ac50010059dc","name":"Boxer Dufour Art. 11855","size":"4","mixed":false,"mix_group":"ropa interior hombre|boxer dufour art. 11855"},{"id":"0783175f-cf94-4dcf-a3b2-61b3728aaeaf","name":"Boxer Dufour Art. 11855","size":"5","mixed":false,"mix_group":"ropa interior hombre|boxer dufour art. 11855"},{"id":"703cb355-cdd5-42c4-95a3-3d794dcbc618","name":"Boxer Lody Adulto Art. 742","size":"2","mixed":true,"mix_group":"ropa interior hombre|boxer lody adulto art. 742"},{"id":"42cf67d5-5ddb-4ad1-b1b9-51e61d34d77e","name":"Boxer Lody Adulto Art. 742","size":"5","mixed":true,"mix_group":"ropa interior hombre|boxer lody adulto art. 742"},{"id":"79d9d056-8565-44fe-a685-6c604419b271","name":"Boxer Dufour Art. 11855","size":"1","mixed":false,"mix_group":"ropa interior hombre|boxer dufour art. 11855"},{"id":"0c14b005-e99d-4523-a6d3-cd5f926540e5","name":"Boxer Dufour Art. 11855","size":"2","mixed":false,"mix_group":"ropa interior hombre|boxer dufour art. 11855"},{"id":"e043db82-9e25-4807-a126-5f3e928feaeb","name":"Boxer XY Art. 1387 Liso","size":"2","mixed":false,"mix_group":"ropa interior hombre|boxer xy art. 1387 liso"},{"id":"af269fd5-8560-40db-b657-9d676e194b32","name":"Boxer Lody Adulto Art. 742","size":"3","mixed":true,"mix_group":"ropa interior hombre|boxer lody adulto art. 742"},{"id":"2b27ec33-3fcb-4113-b7a9-96dc348042f5","name":"Boxer Lody Adulto Art. 742","size":"4","mixed":true,"mix_group":"ropa interior hombre|boxer lody adulto art. 742"},{"id":"9291c0d6-6836-4ba1-ba77-fc43686642ab","name":"Boxer Lody Adulto Art. 742","size":"6","mixed":true,"mix_group":"ropa interior hombre|boxer lody adulto art. 742"},{"id":"e0b3b587-4fc3-492a-b6d5-40619dffb624","name":"Boxer XY Art. 1387 Liso","size":"3","mixed":false,"mix_group":"ropa interior hombre|boxer xy art. 1387 liso"},{"id":"11a0a724-4e03-487a-8a64-b7ed750807c1","name":"Boxer XY Art. 1387 Liso","size":"4","mixed":false,"mix_group":"ropa interior hombre|boxer xy art. 1387 liso"},{"id":"e2284d8c-57d0-4aad-869b-4faeef48ca67","name":"Boxer Maxton","size":"4","mixed":false,"mix_group":"ropa interior hombre|boxer maxton"},{"id":"eea00d8f-4b6c-4f8a-90d3-a94ddf684be1","name":"Boxer Maxton","size":"5","mixed":false,"mix_group":"ropa interior hombre|boxer maxton"},{"id":"f31012aa-441f-4310-9c51-ca1e0131c2c2","name":"Boxer Maxton","size":"2","mixed":false,"mix_group":"ropa interior hombre|boxer maxton"},{"id":"7a822fc2-f6a9-4e3a-9468-2bef54e61c9d","name":"Boxer Maxton","size":"3","mixed":false,"mix_group":"ropa interior hombre|boxer maxton"},{"id":"0b751304-4ed4-49b5-8acc-3d14ff3aa1c6","name":"Boxer XY Art. 1387 Liso","size":"5","mixed":false,"mix_group":"ropa interior hombre|boxer xy art. 1387 liso"},{"id":"e6f1fb74-d211-41ba-bec3-b7c3978b67c1","name":"Boxer XY Art. 1387 Liso","size":"6","mixed":false,"mix_group":"ropa interior hombre|boxer xy art. 1387 liso"},{"id":"38173f92-86eb-40d1-8e01-e55c14a96ee0","name":"Boxer Dufour Art. 11855","size":"3","mixed":false,"mix_group":"ropa interior hombre|boxer dufour art. 11855"}]$targets$::jsonb)
    as t(id uuid,name text,size text,mixed boolean,mix_group text) order by id
  loop
    perform pg_advisory_xact_lock(hashtextextended('pack-config:'||target.id::text,0));
    if not exists(select 1 from public.products p where p.id=target.id and p.active is true
      and p.name=target.name and coalesce(p.option_name,'')=coalesce(target.size,'')) then
      raise exception 'Cambio la identificacion del boxer %. No se aplico ningun cambio.',target.id;
    end if;
    select * into current_config from public.product_pack_settings where product_id=target.id for update;
    if not found or current_config.mode<>'custom' or current_config.quantity not in (5,6)
      or current_config.mix_group is distinct from target.mix_group then
      raise exception 'Cambio la configuracion del boxer %. No se aplico ningun cambio.',target.id;
    end if;
    update public.product_pack_settings set quantity=6,allow_mixed_prices=target.mixed,revision=revision+1,updated_at=now()
    where product_id=target.id and (quantity<>6 or allow_mixed_prices is distinct from target.mixed);
  end loop;
end $config$;

create or replace function public.catalog_purchase_spec(p_product_id uuid,p_mode text,p_variant text default '')
returns jsonb language plpgsql stable security definer set search_path=pg_catalog,public as $$
declare p public.products%rowtype; c public.product_pack_settings%rowtype;
  v public.product_variants%rowtype; factor numeric; price numeric; qty integer:=1;
  kind text; noun text; label text; canonical text; stock numeric; variant_count integer;
begin
  if p_mode='surtida' then return public.catalog_closed_purchase_spec(p_product_id,p_mode,p_variant); end if;
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
  if p_mode='packs' then
    qty:=c.quantity;
    factor:=case when kind='valijita' then 2 when kind='dozen' and p.stock_unit<>'docenas' then 12
      when kind='presentation' then factor else 1 end;
    if c.mode='same' then qty:=(public.catalog_stock_factor(p.presentation,p.stock_unit)/factor)::integer; end if;
    if qty<1 or qty>1000000 then raise exception 'Cantidad minima invalida.'; end if;
    canonical:=case kind when 'valijita' then 'Pack x2 unidades' when 'dozen' then 'Docena' when 'unit' then 'Unidad' else p.presentation end;
  end if;
  noun:=case kind when 'valijita' then 'valijitas' when 'dozen' then 'docenas' when 'presentation' then
    case when lower(p.presentation) like '%valijita%' then 'valijitas' when lower(p.presentation) like '%juego%' then 'juegos'
      when lower(p.presentation) ~ '\mpar(es)?\M' then 'pares' else 'presentaciones' end else 'unidades' end;
  label:=format('Compra mínima: %s %s',qty,case when qty=1 then case noun when 'docenas' then 'docena' when 'unidades' then 'unidad' when 'valijitas' then 'valijita' when 'juegos' then 'juego' when 'pares' then 'par' else 'presentación' end else noun end);
  if kind='valijita' then label:=label||format(' (%s juegos)',qty*2); end if;
  price:=price*factor;
  return jsonb_build_object('presentation',label,'quantity',qty,'orderPresentation',canonical,'orderUnitPrice',price,
    'price',price,'minimumTotalPrice',price*qty,'quantityRule','minimum','stockPerBase',factor,'stock',greatest(0,coalesce(stock,0)),'kind',kind,'noun',noun,
    'revision',c.revision,'same',p_mode='surtida' or c.mode='same','mixGroup',case when p_mode='packs' and c.mode='custom' then c.mix_group else null end,
    'allowMixedPrices',c.mode='custom' and c.mix_group is not null and c.allow_mixed_prices,
    'productName',p.name,'stockUnit',p.stock_unit,'variantName',p_variant);
end $$;
create or replace function public.validate_catalog_minimum_items(p_items jsonb)
returns void language plpgsql stable security definer set search_path=pg_catalog,public as $$
declare item jsonb; spec jsonb; totals jsonb:='{}'; minimums jsonb:='{}'; k text; quantity numeric;
begin
  for item in select value from jsonb_array_elements(p_items) loop
    if item->'purchase_details'->>'quantityRule' is distinct from 'minimum' then continue; end if;
    spec:=public.catalog_purchase_spec((item->>'product_id')::uuid,'packs',coalesce(item->>'variant_name',''));
    quantity:=(item->>'quantity')::numeric;
    if quantity is null or quantity<=0 or quantity<>trunc(quantity) or quantity>1000000 then raise exception 'Cantidad invalida.'; end if;
    if item->>'presentation' is distinct from spec->>'orderPresentation' then raise exception 'La presentacion cambio. Revisa el producto en el catalogo.'; end if;
    k:=coalesce(spec->>'mixGroup',item->>'product_id')||':'||(case when coalesce((spec->>'allowMixedPrices')::boolean,false) then 'mixed' else (item->>'unit_price')::numeric::text end)||':'||(spec->>'quantity')||':'||(spec->>'kind');
    totals:=jsonb_set(totals,array[k],to_jsonb(coalesce((totals->>k)::numeric,0)+quantity));
    minimums:=jsonb_set(minimums,array[k],spec->'quantity');
  end loop;
  for k in select jsonb_object_keys(totals) loop
    if (totals->>k)::numeric<(minimums->>k)::numeric then raise exception 'No alcanza la compra mínima por producto.'; end if;
  end loop;
end $$;
create or replace function public.validate_catalog_minimum_order_items(p_order_id uuid,p_items jsonb)
returns void language plpgsql stable security definer set search_path=pg_catalog,public as $$
declare item jsonb; current_items jsonb:='[]';
begin
  for item in select value from jsonb_array_elements(p_items) loop
    -- Only unchanged lines already saved under the previous minimum keep that agreement.
    if exists(select 1 from public.order_items i join public.orders o on o.id=i.order_id
      join public.product_pack_settings c on c.product_id=i.product_id
      where i.order_id=p_order_id and i.product_id=(item->>'product_id')::uuid
      and i.variant_name=coalesce(item->>'variant_name','') and i.quantity=(item->>'quantity')::numeric
      and i.unit_price=(item->>'unit_price')::numeric and i.presentation=item->>'presentation'
      and coalesce(o.stock_applied,false)=false and o.status='Pendiente'
      and i.purchase_details->>'quantityRule'='minimum'
      and (i.purchase_details->>'minimumQuantity')::numeric=5
      and c.quantity=6 and c.revision>coalesce((i.purchase_details->>'revision')::bigint,0)) then
      continue;
    end if;
    current_items:=current_items||jsonb_build_array(item);
  end loop;
  perform public.validate_catalog_minimum_items(current_items);
end $$;
create or replace function public.internal_manual_order(p_order_id uuid,p_action text,p_profile_token text,p_revision bigint default 0,p_order_payload jsonb default '{}',p_items jsonb default '[]')
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare result jsonb; item jsonb; already_applied boolean;
begin
  perform pg_advisory_xact_lock(hashtextextended('manual-order:'||p_order_id::text,0));
  select stock_applied into already_applied from public.orders where id=p_order_id;
  if p_action in ('save','pay') and not coalesce(already_applied,false) then perform public.validate_catalog_minimum_order_items(p_order_id,p_items); end if;
  result:=public.pxm_manual_order_legacy(p_order_id,p_action,p_profile_token,p_revision,p_order_payload,p_items);
  if p_action in ('save','pay') and not coalesce(already_applied,false) then
    update public.orders set purchase_mode=case when p_order_payload->>'purchase_mode'='packs' then 'packs' else 'habitual' end where id=p_order_id;
    for item in select value from jsonb_array_elements(p_items) loop
      update public.order_items i set purchase_details=case when item->'purchase_details'->>'quantityRule'='minimum' then (item->'purchase_details')||jsonb_build_object('allocated',i.quantity) when (item->'purchase_details'->>'allocated')::numeric=i.quantity then item->'purchase_details' else null end
      where i.order_id=p_order_id and i.product_id=(item->>'product_id')::uuid and i.variant_name=coalesce(item->>'variant_name','');
    end loop;
  end if;
  return public.purchase_order_result(p_order_id);
end $$;
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
    if mode='packs' and item->'purchase_details'->>'quantityRule'='minimum' then
      spec:=public.catalog_purchase_spec((item->>'product_id')::uuid,mode,coalesce(item->>'variant_name',''));
    else
      spec:=public.catalog_closed_purchase_spec((item->>'product_id')::uuid,mode,coalesce(item->>'variant_name',''));
    end if;
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
        or coalesce((details->>'unitsPerPack')::numeric,0)<>(spec->>'quantity')::numeric
        or coalesce((details->>'allocated')::numeric,0)<>quantity
        or coalesce((details->>'revision')::bigint,-1)<>(spec->>'revision')::bigint then raise exception 'Cantidad incompleta o desactualizada.'; end if;
      perform (details->>'packId')::uuid;
      group_key:=coalesce(spec->>'mixGroup',item->>'product_id')||':'||(case when details->>'quantityRule'='minimum' and coalesce((spec->>'allowMixedPrices')::boolean,false) then 'mixed' else price::text end)||':'||(spec->>'quantity')||':'||(spec->>'kind');
      batch:=batches->(details->>'packId');
      if details->>'quantityRule'='minimum' then
        if coalesce((details->>'minimumQuantity')::numeric,0)<>(spec->>'quantity')::numeric
          or coalesce((details->>'requestedTotal')::numeric,0)<(spec->>'quantity')::numeric
          or (details->>'requestedTotal')::numeric<>trunc((details->>'requestedTotal')::numeric)
          or (details->>'requestedTotal')::numeric>1000000 then raise exception 'No alcanza la compra mínima por producto.'; end if;
        if batch is not null and (batch->>'key'<>group_key or batch->>'rule'<>'minimum'
          or (batch->>'required')::numeric<>(details->>'requestedTotal')::numeric) then raise exception 'No se pueden mezclar esas variantes o cantidades.'; end if;
        batch:=jsonb_build_object('key',group_key,'rule','minimum','total',coalesce((batch->>'total')::numeric,0)+quantity,'required',(details->>'requestedTotal')::numeric);
      else
        if coalesce((details->>'packs')::numeric,0)<=0 or (details->>'packs')::numeric<>trunc((details->>'packs')::numeric) then raise exception 'Pack incompleto.'; end if;
        if batch is not null and (batch->>'key'<>group_key or batch->>'rule'<>'closed' or (batch->>'packs')::numeric<>(details->>'packs')::numeric) then raise exception 'No se pueden mezclar esas variantes en un pack.'; end if;
        batch:=jsonb_build_object('key',group_key,'rule','closed','packs',(details->>'packs')::numeric,'total',coalesce((batch->>'total')::numeric,0)+quantity,'required',(details->>'packs')::numeric*(spec->>'quantity')::numeric);
      end if;
      batches:=jsonb_set(batches,array[details->>'packId'],batch);
      details:=details||jsonb_build_object('presentation',spec->>'presentation','noun',spec->>'noun','same',spec->'same','mixed',spec->>'mixGroup' is not null,'allowMixedPrices',coalesce((spec->>'allowMixedPrices')::boolean,false));
    end if;
    canonical_item:=jsonb_build_object('product_id',item->>'product_id','product_name',spec->>'productName','variant_name',spec->>'variantName',
      'quantity',quantity,'unit_price',price,'unit_cost',0,'subtotal',quantity*price,'presentation',spec->>'orderPresentation','stock_unit',spec->>'stockUnit','purchase_details',details);
    canonical:=canonical||jsonb_build_array(canonical_item);total:=total+quantity*price;
  end loop;
  for batch in select value from jsonb_each(batches) loop
    if (batch->>'total')::numeric<>(batch->>'required')::numeric then raise exception 'Completa la cantidad elegida del producto.'; end if;
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

-- Misma autorizacion existente. La opcion de mezclar precios se lee del servidor, no del cliente.
revoke all on function public.catalog_purchase_spec(uuid,text,text) from public;
grant execute on function public.catalog_purchase_spec(uuid,text,text) to anon,authenticated;
revoke all on function public.validate_catalog_minimum_items(jsonb) from public,anon,authenticated;
revoke all on function public.validate_catalog_minimum_order_items(uuid,jsonb) from public,anon,authenticated;
revoke all on function public.submit_catalog_order(jsonb,jsonb) from public;
grant execute on function public.submit_catalog_order(jsonb,jsonb) to anon,authenticated;
notify pgrst,'reload schema';
commit;

select 'boxer_six_ready' as status,
  count(*) as configured_boxers,
  count(*) filter(where quantity=6) as boxers_with_minimum_six,
  count(*) filter(where allow_mixed_prices) as lody_mixed_sizes,
  has_function_privilege('anon','public.internal_set_product_pack(uuid,text,text,integer,boolean,bigint)','execute') as anon_can_configure,
  has_function_privilege('anon','public.submit_catalog_order(jsonb,jsonb)','execute') as public_can_submit
from public.product_pack_settings where product_id in ('5818626a-2104-4f5e-a7f5-f774fefa6b5d'::uuid,'fd357315-d33b-4908-8396-3df93395f390'::uuid,'b7573fe3-f0f0-431f-b98c-80d03fab357c'::uuid,'5c26eccf-ed7a-4719-bff7-ac50010059dc'::uuid,'0783175f-cf94-4dcf-a3b2-61b3728aaeaf'::uuid,'703cb355-cdd5-42c4-95a3-3d794dcbc618'::uuid,'42cf67d5-5ddb-4ad1-b1b9-51e61d34d77e'::uuid,'79d9d056-8565-44fe-a685-6c604419b271'::uuid,'0c14b005-e99d-4523-a6d3-cd5f926540e5'::uuid,'e043db82-9e25-4807-a126-5f3e928feaeb'::uuid,'af269fd5-8560-40db-b657-9d676e194b32'::uuid,'2b27ec33-3fcb-4113-b7a9-96dc348042f5'::uuid,'9291c0d6-6836-4ba1-ba77-fc43686642ab'::uuid,'e0b3b587-4fc3-492a-b6d5-40619dffb624'::uuid,'11a0a724-4e03-487a-8a64-b7ed750807c1'::uuid,'e2284d8c-57d0-4aad-869b-4faeef48ca67'::uuid,'eea00d8f-4b6c-4f8a-90d3-a94ddf684be1'::uuid,'f31012aa-441f-4310-9c51-ca1e0131c2c2'::uuid,'7a822fc2-f6a9-4e3a-9468-2bef54e61c9d'::uuid,'0b751304-4ed4-49b5-8acc-3d14ff3aa1c6'::uuid,'e6f1fb74-d211-41ba-bec3-b7c3978b67c1'::uuid,'38173f92-86eb-40d1-8e01-e55c14a96ee0'::uuid);
