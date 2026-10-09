-- Punto X Mayor - correlativo global para Pedido Web y Venta Local.
-- Ejecutar una sola vez en Supabase SQL Editor.
-- No renumera pedidos/ventas existentes y no toca stock, movimientos, precios ni costos.

begin;

create extension if not exists pgcrypto with schema extensions;

create sequence if not exists public.orders_order_number_seq;

alter table public.orders
  alter column order_number set default nextval('public.orders_order_number_seq'::regclass);

alter sequence public.orders_order_number_seq owned by public.orders.order_number;

do $$
declare
  v_max_existing bigint;
  v_last_value bigint;
  v_is_called boolean;
  v_next_from_sequence bigint;
  v_next bigint;
begin
  select coalesce(max(order_number), 0) + 1
    into v_max_existing
  from public.orders;

  select last_value, is_called
    into v_last_value, v_is_called
  from public.orders_order_number_seq;

  v_next_from_sequence := case
    when v_is_called then coalesce(v_last_value, 0) + 1
    else coalesce(v_last_value, 1)
  end;

  v_next := greatest(v_max_existing, v_next_from_sequence, 1);

  perform setval('public.orders_order_number_seq', v_next, false);
end $$;

create unique index if not exists orders_order_number_key on public.orders(order_number);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

create or replace function public.create_order_internal(order_payload jsonb, item_payload jsonb, forced_origin text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  saved_order public.orders%rowtype;
  saved_items jsonb;
  clean_origin text;
begin
  if coalesce(jsonb_array_length(item_payload), 0) = 0 then
    raise exception 'La operación no tiene productos.';
  end if;

  clean_origin := case
    when lower(coalesce(forced_origin, 'web')) = 'local' then 'local'
    else 'web'
  end;

  insert into public.orders (
    customer_name,
    customer_phone,
    customer_location,
    status,
    origin,
    subtotal,
    total,
    discount_type,
    discount_value,
    discount_amount,
    payment_method,
    delivery_notes,
    stock_applied,
    paid_at,
    updated_at
  )
  values (
    left(coalesce(order_payload->>'customer_name', ''), 160),
    left(coalesce(order_payload->>'customer_phone', ''), 60),
    left(coalesce(order_payload->>'customer_location', ''), 160),
    coalesce(nullif(order_payload->>'status', ''), 'En revisión'),
    clean_origin,
    greatest(coalesce((order_payload->>'subtotal')::numeric, 0), 0),
    greatest(coalesce((order_payload->>'total')::numeric, 0), 0),
    coalesce(nullif(order_payload->>'discount_type', ''), 'fixed'),
    greatest(coalesce((order_payload->>'discount_value')::numeric, 0), 0),
    greatest(coalesce((order_payload->>'discount_amount')::numeric, 0), 0),
    coalesce(nullif(order_payload->>'payment_method', ''), 'Transferencia'),
    coalesce(order_payload->>'delivery_notes', ''),
    coalesce((order_payload->>'stock_applied')::boolean, false),
    case
      when nullif(order_payload->>'paid_at', '') is null then null
      else (order_payload->>'paid_at')::timestamptz
    end,
    now()
  )
  returning * into saved_order;

  with inserted as (
    insert into public.order_items (
      order_id,
      product_id,
      product_name,
      variant_name,
      presentation,
      stock_unit,
      quantity,
      unit_price,
      unit_cost,
      subtotal
    )
    select
      saved_order.id,
      nullif(item->>'product_id', '')::uuid,
      left(coalesce(item->>'product_name', 'Producto'), 220),
      left(coalesce(item->>'variant_name', ''), 120),
      left(coalesce(item->>'presentation', ''), 80),
      case
        when lower(coalesce(item->>'stock_unit', '')) = 'docenas' then 'docenas'
        else 'unidades'
      end,
      greatest(coalesce((item->>'quantity')::integer, 1), 1),
      greatest(coalesce((item->>'unit_price')::numeric, 0), 0),
      greatest(coalesce((item->>'unit_cost')::numeric, 0), 0),
      greatest(coalesce((item->>'subtotal')::numeric, 0), 0)
    from jsonb_array_elements(item_payload) as item
    returning *
  )
  select coalesce(jsonb_agg(to_jsonb(inserted) order by inserted.created_at, inserted.id), '[]'::jsonb)
    into saved_items
  from inserted;

  return jsonb_build_object(
    'order', to_jsonb(saved_order),
    'items', saved_items
  );
end;
$$;

create or replace function public.create_web_order(order_payload jsonb, item_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return public.create_order_internal(order_payload, item_payload, 'web');
end;
$$;

create or replace function public.create_local_order(order_payload jsonb, item_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if auth.uid() is null then
    raise exception 'Usuario no autenticado.' using errcode = '28000';
  end if;
  return public.create_order_internal(order_payload, item_payload, 'local');
end;
$$;

revoke all on function public.create_order_internal(jsonb, jsonb, text) from public;
revoke all on function public.create_web_order(jsonb, jsonb) from public;
revoke all on function public.create_local_order(jsonb, jsonb) from public;

grant execute on function public.create_web_order(jsonb, jsonb) to anon, authenticated;
grant execute on function public.create_local_order(jsonb, jsonb) to authenticated;

commit;

select
  'global_order_numbering_ready' as check_name,
  (select coalesce(max(order_number), 0) from public.orders) as current_max_order_number,
  (select last_value from public.orders_order_number_seq) as sequence_last_value,
  has_function_privilege('anon', 'public.create_web_order(jsonb, jsonb)', 'execute') as anon_can_create_web_order,
  has_function_privilege('anon', 'public.create_local_order(jsonb, jsonb)', 'execute') as anon_can_create_local_order,
  has_function_privilege('authenticated', 'public.create_local_order(jsonb, jsonb)', 'execute') as authenticated_can_create_local_order;
