-- Punto X Mayor - stock sin costo promedio ponderado.
-- Reemplaza public.adjust_product_stock para que entrada/salida solo modifiquen stock.
-- No modifica products.cost_price ni recalcula costos existentes.

begin;

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
  next_stock := case
    when stored_type = 'add' then previous_stock + normalized_quantity
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
    null,
    null,
    null,
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

revoke all on function public.adjust_product_stock(uuid, text, numeric, text, uuid, numeric) from public;
revoke all on function public.adjust_product_stock(uuid, text, numeric, text, uuid, numeric) from anon;
grant execute on function public.adjust_product_stock(uuid, text, numeric, text, uuid, numeric) to authenticated;

commit;

select
  'adjust_product_stock_without_weighted_cost_ready' as check_name,
  has_function_privilege('authenticated', 'public.adjust_product_stock(uuid, text, numeric, text, uuid, numeric)', 'execute') as authenticated_can_execute,
  has_function_privilege('anon', 'public.adjust_product_stock(uuid, text, numeric, text, uuid, numeric)', 'execute') as anon_can_execute;
