-- Pedidos manuales. Ejecutar completo antes de publicar el frontend.
-- No actualiza registros historicos ni ejecuta movimientos durante la migracion.
begin;

alter table public.orders add column if not exists deleted_at timestamptz;
alter table public.orders add column if not exists deleted_by uuid;
alter table public.orders add column if not exists manual_revision bigint not null default 0;
alter table public.orders add column if not exists delivery_type text not null default 'Retira en local';

-- Amplia unicamente los checks individuales existentes de origen y estado.
do $$
declare r record; v_column text; v_value text;
begin
  for r in
    select c.conname, pg_get_expr(c.conbin,c.conrelid) as expression, a.attname
    from pg_constraint c join pg_attribute a
      on a.attrelid=c.conrelid and c.conkey=array[a.attnum]::smallint[]
    where c.conrelid='public.orders'::regclass and c.contype='c'
      and a.attname in ('origin','status')
  loop
    v_column:=r.attname;
    v_value:=case when v_column='origin' then 'manual' else 'Pendiente' end;
    if position(quote_literal(v_value) in r.expression)=0 then
      execute format('alter table public.orders drop constraint %I',r.conname);
      execute format('alter table public.orders add constraint %I check ((%s) or %I=%L)',
        r.conname,r.expression,v_column,v_value);
    end if;
  end loop;
end $$;

create or replace function public.internal_manual_order(
  p_order_id uuid,
  p_action text,
  p_profile_token text,
  p_revision bigint default 0,
  p_order_payload jsonb default '{}'::jsonb,
  p_items jsonb default '[]'::jsonb
)
returns jsonb language plpgsql security definer
set search_path=pg_catalog,public,extensions
as $$
declare
  v_session jsonb;
  v_order public.orders%rowtype;
  v_item jsonb;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_line record;
  v_quantity numeric;
  v_previous numeric;
  v_subtotal numeric:=0;
  v_discount numeric;
  v_items jsonb;
  v_exists boolean;
begin
  v_session:=public.internal_validate_profile_session(p_profile_token);
  if auth.uid() is null or not coalesce((v_session->>'ok')::boolean,false)
    or coalesce(v_session->>'role','') not in ('admin','employee') then
    raise exception 'Inicia sesion en Gestion.' using errcode='42501';
  end if;
  if p_action is null or p_action not in ('save','delete','pay') then raise exception 'Accion invalida.'; end if;
  if p_order_id is null then raise exception 'Falta el identificador del pedido.'; end if;

  -- Serializa tambien dos solicitudes de creacion del mismo borrador.
  perform pg_advisory_xact_lock(hashtextextended('manual-order:'||p_order_id::text,0));
  select * into v_order from public.orders where id=p_order_id for update;
  v_exists:=found;
  if v_exists then
    if v_order.origin<>'manual' then raise exception 'Esta accion es exclusiva de pedidos manuales.'; end if;
    if v_order.deleted_at is not null then raise exception 'El pedido fue eliminado.'; end if;
    if p_action='pay' and v_order.status='Pagado' and v_order.stock_applied then
      -- Reintentar el mismo pago no genera otra salida ni modifica la venta.
      null;
    else
      if v_order.status<>'Pendiente' or v_order.stock_applied then
        raise exception 'Este pedido ya no esta pendiente. Actualiza la lista.';
      end if;
      if v_order.manual_revision<>p_revision then
        raise exception 'Otro dispositivo modifico el pedido. Volve a abrirlo antes de guardar.' using errcode='40001';
      end if;
    end if;
  elsif p_action<>'save' then
    raise exception 'El pedido no existe.';
  end if;

  if p_action='delete' then
    update public.orders set deleted_at=now(),deleted_by=auth.uid(),
      manual_revision=manual_revision+1,updated_at=now()
    where id=p_order_id returning * into v_order;
  elsif not (p_action='pay' and v_exists and v_order.status='Pagado' and v_order.stock_applied) then
    if nullif(trim(p_order_payload->>'customer_name'),'') is null then
      raise exception 'Completa el nombre del cliente.';
    end if;
    if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then
      raise exception 'Agrega al menos un producto.';
    end if;
    for v_item in select value from jsonb_array_elements(p_items) loop
      select * into v_product from public.products where id=(v_item->>'product_id')::uuid;
      if not found or v_product.active is false then raise exception 'Un producto no esta disponible.'; end if;
      if coalesce((v_item->>'quantity')::numeric,0)<=0
        or (v_item->>'quantity')::numeric<>trunc((v_item->>'quantity')::numeric)
        or coalesce((v_item->>'unit_price')::numeric,-1)<0
        or nullif(trim(v_item->>'presentation'),'') is null then
        raise exception 'Cantidad, precio o presentacion invalidos.';
      end if;
      v_subtotal:=v_subtotal+(v_item->>'quantity')::numeric*(v_item->>'unit_price')::numeric;
    end loop;
    v_discount:=greatest(0,coalesce((p_order_payload->>'discount_value')::numeric,0));
    if p_order_payload->>'discount_type'='percent' then
      v_discount:=round(v_subtotal*least(v_discount,100)/100);
    else v_discount:=least(round(v_discount),v_subtotal); end if;
    if not v_exists then
      insert into public.orders(id,origin,status,stock_applied)
      values(p_order_id,'manual','Pendiente',false);
    end if;
    update public.orders set customer_name=left(trim(p_order_payload->>'customer_name'),160),
      customer_phone=left(coalesce(p_order_payload->>'customer_phone',''),60),
      customer_location=left(coalesce(p_order_payload->>'customer_location',''),160),
      payment_method=coalesce(p_order_payload->>'payment_method','Transferencia'),
      delivery_type=coalesce(p_order_payload->>'delivery_type','Retira en local'),
      delivery_notes=coalesce(p_order_payload->>'delivery_notes',''),
      subtotal=v_subtotal,total=v_subtotal-v_discount,
      discount_type=case when p_order_payload->>'discount_type'='percent' then 'percent' else 'fixed' end,
      discount_value=greatest(0,coalesce((p_order_payload->>'discount_value')::numeric,0)),
      discount_amount=v_discount,updated_at=now(),manual_revision=manual_revision+1
    where id=p_order_id;
    delete from public.order_items where order_id=p_order_id;
    insert into public.order_items(order_id,product_id,product_name,variant_name,presentation,
      stock_unit,quantity,unit_price,unit_cost,subtotal,prepared)
    select p_order_id,p.id,coalesce(i->>'product_name',p.name),coalesce(i->>'variant_name',''),
      i->>'presentation',p.stock_unit,(i->>'quantity')::integer,(i->>'unit_price')::numeric,0,
      (i->>'quantity')::numeric*(i->>'unit_price')::numeric,coalesce((i->>'prepared')::boolean,false)
    from jsonb_array_elements(p_items) i join public.products p on p.id=(i->>'product_id')::uuid;

    if p_action='pay' then
      -- Siempre bloquear productos en el mismo orden entre pedidos distintos.
      perform p.id from public.products p where p.id in
        (select product_id from public.order_items where order_id=p_order_id)
        order by p.id for update;
      for v_line in
        select product_id,variant_name,sum(quantity * case
          when presentation ~* 'pack\s*x\s*[0-9]+' then greatest(1,substring(presentation from '(?i)pack\s*x\s*([0-9]+)')::numeric)
          when presentation ~* 'docena' then case when stock_unit='docenas' then 1 else 12 end
          else 1 end) as consumption
        from public.order_items where order_id=p_order_id
        group by product_id,variant_name order by product_id,variant_name
      loop
        select * into v_product from public.products where id=v_line.product_id;
        v_quantity:=v_line.consumption;
        if exists(select 1 from public.product_variants where product_id=v_line.product_id and active is true) then
          select * into v_variant from public.product_variants where product_id=v_line.product_id
            and name=v_line.variant_name and active is true for update;
          if not found then raise exception 'Selecciona un talle valido para %.',v_product.name; end if;
          v_previous:=v_variant.stock;
          if v_previous<v_quantity then raise exception 'Stock insuficiente para % (%).',v_product.name,v_line.variant_name; end if;
          update public.product_variants set stock=v_previous-v_quantity where id=v_variant.id;
          insert into public.stock_movements(product_id,product_name,movement_type,reason,quantity,
            stock_unit,previous_stock,new_stock,order_id,user_id,user_email,unit_cost,previous_cost,new_cost,total_cost)
          values(v_product.id,v_product.name,'subtract','Venta pedido manual: '||v_line.variant_name,v_quantity,
            v_product.stock_unit,v_previous,v_previous-v_quantity,p_order_id,auth.uid(),null,null,null,null,null);
        else
          perform public.adjust_product_stock(v_product.id,'subtract',v_quantity,'Venta pedido manual',p_order_id,null);
        end if;
      end loop;
      update public.orders set status='Pagado',paid_at=now(),stock_applied=true,updated_at=now()
      where id=p_order_id;
    end if;
    select * into v_order from public.orders where id=p_order_id;
  end if;
  select coalesce(jsonb_agg(to_jsonb(i)-'unit_cost' order by i.created_at,i.id),'[]'::jsonb)
    into v_items from public.order_items i where order_id=p_order_id;
  return jsonb_build_object('order',to_jsonb(v_order),'items',v_items);
end $$;
revoke all on function public.internal_manual_order(uuid,text,text,bigint,jsonb,jsonb) from public,anon;
grant execute on function public.internal_manual_order(uuid,text,text,bigint,jsonb,jsonb) to authenticated;

commit;
select 'manual_orders_ready' as result,
  has_function_privilege('authenticated','public.internal_manual_order(uuid,text,text,bigint,jsonb,jsonb)','execute') as authenticated_can_execute,
  has_function_privilege('anon','public.internal_manual_order(uuid,text,text,bigint,jsonb,jsonb)','execute') as anon_can_execute;
