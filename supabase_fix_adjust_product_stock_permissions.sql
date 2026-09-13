-- Corrige permisos de public.adjust_product_stock sin habilitar acceso anonimo.
-- Ejecutar en Supabase SQL Editor del proyecto productivo.

grant usage on schema public to authenticated;

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
    raise exception 'Sesion vencida. Volve a iniciar sesion.' using errcode = '28000';
  end if;

  normalized_type := lower(trim(coalesce(adjust_product_stock.movement_type, '')));
  if normalized_type not in ('entrada', 'salida') then
    raise exception 'Tipo de movimiento invalido: %', adjust_product_stock.movement_type;
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

do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as function_signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'adjust_product_stock'
  loop
    execute format('revoke all on function %s from public', fn.function_signature);
    execute format('revoke all on function %s from anon', fn.function_signature);
    execute format('grant execute on function %s to authenticated', fn.function_signature);
  end loop;
end $$;

notify pgrst, 'reload schema';

select
  n.nspname as schema_name,
  p.proname as function_name,
  p.oid::regprocedure::text as function_signature,
  p.prosecdef as security_definer,
  has_function_privilege('anon', p.oid, 'execute') as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'execute') as authenticated_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'adjust_product_stock'
order by p.oid::regprocedure::text;
