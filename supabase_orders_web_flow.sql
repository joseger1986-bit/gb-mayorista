-- Punto X Mayor - pedidos web con numeracion global
-- Ejecutar en Supabase SQL Editor del proyecto wcnxwjqfmpmoyzbdovqp.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.orders (
  id uuid primary key default extensions.gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists public.orders_order_number_seq;

alter table public.orders
  add column if not exists order_number integer,
  add column if not exists customer_name text not null default '',
  add column if not exists customer_phone text not null default '',
  add column if not exists customer_location text not null default '',
  add column if not exists status text not null default 'En revisión',
  add column if not exists origin text not null default 'web',
  add column if not exists subtotal numeric not null default 0,
  add column if not exists total numeric not null default 0,
  add column if not exists discount_type text not null default 'fixed',
  add column if not exists discount_value numeric not null default 0,
  add column if not exists discount_amount numeric not null default 0,
  add column if not exists payment_method text not null default 'Transferencia',
  add column if not exists delivery_notes text not null default '',
  add column if not exists stock_applied boolean not null default false,
  add column if not exists paid_at timestamptz;

alter sequence public.orders_order_number_seq owned by public.orders.order_number;

alter table public.orders
  alter column order_number set default nextval('public.orders_order_number_seq'::regclass);

update public.orders
set order_number = nextval('public.orders_order_number_seq'::regclass)
where order_number is null;

alter table public.orders
  alter column order_number set not null;

create unique index if not exists orders_order_number_key on public.orders(order_number);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_origin_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_origin_check check (origin in ('web', 'local'));
  end if;
end $$;

create table if not exists public.order_items (
  id uuid primary key default extensions.gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.order_items
  add column if not exists product_id uuid,
  add column if not exists product_name text not null default '',
  add column if not exists variant_name text not null default '',
  add column if not exists presentation text not null default '',
  add column if not exists stock_unit text not null default 'unidades',
  add column if not exists quantity integer not null default 1,
  add column if not exists unit_price numeric not null default 0,
  add column if not exists unit_cost numeric not null default 0,
  add column if not exists subtotal numeric not null default 0;

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_origin_idx on public.orders(origin);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

select setval(
  'public.orders_order_number_seq',
  coalesce((select max(order_number) from public.orders), 0) + 1,
  false
);

create or replace function public.create_web_order(order_payload jsonb, item_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  saved_order public.orders%rowtype;
  saved_items jsonb;
begin
  if coalesce(jsonb_array_length(item_payload), 0) = 0 then
    raise exception 'El pedido no tiene productos.';
  end if;

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
    updated_at
  )
  values (
    left(coalesce(order_payload->>'customer_name', ''), 160),
    left(coalesce(order_payload->>'customer_phone', ''), 60),
    left(coalesce(order_payload->>'customer_location', ''), 160),
    coalesce(nullif(order_payload->>'status', ''), 'En revisión'),
    'web',
    greatest(coalesce((order_payload->>'subtotal')::numeric, 0), 0),
    greatest(coalesce((order_payload->>'total')::numeric, 0), 0),
    coalesce(nullif(order_payload->>'discount_type', ''), 'fixed'),
    greatest(coalesce((order_payload->>'discount_value')::numeric, 0), 0),
    greatest(coalesce((order_payload->>'discount_amount')::numeric, 0), 0),
    coalesce(nullif(order_payload->>'payment_method', ''), 'Transferencia'),
    coalesce(order_payload->>'delivery_notes', ''),
    false,
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

revoke all on function public.create_web_order(jsonb, jsonb) from public;
grant execute on function public.create_web_order(jsonb, jsonb) to anon, authenticated;

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'Authenticated can manage orders'
  ) then
    create policy "Authenticated can manage orders"
      on public.orders
      for all
      to authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'order_items' and policyname = 'Authenticated can manage order items'
  ) then
    create policy "Authenticated can manage order items"
      on public.order_items
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;

-- Verificacion rapida:
-- select routine_name from information_schema.routines where routine_schema = 'public' and routine_name = 'create_web_order';
-- select column_name from information_schema.columns where table_schema = 'public' and table_name = 'orders' order by ordinal_position;
-- select column_name from information_schema.columns where table_schema = 'public' and table_name = 'order_items' order by ordinal_position;
