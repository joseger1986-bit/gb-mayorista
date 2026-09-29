-- Punto X Mayor - restauracion segura de precios de costo.
-- Fuente historica: solicitud de actualizacion de costos/precios del 2026-09-13.
-- Actualiza UNICAMENTE public.products.cost_price en productos activos existentes.

begin;

create temp table _pxm_cost_restore (
  update_key text primary key,
  aliases text[] not null,
  option_name text,
  assortment_name text,
  cost_price numeric not null,
  required boolean not null default true
) on commit drop;

insert into _pxm_cost_restore (update_key, aliases, option_name, assortment_name, cost_price, required) values
-- Blanqueria
('blanq_toalla_mano_fv_400', array['Toalla de Mano F. Valente 400 g'], null, null, 3400, true),
('blanq_toalla_visita_fv_450', array['Toalla de Visita F. Valente 450 g'], null, null, 1700, true),
('blanq_toallon_fv_400', array['Toallón F. Valente 400 g','Toallon F. Valente 400 g'], null, null, 8100, true),
('blanq_toallon_fv_500', array['Toallón F. Valente 500 g','Toallon F. Valente 500 g'], null, null, 11700, true),
('blanq_juego_tt_fv_400', array['Juego T+T F. Valente 400 g'], null, null, 12000, true),
('blanq_juego_tt_fv_500', array['Juego T+T F. Valente 500 g'], null, null, 16200, true),
('blanq_repasadores_fv', array['Repasadores F. Valente'], null, null, 2630, true),
('blanq_juego_tt_palette', array['Juego T+T Palette 420 g'], null, null, 10700, true),
('blanq_toalla_mano_fantasia', array['Toalla de Mano Fantasía','Toalla de Mano Fantasia'], null, null, 2100, true),
('blanq_toallon_algodon_fantasia', array['Toallón Algodón Fantasía','Toallon Algodon Fantasia'], null, null, 5600, true),
('blanq_repasador_corazon', array['Repasador Corazón','Repasador Corazon'], null, null, 10200, true),
('blanq_repasador_economico', array['Repasador Algodón Económico','Repasador Algodon Economico'], null, null, 5800, true),
('blanq_paris_400_1_2', array['Juego de Sábanas París 400 hilos 1½ Plaza','Juego de Sabanas Paris 400 hilos 1/2 Plaza','Juego de Sábanas París 400 hilos 1 1/2 Plaza'], null, null, 8400, true),
('blanq_paris_400_2_2', array['Juego de Sábanas París 400 hilos 2½ Plazas','Juego de Sabanas Paris 400 hilos 2/2 Plazas','Juego de Sábanas París 400 hilos 2 1/2 Plazas'], null, null, 10000, true),
('blanq_almohadas_brisa', array['Almohadas Brisa','Almohadas'], null, null, 4400, true),
('blanq_sabanas_king', array['Juegos Sábanas King','Juego de Sábanas King','Juegos Sabanas King','Juego de Sabanas King'], null, null, 10000, true),
('blanq_arciel', array['Juego Toalla y Toallón Algodón Arciel','Juego Toalla y Toallon Algodon Arciel'], null, null, 5500, true),
('blanq_panos_multiuso', array['Paños Multiuso París','Panos Multiuso Paris'], null, null, 500, true),
('blanq_toallitas_individuales', array['Toallitas Individuales Algodón','Toallitas Individuales Algodon'], null, null, 700, true),
('blanq_paris_esencial_1_2', array['Juegos Sábanas París Esencial 1½ Plaza','Juego de Sábanas París Esencial 1½ Plaza','Juegos Sabanas Paris Esencial 1/2 Plaza'], null, null, 7200, true),
('blanq_paris_esencial_2_2', array['Juegos Sábanas París Esencial 2½ Plazas','Juego de Sábanas París Esencial 2½ Plazas','Juegos Sabanas Paris Esencial 2/2 Plazas'], null, null, 8200, true),
('blanq_paris_600_1_2', array['Juego de Sábanas París 600 hilos 1½ Plaza','Juego de Sabanas Paris 600 hilos 1/2 Plaza'], null, null, 9500, true),
('blanq_paris_600_2_2', array['Juego de Sábanas París 600 hilos 2½ Plazas','Juego de Sabanas Paris 600 hilos 2/2 Plazas'], null, null, 13200, true),
('blanq_paris_800_1_2', array['Juego de Sábanas París 800 hilos 1½ Plaza','Juego de Sabanas Paris 800 hilos 1/2 Plaza'], null, null, 12000, true),
('blanq_paris_800_2_2', array['Juego de Sábanas París 800 hilos 2½ Plazas','Juego de Sabanas Paris 800 hilos 2/2 Plazas'], null, null, 16000, true),
('blanq_ajustable_twin', array['Sábanas Ajustables Algodón Twin','Sabanas Ajustables Algodon Twin'], null, null, 5500, true),
('blanq_ajustable_full', array['Sábanas Ajustables Algodón Full','Sabanas Ajustables Algodon Full'], null, null, 6000, true),
('blanq_king_premium', array['Juego de Sábanas King Premium Deluxe París','King Premium Deluxe París','Juego de Sabanas King Premium Deluxe Paris'], null, null, 16000, true),
('blanq_toallon_importado', array['Toallón Importado Algodón','Toallon Importado Algodon'], null, null, 3000, true),
('blanq_toallon_secado_rapido', array['Toallón de Secado Rápido','Toallón Secado Rápido','Toallon de Secado Rapido','Toallon Secado Rapido'], null, null, 4000, true),
('blanq_goldsun_twin', array['Juego de Sábanas Goldsun Algodón Twin','Juego de Sabanas Goldsun Algodon Twin'], null, null, 11000, true),
('blanq_goldsun_full', array['Juego de Sábanas Goldsun Algodón Full','Juego de Sabanas Goldsun Algodon Full'], null, null, 13000, true),
('blanq_cortina_bano', array['Cortina de Baño','Cortina de Bano'], null, null, 3000, false),

-- Medias
('medias_soquetes_adultos', array['Soquetes Elastizados Adultos'], null, null, 2500, true),
('medias_elastizadas_adultos', array['Medias Elastizadas Adultos'], null, null, 5000, true),
('medias_elemento_nino_104_t1', array['Soquete Elemento Niño Art. 104','Soquetes Elemento Niño Art. 104'], '1', null, 12000, true),
('medias_elemento_nino_104_t2', array['Soquete Elemento Niño Art. 104','Soquetes Elemento Niño Art. 104'], '2', null, 12000, true),
('medias_elemento_nino_104_t3', array['Soquete Elemento Niño Art. 104','Soquetes Elemento Niño Art. 104'], '3', null, 12000, true),
('medias_elemento_nino_104_t4', array['Soquete Elemento Niño Art. 104','Soquetes Elemento Niño Art. 104'], '4', null, 12000, true),
('medias_invisibles_damas', array['Soquetes Invisibles Damas','Zoquetes Invisibles Damas'], null, null, 5000, true),
('medias_invisibles_hombres', array['Soquetes Invisibles Hombres','Zoquetes Invisibles Hombres'], null, null, 5000, true),
('medias_402r', array['Medias 1/3 Elemento Hombre Art. 402R'], null, null, 22800, true),
('medias_102mr', array['Soquetes Elemento Hombre Art. 102MR','Zoquetes Elemento Hombre Art. 102MR'], null, null, 18000, true),
('medias_111mr', array['Soquetes Elemento Dama Art. 111MR','Zoquetes Elemento Dama Art. 111MR'], null, null, 15600, true),
('medias_102d', array['Soquetes Elemento Hombre Art. 102D','Zoquetes Elemento Hombre Art. 102D'], null, null, 18000, true),
('medias_101d', array['Soquetes Elemento Dama Art. 101D','Zoquetes Elemento Dama Art. 101D'], null, null, 15600, true),
('medias_101l', array['Soquetes Elemento Dama Art. 101L','Zoquetes Elemento Dama Art. 101L'], null, null, 15600, true),
('medias_102l', array['Soquetes Elemento Hombre Art. 102L','Zoquetes Elemento Hombre Art. 102L'], null, null, 18000, true),
('medias_401l', array['Medias 1/3 Elemento Dama Art. 401L'], null, null, 19200, true),
('medias_102l_x3', array['Soquetes Elemento Hombre Art. 102L x3','Zoquetes Elemento Hombre Art. 102L x3'], null, null, 16800, true),
('medias_101l_x3', array['Soquetes Elemento Dama Art. 101L x3','Zoquetes Elemento Dama Art. 101L x3'], null, null, 14400, true),
('medias_nenes_4_6', array['Soquetes Elastizados Nenes','Zoquetes Elastizados Nenes'], '4-6', null, 3000, true),
('medias_nenes_6_8', array['Soquetes Elastizados Nenes','Zoquetes Elastizados Nenes'], '6-8', null, 3000, true),
('medias_nenes_8_10', array['Soquetes Elastizados Nenes','Zoquetes Elastizados Nenes'], '8-10', null, 3000, true),
('medias_nenas_4_6', array['Soquetes Elastizados Nenas','Zoquetes Elastizados Nenas'], '4-6', null, 3000, true),
('medias_nenas_6_8', array['Soquetes Elastizados Nenas','Zoquetes Elastizados Nenas'], '6-8', null, 3000, true),
('medias_nenas_8_10', array['Soquetes Elastizados Nenas','Zoquetes Elastizados Nenas'], '8-10', null, 3000, true),
('medias_401r', array['Medias 1/3 Elemento Dama Art. 401R'], null, null, 19200, true),

-- Ropa Interior Hombre
('hombre_uomo_adulto', array['Boxer Uomo Adulto','Boxers Uomo Adulto','Boxer Uomo Surtido de talles M al 4XL'], null, null, 20000, true),
('hombre_lody_t1', array['Boxer Lody Adulto Art. 742','Boxer Adulto Lody Art. 742'], '1', null, 5500, true),
('hombre_lody_t2', array['Boxer Lody Adulto Art. 742','Boxer Adulto Lody Art. 742'], '2', null, 5500, true),
('hombre_lody_t3', array['Boxer Lody Adulto Art. 742','Boxer Adulto Lody Art. 742'], '3', null, 5500, true),
('hombre_lody_t4', array['Boxer Lody Adulto Art. 742','Boxer Adulto Lody Art. 742'], '4', null, 5500, true),
('hombre_lody_t5', array['Boxer Lody Adulto Art. 742','Boxer Adulto Lody Art. 742'], '5', null, 5600, true),
('hombre_lody_t6', array['Boxer Lody Adulto Art. 742','Boxer Adulto Lody Art. 742'], '6', null, 5600, true),
('hombre_xy_t1', array['Boxer XY Art. 1387 Liso','Boxer XY Adulto Art. 1387'], '1', null, 5500, true),
('hombre_xy_t2', array['Boxer XY Art. 1387 Liso','Boxer XY Adulto Art. 1387'], '2', null, 5500, true),
('hombre_xy_t3', array['Boxer XY Art. 1387 Liso','Boxer XY Adulto Art. 1387'], '3', null, 5500, true),
('hombre_xy_t4', array['Boxer XY Art. 1387 Liso','Boxer XY Adulto Art. 1387'], '4', null, 5500, true),
('hombre_xy_t5', array['Boxer XY Art. 1387 Liso','Boxer XY Adulto Art. 1387'], '5', null, 5500, true),
('hombre_xy_t6', array['Boxer XY Art. 1387 Liso','Boxer XY Adulto Art. 1387'], '6', null, 5900, true),
('hombre_dufour_t1', array['Boxer Dufour Art. 11855'], '1', null, 2700, true),
('hombre_dufour_t2', array['Boxer Dufour Art. 11855'], '2', null, 2700, true),
('hombre_dufour_t3', array['Boxer Dufour Art. 11855'], '3', null, 2700, true),
('hombre_dufour_t4', array['Boxer Dufour Art. 11855'], '4', null, 2700, true),
('hombre_dufour_t5', array['Boxer Dufour Art. 11855'], '5', null, 2700, true),
('hombre_maxton_t2', array['Boxer Maxton'], '2', null, 4000, true),
('hombre_maxton_t3', array['Boxer Maxton'], '3', null, 4000, true),
('hombre_maxton_t4', array['Boxer Maxton'], '4', null, 4000, true),
('hombre_maxton_t5', array['Boxer Maxton'], '5', null, 4000, true),
('hombre_maxton_t6', array['Boxer Maxton'], '6', null, 4000, true),

-- Ropa Interior Dama
('dama_colaless_intima', array['Colaless Algodón Íntima','Colaless Algodon Intima'], null, null, 20000, true),
('dama_vedetina_intima', array['Vedetina Algodón Íntima','Vedetina Algodon Intima'], null, null, 20000, true),
('dama_vedetina_especial', array['Vedetina Especial Algodón Íntima','Vedetina Especial Algodon Intima'], null, null, 26000, true),
('dama_universal_intima', array['Universal Algodón Íntima','Universal Algodon Intima'], null, null, 30000, true),
('dama_tiro_corto', array['Tiro Corto Algodón Íntima','Tiro Corto Algodon Intima'], null, null, 26000, true),
('dama_colaless_economica', array['Colaless Algodón Línea Económica','Colaless Algodon Linea Economica'], null, null, 10000, true),
('dama_vedetina_economica', array['Vedetina Algodón Línea Económica','Vedetina Algodon Linea Economica'], null, null, 10000, true),
('dama_regulable_economica', array['Regulable Línea Económica','Regulable Linea Economica'], null, null, 10000, true),
('dama_conjunto_728', array['Conjunto Taza Soft Art. 728','Conjunto Taza Soft Art.728'], null, null, 45000, true),
('dama_conjunto_746', array['Conjunto Triángulo Soft Art. 746','Conjunto Triangulo Soft Art.746'], null, null, 36000, true),
('dama_conjunto_741', array['Conjunto Triángulo Soft Art. 741','Conjunto Triangulo Soft Art.741'], null, null, 36000, true),

-- Ropa Interior Nino
('nino_uomo_panalero', array['Boxer Uomo Niño Pañalero','Boxers Uomo Niño Pañalero'], null, null, 18000, true),
('nino_uomo_intermedio', array['Boxer Uomo Niño Intermedio','Boxers Uomo Niño Intermedio'], null, null, 18000, true),
('nino_uomo_juvenil', array['Boxer Uomo Juvenil','Boxers Uomo Juvenil'], null, null, 18000, true),
('nino_bombachas_ninas', array['Bombachas Algodón Niñas','Bombachas Algodon Niñas'], null, null, 9000, true),
('nino_bombachas_juvenil', array['Bombachas Algodón Juvenil','Bombachas Algodon Juvenil'], null, null, 12000, true);

create or replace function pg_temp.pxm_norm(value text)
returns text
language sql
immutable
as $$
  select trim(regexp_replace(
    translate(
      lower(replace(coalesce(value, ''), '½', '1/2')),
      'áàäâãéèëêíìïîóòöôõúùüûñç',
      'aaaaaeeeeiiiiooooouuuunc'
    ),
    '[^a-z0-9]+',
    ' ',
    'g'
  ));
$$;

create temp table _pxm_cost_matches on commit drop as
with expanded_aliases as (
  select
    u.update_key,
    u.option_name,
    u.assortment_name,
    u.cost_price,
    u.required,
    alias
  from _pxm_cost_restore u
  cross join lateral unnest(u.aliases) as alias
),
candidates as (
  select distinct
    u.update_key,
    p.id,
    p.name,
    p.base_name,
    p.option_name,
    p.assortment_name,
    u.cost_price
  from expanded_aliases u
  join public.products p
    on p.active is true
   and (
     pg_temp.pxm_norm(coalesce(p.base_name, p.name)) = pg_temp.pxm_norm(u.alias)
     or pg_temp.pxm_norm(p.name) = pg_temp.pxm_norm(u.alias)
     or pg_temp.pxm_norm(p.name) like '%' || pg_temp.pxm_norm(u.alias) || '%'
   )
   and (
     u.option_name is null
     or pg_temp.pxm_norm(coalesce(p.option_name, '')) = pg_temp.pxm_norm(u.option_name)
     or pg_temp.pxm_norm(coalesce(p.option_name, '')) = pg_temp.pxm_norm('Talle ' || u.option_name)
     or pg_temp.pxm_norm(p.name) like '%' || pg_temp.pxm_norm('Talle ' || u.option_name) || '%'
     or pg_temp.pxm_norm(p.name) like '%' || pg_temp.pxm_norm('T' || u.option_name) || '%'
   )
   and (
     u.assortment_name is null
     or pg_temp.pxm_norm(coalesce(p.assortment_name, '')) = pg_temp.pxm_norm(u.assortment_name)
     or pg_temp.pxm_norm(p.name) like '%' || pg_temp.pxm_norm(u.assortment_name) || '%'
   )
)
select *
from candidates;

do $$
declare
  problem text;
begin
  select string_agg(u.update_key, ', ' order by u.update_key)
    into problem
  from _pxm_cost_restore u
  left join _pxm_cost_matches m on m.update_key = u.update_key
  where u.required is true
    and m.update_key is null;

  if problem is not null then
    raise exception 'No se encontraron productos activos requeridos para restaurar costo: %', problem;
  end if;

  select string_agg(update_key || ' -> ' || match_count::text, ', ' order by update_key)
    into problem
  from (
    select update_key, count(*) as match_count
    from _pxm_cost_matches
    group by update_key
    having count(*) > 1
  ) duplicated;

  if problem is not null then
    raise exception 'Coincidencias ambiguas por regla de costo: %', problem;
  end if;

  select string_agg(name || ' (' || product_id || ')', ', ' order by name)
    into problem
  from (
    select id as product_id, min(name) as name, count(*) as match_count
    from _pxm_cost_matches
    group by id
    having count(*) > 1
  ) duplicated_products;

  if problem is not null then
    raise exception 'Un producto activo coincide con mas de una regla de costo: %', problem;
  end if;
end $$;

update public.products p
   set cost_price = m.cost_price
  from _pxm_cost_matches m
 where p.id = m.id
   and p.active is true;

-- La RPC de costos vuelve a leer la fuente definitiva: public.products.cost_price.
drop function if exists public.internal_admin_products_with_cost();
drop function if exists public.internal_admin_products_with_cost(text);

create or replace function public.internal_admin_products_with_cost(p_profile_token text)
returns table (
  id uuid,
  category_id uuid,
  category_name text,
  name text,
  brand text,
  presentation text,
  sale_price numeric,
  cost_price numeric,
  stock numeric,
  show_in_catalog boolean,
  image_path text,
  active boolean,
  sort_order integer,
  description text,
  gallery_images jsonb,
  stock_unit text,
  base_name text,
  option_name text,
  assortment_name text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.internal_is_admin_profile(p_profile_token) then
    raise exception 'No autorizado';
  end if;

  return query
  select
    p.id,
    p.category_id,
    c.name as category_name,
    p.name,
    p.brand,
    p.presentation,
    p.sale_price,
    greatest(coalesce(p.cost_price, 0), 0) as cost_price,
    p.stock,
    p.show_in_catalog,
    p.image_path,
    p.active,
    p.sort_order,
    p.description,
    p.gallery_images,
    p.stock_unit,
    p.base_name,
    p.option_name,
    p.assortment_name,
    p.created_at,
    p.updated_at
  from public.products p
  left join public.categories c on c.id = p.category_id
  where p.active is true
  order by p.sort_order asc nulls last, p.name asc;
end;
$$;

revoke all on function public.internal_admin_products_with_cost(text) from public;
grant execute on function public.internal_admin_products_with_cost(text) to authenticated;

commit;

select
  count(*) filter (where p.active is true) as active_products,
  count(*) filter (where p.active is true and coalesce(p.cost_price, 0) > 0) as active_products_with_cost,
  min(nullif(p.cost_price, 0)) filter (where p.active is true) as min_positive_cost,
  max(p.cost_price) filter (where p.active is true) as max_cost
from public.products p;

select
  c.name as category,
  count(*) as active_products,
  count(*) filter (where coalesce(p.cost_price, 0) > 0) as active_products_with_cost
from public.products p
left join public.categories c on c.id = p.category_id
where p.active is true
group by c.name
order by c.name;

select
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  p.prosecdef as security_definer,
  pg_get_functiondef(p.oid) ilike '%auth.users%' as references_auth_users,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'internal_admin_products_with_cost';
