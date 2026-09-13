-- Punto X Mayor - costo promedio ponderado.
-- Ejecutar en Supabase SQL Editor antes de publicar el frontend que envia movement_unit_cost.
-- No modifica stock ni costos existentes al aplicar la migracion.

alter table public.products add column if not exists cost_price numeric default 0;
alter table public.order_items add column if not exists unit_cost numeric default 0;
alter table public.stock_movements add column if not exists unit_cost numeric;
alter table public.stock_movements add column if not exists previous_cost numeric;
alter table public.stock_movements add column if not exists new_cost numeric;
alter table public.stock_movements add column if not exists total_cost numeric;

drop function if exists public.adjust_product_stock(uuid, text, numeric, text, uuid);
drop function if exists public.adjust_product_stock(uuid, text, numeric, text, uuid, numeric);

create or replace function public.adjust_product_stock(
  product_id uuid,
  movement_type text,
  movement_quantity numeric,
  movement_reason text default 'Ajuste',
  related_order_id uuid default null,
  movement_unit_cost numeric default null
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
  previous_cost numeric;
  incoming_cost numeric;
  next_cost numeric;
  movement_cost numeric;
  normalized_type text;
  stored_type text;
  normalized_quantity numeric;
begin
  if auth.uid() is null then
    raise exception 'Usuario no autenticado.' using errcode = '28000';
  end if;

  normalized_type := lower(trim(coalesce(adjust_product_stock.movement_type, '')));
  if normalized_type in ('entrada', 'add') then
    stored_type := 'add';
  elsif normalized_type in ('salida', 'subtract') then
    stored_type := 'subtract';
  else
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
  previous_cost := greatest(0, coalesce(current_product.cost_price, 0));
  next_stock := case
    when stored_type = 'add' then previous_stock + normalized_quantity
    else previous_stock - normalized_quantity
  end;

  if next_stock < 0 then
    raise exception 'Stock insuficiente. Stock actual: %, salida solicitada: %', previous_stock, normalized_quantity;
  end if;

  if stored_type = 'add' then
    incoming_cost := greatest(0, coalesce(adjust_product_stock.movement_unit_cost, 0));
    if incoming_cost <= 0 then
      raise exception 'Ingresá el costo de la mercadería que entra.';
    end if;
    next_cost := case
      when previous_stock + normalized_quantity > 0 then
        round(((previous_stock * previous_cost) + (normalized_quantity * incoming_cost)) / (previous_stock + normalized_quantity), 2)
      else incoming_cost
    end;
    movement_cost := incoming_cost;
  else
    incoming_cost := null;
    next_cost := previous_cost;
    movement_cost := previous_cost;
  end if;

  update public.products
  set
    stock = next_stock,
    cost_price = next_cost
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
    user_email,
    unit_cost,
    previous_cost,
    new_cost,
    total_cost
  )
  values (
    current_product.id,
    coalesce(current_product.name, ''),
    stored_type,
    coalesce(nullif(trim(adjust_product_stock.movement_reason), ''), 'Ajuste'),
    normalized_quantity,
    coalesce(nullif(current_product.stock_unit, ''), 'unidades'),
    previous_stock,
    next_stock,
    adjust_product_stock.related_order_id,
    auth.uid(),
    null,
    movement_cost,
    previous_cost,
    next_cost,
    round(normalized_quantity * coalesce(movement_cost, 0), 2)
  )
  returning * into saved_movement;

  return jsonb_build_object(
    'product_id', current_product.id,
    'previous_stock', previous_stock,
    'new_stock', next_stock,
    'previous_cost', previous_cost,
    'new_cost', next_cost,
    'movement', to_jsonb(saved_movement)
  );
end;
$$;

revoke all on function public.adjust_product_stock(uuid, text, numeric, text, uuid, numeric) from public;
revoke all on function public.adjust_product_stock(uuid, text, numeric, text, uuid, numeric) from anon;
grant execute on function public.adjust_product_stock(uuid, text, numeric, text, uuid, numeric) to authenticated;

select
  'adjust_product_stock_weighted_average_ready' as check_name,
  has_function_privilege('authenticated', 'public.adjust_product_stock(uuid, text, numeric, text, uuid, numeric)', 'execute') as authenticated_can_execute,
  has_function_privilege('anon', 'public.adjust_product_stock(uuid, text, numeric, text, uuid, numeric)', 'execute') as anon_can_execute;
