-- Movimientos de stock para Punto X Mayor.
-- Ejecutar en Supabase SQL Editor del proyecto productivo.

create table if not exists public.stock_movements (
  id uuid primary key default extensions.gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  product_name text not null default '',
  movement_type text not null check (movement_type in ('entrada', 'salida')),
  reason text not null default 'Ajuste',
  quantity numeric not null check (quantity > 0),
  stock_unit text not null default 'unidades' check (stock_unit in ('unidades', 'docenas')),
  previous_stock numeric not null default 0,
  new_stock numeric not null default 0,
  order_id uuid references public.orders(id) on delete set null,
  user_id uuid default auth.uid(),
  user_email text default (auth.jwt() ->> 'email'),
  created_at timestamptz not null default now()
);

alter table public.stock_movements add column if not exists id uuid default extensions.gen_random_uuid();
alter table public.stock_movements alter column id set default extensions.gen_random_uuid();
alter table public.stock_movements add column if not exists product_id uuid references public.products(id) on delete set null;
alter table public.stock_movements add column if not exists product_name text not null default '';
alter table public.stock_movements add column if not exists movement_type text not null default 'salida';
alter table public.stock_movements add column if not exists reason text not null default 'Ajuste';
alter table public.stock_movements add column if not exists quantity numeric not null default 1;
alter table public.stock_movements add column if not exists stock_unit text not null default 'unidades';
alter table public.stock_movements add column if not exists previous_stock numeric not null default 0;
alter table public.stock_movements add column if not exists new_stock numeric not null default 0;
alter table public.stock_movements add column if not exists order_id uuid references public.orders(id) on delete set null;
alter table public.stock_movements add column if not exists user_id uuid default auth.uid();
alter table public.stock_movements add column if not exists user_email text default (auth.jwt() ->> 'email');
alter table public.stock_movements add column if not exists created_at timestamptz not null default now();

create index if not exists stock_movements_product_id_idx on public.stock_movements(product_id);
create index if not exists stock_movements_created_at_idx on public.stock_movements(created_at desc);
create index if not exists stock_movements_movement_type_idx on public.stock_movements(movement_type);

alter table public.stock_movements enable row level security;
grant select, insert on public.stock_movements to authenticated;

drop policy if exists "Authenticated can read stock movements" on public.stock_movements;
create policy "Authenticated can read stock movements"
on public.stock_movements
for select
to authenticated
using (true);

drop policy if exists "Authenticated can insert stock movements" on public.stock_movements;
create policy "Authenticated can insert stock movements"
on public.stock_movements
for insert
to authenticated
with check (auth.uid() is not null and coalesce(user_id, auth.uid()) = auth.uid());

create or replace function public.adjust_product_stock(
  product_id uuid,
  movement_type text,
  movement_quantity numeric,
  movement_reason text default 'Ajuste',
  related_order_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  current_product public.products%rowtype;
  saved_movement public.stock_movements%rowtype;
  previous_stock numeric;
  next_stock numeric;
  normalized_type text;
  normalized_quantity numeric;
begin
  if auth.uid() is null then
    raise exception 'Usuario no autenticado.' using errcode = '28000';
  end if;

  normalized_type := lower(trim(coalesce(adjust_product_stock.movement_type, '')));
  if normalized_type not in ('entrada', 'salida') then
    raise exception 'Tipo de movimiento inválido: %', adjust_product_stock.movement_type;
  end if;

  normalized_quantity := round(coalesce(adjust_product_stock.movement_quantity, 0));
  if normalized_quantity <= 0 then
    raise exception 'La cantidad debe ser mayor a cero.';
  end if;

  select *
  into current_product
  from public.products p
  where p.id = adjust_product_stock.product_id
  for update;

  if not found then
    raise exception 'Producto no encontrado: %', adjust_product_stock.product_id;
  end if;

  previous_stock := greatest(0, round(coalesce(current_product.stock, 0)));
  next_stock := case
    when normalized_type = 'entrada' then previous_stock + normalized_quantity
    else previous_stock - normalized_quantity
  end;

  if next_stock < 0 then
    raise exception 'Stock insuficiente. Stock actual: %, salida solicitada: %', previous_stock, normalized_quantity;
  end if;

  update public.products
  set stock = next_stock
  where id = current_product.id
  returning * into current_product;

  insert into public.stock_movements (
    product_id,
    product_name,
    movement_type,
    reason,
    quantity,
    stock_unit,
    previous_stock,
    new_stock,
    order_id,
    user_id,
    user_email
  )
  values (
    current_product.id,
    coalesce(current_product.name, ''),
    normalized_type,
    coalesce(nullif(trim(adjust_product_stock.movement_reason), ''), 'Ajuste'),
    normalized_quantity,
    coalesce(nullif(current_product.stock_unit, ''), 'unidades'),
    previous_stock,
    next_stock,
    adjust_product_stock.related_order_id,
    auth.uid(),
    null
  )
  returning * into saved_movement;

  return jsonb_build_object(
    'product_id', current_product.id,
    'previous_stock', previous_stock,
    'new_stock', next_stock,
    'movement', to_jsonb(saved_movement)
  );
end;
$$;

revoke all on function public.adjust_product_stock(uuid, text, numeric, text, uuid) from public;
revoke all on function public.adjust_product_stock(uuid, text, numeric, text, uuid) from anon;
grant execute on function public.adjust_product_stock(uuid, text, numeric, text, uuid) to authenticated;
