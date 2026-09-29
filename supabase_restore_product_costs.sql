-- Punto X Mayor - restauracion de precios de costo desde Excel definitivo.
-- Fuente: punto x mayor.xlsx
-- Actualiza UNICAMENTE public.products.cost_price de productos activos por ID.
-- No modifica precios de venta, stock, presentacion, categoria, pedidos, clientes ni movimientos.

begin;

create temp table _pxm_excel_costs (
  id uuid primary key,
  cost_price numeric not null,
  product_name text,
  option_name text,
  assortment_name text,
  category_name text
) on commit drop;

insert into _pxm_excel_costs (id, cost_price, product_name, option_name, assortment_name, category_name) values
  ('3126d06f-0402-4057-b253-5e4b592c411b'::uuid, 2500, 'Soquetes Elastizados Adultos', '', '', 'Medias'),
  ('cb1df866-5cf3-4241-b3c8-3378d17c49f8'::uuid, 5000, 'Medias Elastizadas Adultos', '', '', 'Medias'),
  ('f3ba3980-0284-4e72-bfbf-8225a22731bb'::uuid, 12000, 'Soquetes Elemento Niño 104', '1', '', 'Medias'),
  ('103f4f31-69ce-4942-9a5d-98dc079bf87b'::uuid, 12000, 'Soquetes Elemento Niño 104', '2', '', 'Medias'),
  ('62be59da-2098-45af-8f2a-f09849e4fbee'::uuid, 12000, 'Soquetes Elemento Niño 104', '3', '', 'Medias'),
  ('a76af400-f718-48f5-af57-4940006590bd'::uuid, 12000, 'Soquetes Elemento Niño 104', '4', '', 'Medias'),
  ('d95cb7b5-cbbe-4a90-a653-8ce2813d9d19'::uuid, 5000, 'Soquetes invisibles damas', '', '', 'Medias'),
  ('24743a92-bfb9-4c07-a9fb-f957f1d19165'::uuid, 5000, 'Soquetes invisible hombres', '', '', 'Medias'),
  ('f24984bf-7252-4913-a695-de2eead03ec8'::uuid, 22800, 'Medias 1/3 Elemento Hombre Art. 402R', '', '', 'Medias'),
  ('8c517a1e-4505-4e3b-873e-224faaeb27e4'::uuid, 18000, 'Soquetes Elemento Hombre Art. 102MR', '', '', 'Medias'),
  ('cde8cfda-88c3-4e35-9774-e708941253ed'::uuid, 15600, 'Soquetes Elemento Dama Art. 111MR', '', '', 'Medias'),
  ('61662d1c-64e2-4119-8916-40c28a15e2e2'::uuid, 18000, 'Soquetes Elemento Hombre Art. 102D', '', '', 'Medias'),
  ('0a805bc3-af67-4efd-8c6d-5579dc9b7162'::uuid, 15600, 'Soquetes Elemento Dama Art. 101D', '', '', 'Medias'),
  ('92cbe8f6-46a4-4ab9-bc8e-aa43ee7d9171'::uuid, 15600, 'Soquetes Elemento Dama Art. 101L', '', '', 'Medias'),
  ('254f1c9a-f7eb-450f-a2eb-a1c61cadcf21'::uuid, 18000, 'Soquetes Elemento Hombre Art. 102L', '', '', 'Medias'),
  ('d179f20b-6e10-4175-b92f-ab374afd536f'::uuid, 19200, 'Medias 1/3 Elemento Dama Art. 401L', '', '', 'Medias'),
  ('cae7330a-74bd-4bf2-bcbf-5b5ec3a3906b'::uuid, 16800, 'Soquetes Elemento Hombre Art. 102L x3', '', '', 'Medias'),
  ('e56bed31-51d1-4647-911e-706ea89e1ee9'::uuid, 14400, 'Soquetes Elemento Dama Art. 101L x3', '', '', 'Medias'),
  ('5bffd8ce-ea5a-46b0-ae91-a14c1c1a1b43'::uuid, 3000, 'Soquetes Elastizados Nenes', '4-6', '', 'Medias'),
  ('5482fff9-ef45-45d4-8ec2-4f096660ae39'::uuid, 3000, 'Soquetes Elastizados Nenes', '6-8', '', 'Medias'),
  ('9215949e-11d0-4339-b73b-9a15cd74b33f'::uuid, 3000, 'Soquetes Elastizados Nenes', '8-10', '', 'Medias'),
  ('e50cc340-29f1-461a-95ae-c57984a0d315'::uuid, 3000, 'Soquetes Elastizados Nenas', '4-6', '', 'Medias'),
  ('85d6e4f7-e6f9-48a0-b2ea-822bbd0a2d9e'::uuid, 3000, 'Soquetes Elastizados Nenas', '6-8', '', 'Medias'),
  ('e5138d6b-ddfc-4084-90b1-d6a04d2156ff'::uuid, 3000, 'Soquetes Elastizados Nenas', '8-10', '', 'Medias'),
  ('877ee1d2-ff89-4abb-a6bf-be38f66b537e'::uuid, 19200, 'Medias 1/3 Elemento Dama Art. 401R', '', '', 'Medias'),
  ('b7573fe3-f0f0-431f-b98c-80d03fab357c'::uuid, 5500, 'Boxer Lody Adulto Art. 742', '1', '', 'Ropa Interior Hombre'),
  ('703cb355-cdd5-42c4-95a3-3d794dcbc618'::uuid, 5500, 'Boxer Lody Adulto Art. 742', '2', '', 'Ropa Interior Hombre'),
  ('af269fd5-8560-40db-b657-9d676e194b32'::uuid, 5500, 'Boxer Lody Adulto Art. 742', '3', '', 'Ropa Interior Hombre'),
  ('2b27ec33-3fcb-4113-b7a9-96dc348042f5'::uuid, 5500, 'Boxer Lody Adulto Art. 742', '4', '', 'Ropa Interior Hombre'),
  ('42cf67d5-5ddb-4ad1-b1b9-51e61d34d77e'::uuid, 5600, 'Boxer Lody Adulto Art. 742', '5', '', 'Ropa Interior Hombre'),
  ('9291c0d6-6836-4ba1-ba77-fc43686642ab'::uuid, 5600, 'Boxer Lody Adulto Art. 742', '6', '', 'Ropa Interior Hombre'),
  ('5de5b639-0ffc-410d-9794-7b96080875cd'::uuid, 20000, 'Boxer Uomo Surtido de talles M al 4XL', '', '', 'Ropa Interior Hombre'),
  ('5818626a-2104-4f5e-a7f5-f774fefa6b5d'::uuid, 5500, 'Boxer XY Art. 1387 Liso', '1', '', 'Ropa Interior Hombre'),
  ('e043db82-9e25-4807-a126-5f3e928feaeb'::uuid, 5500, 'Boxer XY Art. 1387 Liso', '2', '', 'Ropa Interior Hombre'),
  ('e0b3b587-4fc3-492a-b6d5-40619dffb624'::uuid, 5500, 'Boxer XY Art. 1387 Liso', '3', '', 'Ropa Interior Hombre'),
  ('11a0a724-4e03-487a-8a64-b7ed750807c1'::uuid, 5500, 'Boxer XY Art. 1387 Liso', '4', '', 'Ropa Interior Hombre'),
  ('0b751304-4ed4-49b5-8acc-3d14ff3aa1c6'::uuid, 5500, 'Boxer XY Art. 1387 Liso', '5', '', 'Ropa Interior Hombre'),
  ('e6f1fb74-d211-41ba-bec3-b7c3978b67c1'::uuid, 5900, 'Boxer XY Art. 1387 Liso', '6', '', 'Ropa Interior Hombre'),
  ('79d9d056-8565-44fe-a685-6c604419b271'::uuid, 2700, 'Boxer Dufour Art. 11855', '1', '', 'Ropa Interior Hombre'),
  ('0c14b005-e99d-4523-a6d3-cd5f926540e5'::uuid, 2700, 'Boxer Dufour Art. 11855', '2', '', 'Ropa Interior Hombre'),
  ('38173f92-86eb-40d1-8e01-e55c14a96ee0'::uuid, 2700, 'Boxer Dufour Art. 11855', '3', '', 'Ropa Interior Hombre'),
  ('5c26eccf-ed7a-4719-bff7-ac50010059dc'::uuid, 2700, 'Boxer Dufour Art. 11855', '4', '', 'Ropa Interior Hombre'),
  ('0783175f-cf94-4dcf-a3b2-61b3728aaeaf'::uuid, 2700, 'Boxer Dufour Art. 11855', '5', '', 'Ropa Interior Hombre'),
  ('f31012aa-441f-4310-9c51-ca1e0131c2c2'::uuid, 4000, 'Boxer Maxton', '2', '', 'Ropa Interior Hombre'),
  ('7a822fc2-f6a9-4e3a-9468-2bef54e61c9d'::uuid, 4000, 'Boxer Maxton', '3', '', 'Ropa Interior Hombre'),
  ('e2284d8c-57d0-4aad-869b-4faeef48ca67'::uuid, 4000, 'Boxer Maxton', '4', '', 'Ropa Interior Hombre'),
  ('eea00d8f-4b6c-4f8a-90d3-a94ddf684be1'::uuid, 4000, 'Boxer Maxton', '5', '', 'Ropa Interior Hombre'),
  ('fd357315-d33b-4908-8396-3df93395f390'::uuid, 4000, 'Boxer Maxton', '6', '', 'Ropa Interior Hombre'),
  ('36741b3a-50a2-4d44-9104-60783c7ad4d8'::uuid, 20000, 'Colaless Algodón Íntima', '', '', 'Ropa Interior Dama'),
  ('5b23a041-9154-4ce0-8fd7-6079fba4bec4'::uuid, 20000, 'Vedetina Algodón Íntima', '', '', 'Ropa Interior Dama'),
  ('4dc26f6d-890b-47f7-8d37-06fb7f107303'::uuid, 26000, 'Vedetina Especial Algodón Íntima', '', '', 'Ropa Interior Dama'),
  ('ac4a1950-2659-41fe-999b-753497fe1890'::uuid, 30000, 'Universal Algodón Íntima', '', '', 'Ropa Interior Dama'),
  ('b8935466-c256-400e-90bb-7c674862ddb6'::uuid, 26000, 'Tiro corto Algodón Íntima', '', '', 'Ropa Interior Dama'),
  ('f37f2af1-76d4-4a2e-8935-cfddf7829717'::uuid, 10000, 'Colaless Algodón Línea Económica', '', '', 'Ropa Interior Dama'),
  ('ab6b2869-4720-43f0-8a64-13e659a5cc12'::uuid, 10000, 'Vedetina Algodón Línea Económica', '', '', 'Ropa Interior Dama'),
  ('79a8a99b-b61f-4413-be93-9e5333fd4d83'::uuid, 10000, 'Regulable Línea Económica', '', '', 'Ropa Interior Dama'),
  ('304df3dd-9bb5-40c6-ba28-20a2f5752188'::uuid, 45000, 'Conjunto Taza Soft Art.728', '', '', 'Ropa Interior Dama'),
  ('67125816-8f94-4172-ac6c-c4103c011135'::uuid, 36000, 'Conjunto Triángulo Soft Art.746', '', '', 'Ropa Interior Dama'),
  ('e2d89e3d-5fb9-4e2e-9d6f-265ed1097584'::uuid, 36000, 'Conjunto Triángulo Soft Art.741', '', '', 'Ropa Interior Dama'),
  ('3a43594c-f882-415a-a003-48f23c8c1248'::uuid, 18000, 'Boxers Uomo Niño Pañalero', '', '', 'Ropa Interior Niño'),
  ('be17707c-86fe-41d5-a545-e67cfcdc3214'::uuid, 18000, 'Boxers Uomo Niño Intermedio', '', '', 'Ropa Interior Niño'),
  ('ac690724-53e9-45f7-9eec-b99dc1d0537e'::uuid, 18000, 'Boxers Uomo Juvenil', '', '', 'Ropa Interior Niño'),
  ('70ef1d7f-b294-4677-a7dc-b72dbf62b273'::uuid, 9000, 'Bombachas Algodón Niñas', '', '', 'Ropa Interior Niño'),
  ('7e13f6c0-dc03-4760-a633-a71336c8700c'::uuid, 12000, 'Bombachas Algodón Juvenil', '', '', 'Ropa Interior Niño'),
  ('95781694-051c-4d45-818e-86eb27648a53'::uuid, 3400, 'Toalla de Mano F. Valente 400 g', '', '', 'Blanquería'),
  ('ed02c44b-30ee-4f8e-a028-0a1c1eea64e3'::uuid, 1700, 'Toalla de Visita F. Valente 450 g', '', '', 'Blanquería'),
  ('8260a653-4bc5-4962-8c31-748327d19beb'::uuid, 8100, 'Toallón F. Valente 400 g', '', '', 'Blanquería'),
  ('f1e4a46d-4945-44b0-a05c-dc82d2b38319'::uuid, 11700, 'Toallón F. Valente 500 g', '', '', 'Blanquería'),
  ('c77a0a6f-8acb-4b20-8d33-d7f83a6786c1'::uuid, 12000, 'Juego T+T F. Valente 400 g', '', '', 'Blanquería'),
  ('be47d42a-b9af-43d1-b6fe-26fbb16d52f9'::uuid, 16200, 'Juego T+T F. Valente 500 g', '', '', 'Blanquería'),
  ('2361f469-a153-4564-acfc-fd2dfe771ef7'::uuid, 2630, 'Repasadores F. Valente', '', '', 'Blanquería'),
  ('7bdb2701-2182-426f-8518-69b3a6321753'::uuid, 10700, 'Juego T+T Palette 420 g', '', '', 'Blanquería'),
  ('081bf7f6-bb91-423c-8702-9cee05dbe510'::uuid, 2100, 'Toalla de Mano Fantasía', '', '', 'Blanquería'),
  ('d0b38242-54ec-42e2-91bb-7b990eba27a4'::uuid, 5600, 'Toallón Algodón Fantasía', '', '', 'Blanquería'),
  ('097fad98-028c-461d-84f2-75150cdcb09b'::uuid, 10200, 'Repasador Corazón', '', '', 'Blanquería'),
  ('a2e27dff-7554-467e-8e42-c65db41d1882'::uuid, 5800, 'Repasador Algodón Económico', '', '', 'Blanquería'),
  ('0c8ba956-b727-4901-a706-726f8bbd4c61'::uuid, 8400, 'Juego de Sábanas París 400 hilos 1½ Plaza', '', '', 'Blanquería'),
  ('58955351-f6f2-4bfa-af95-69be1cd56f68'::uuid, 10000, 'Juego de Sábanas París 400 hilos 2½ Plazas', '', '', 'Blanquería'),
  ('11b9f853-514c-489c-9f4d-2f788ffbaa82'::uuid, 4400, 'Almohadas', '', '', 'Blanquería'),
  ('0e80eb53-f669-4f42-8b3d-6fb3a9cf9419'::uuid, 10000, 'Juegos sabanas king', '', '', 'Blanquería'),
  ('b2b7672f-b777-4f4f-bcf3-e7530eb77849'::uuid, 6000, 'Sábanas Ajustables Algodón Full', '', '', 'Blanquería'),
  ('039ae43e-20d6-4ce4-a9a8-755f886c7b69'::uuid, 500, 'Paños Multiuso París', '', '', 'Blanquería'),
  ('eb885591-27fb-4fd6-90f9-10bcab32fdb8'::uuid, 8400, 'Toallitas Individuales Algodón', '', '', 'Blanquería'),
  ('7dcbd94e-4e16-41c8-8b65-36336458d362'::uuid, 13000, 'Juego de Sábanas Goldsun Algodón Full', '', '', 'Blanquería'),
  ('d2cf4e70-3fc8-4c73-9708-4609a3122085'::uuid, 11000, 'Juego de Sábanas Goldsun Algodón Twin', '', '', 'Blanquería'),
  ('3db1b94f-c1c3-4e57-9cf4-37e167d37734'::uuid, 16000, 'Juego de Sábanas King Premium Deluxe París', '', '', 'Blanquería'),
  ('7d76167a-6a74-414e-a844-cfd884711186'::uuid, 9500, 'Juego de Sábanas París 600 hilos 1½ Plaza', '', '', 'Blanquería'),
  ('50bba1cb-a14d-4305-b50c-3626508c1d4d'::uuid, 13200, 'Juego de Sábanas París 600 hilos 2½ Plazas', '', '', 'Blanquería'),
  ('992202f6-f3f0-43bf-8270-709a984c4789'::uuid, 12000, 'Juego de Sábanas París 800 hilos 1½ Plaza', '', '', 'Blanquería'),
  ('95e71c2d-8acf-446d-9b4b-c7b7fd2e0a54'::uuid, 16000, 'Juego de Sábanas París 800 hilos 2½ Plazas', '', '', 'Blanquería'),
  ('b8188b17-d989-442e-82ed-ecd934042433'::uuid, 7200, 'Juegos Sábanas París Esencial 1½ Plaza', '', '', 'Blanquería'),
  ('fb985553-47e7-4b7a-a573-496855a09225'::uuid, 8200, 'Juegos Sábanas París Esencial 2½ Plazas', '', '', 'Blanquería'),
  ('05f50d0c-caa1-495b-a9d8-cae058edf200'::uuid, 5500, 'Juego Toalla y Toallón Algodón Arciel', '', '', 'Blanquería'),
  ('e9744544-4222-4574-af6b-7b5d5d688bb2'::uuid, 5500, 'Sábanas Ajustables Algodón Twin', '', '', 'Blanquería'),
  ('1e278178-8639-452d-b9c2-b8b7d5e555b4'::uuid, 4500, 'Toallón de Secado Rápido', '', '', 'Blanquería'),
  ('2597e082-685e-44da-8a28-fe127cf6451f'::uuid, 3000, 'Toallón Importado Algodón', '', '', 'Blanquería'),
  ('d2380dc6-242c-49a3-baea-7d394f5cac6f'::uuid, 16000, 'Cortina blackout eleven paris', '', '', 'Blanquería');

create temp table _pxm_cost_restore_matches on commit drop as
select
  e.id,
  e.cost_price,
  e.product_name,
  e.option_name,
  e.assortment_name,
  e.category_name,
  p.name as current_name,
  p.base_name as current_base_name,
  p.option_name as current_option_name,
  p.assortment_name as current_assortment_name,
  p.active
from _pxm_excel_costs e
left join public.products p on p.id = e.id;

update public.products p
   set cost_price = e.cost_price
  from _pxm_excel_costs e
 where p.id = e.id
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

-- Resultado esperado principal: active_products_with_cost debe quedar igual a active_products.
select
  count(*) filter (where p.active is true) as active_products,
  count(*) filter (where p.active is true and coalesce(p.cost_price, 0) > 0) as active_products_with_cost,
  min(nullif(p.cost_price, 0)) filter (where p.active is true) as min_positive_cost,
  max(p.cost_price) filter (where p.active is true) as max_cost
from public.products p;

-- Debe devolver 0 filas. Si devuelve filas, son productos activos sin costo despues de la restauracion.
select
  p.id,
  p.name,
  p.base_name,
  p.option_name,
  p.assortment_name,
  c.name as category_name,
  p.cost_price
from public.products p
left join public.categories c on c.id = p.category_id
where p.active is true
  and coalesce(p.cost_price, 0) <= 0
order by c.name, p.sort_order, p.name;

-- Filas del Excel que no se aplicaron por no existir o no estar activas actualmente.
select
  m.id,
  m.product_name,
  m.option_name,
  m.assortment_name,
  m.category_name,
  m.cost_price,
  case
    when m.current_name is null then 'no existe en products'
    when m.active is not true then 'producto no activo'
    else 'aplicado'
  end as resultado
from _pxm_cost_restore_matches m
where m.current_name is null
   or m.active is not true
order by m.category_name, m.product_name, m.option_name, m.assortment_name;

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
