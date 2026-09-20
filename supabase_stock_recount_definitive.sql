begin;

-- Recuento total de inventario Punto X Mayor.
-- No suma stock: reemplaza el valor de stock existente por el inventario fisico definitivo.
-- No modifica precios, costos, fotos, categorias, descripciones, presentaciones ni logica comercial.

with stock_updates(id, new_stock, new_stock_unit) as (
  values
  -- Blanqueria existente
  ('95781694-051c-4d45-818e-86eb27648a53'::uuid, 100::numeric, 'unidades'),
  ('ed02c44b-30ee-4f8e-a028-0a1c1eea64e3'::uuid, 47::numeric, 'unidades'),
  ('8260a653-4bc5-4962-8c31-748327d19beb'::uuid, 79::numeric, 'unidades'),
  ('f1e4a46d-4945-44b0-a05c-dc82d2b38319'::uuid, 81::numeric, 'unidades'),
  ('c77a0a6f-8acb-4b20-8d33-d7f83a6786c1'::uuid, 77::numeric, 'unidades'),
  ('be47d42a-b9af-43d1-b6fe-26fbb16d52f9'::uuid, 18::numeric, 'unidades'),
  ('2361f469-a153-4564-acfc-fd2dfe771ef7'::uuid, 138::numeric, 'unidades'),
  ('7bdb2701-2182-426f-8518-69b3a6321753'::uuid, 128::numeric, 'unidades'),
  ('081bf7f6-bb91-423c-8702-9cee05dbe510'::uuid, 162::numeric, 'unidades'),
  ('d0b38242-54ec-42e2-91bb-7b990eba27a4'::uuid, 104::numeric, 'unidades'),
  ('097fad98-028c-461d-84f2-75150cdcb09b'::uuid, 27::numeric, 'docenas'),
  ('a2e27dff-7554-467e-8e42-c65db41d1882'::uuid, 50::numeric, 'docenas'),
  ('0c8ba956-b727-4901-a706-726f8bbd4c61'::uuid, 104::numeric, 'unidades'),
  ('58955351-f6f2-4bfa-af95-69be1cd56f68'::uuid, 75::numeric, 'unidades'),
  ('11b9f853-514c-489c-9f4d-2f788ffbaa82'::uuid, 48::numeric, 'unidades'),
  ('0e80eb53-f669-4f42-8b3d-6fb3a9cf9419'::uuid, 31::numeric, 'unidades'),
  ('039ae43e-20d6-4ce4-a9a8-755f886c7b69'::uuid, 34::numeric, 'unidades'),
  ('eb885591-27fb-4fd6-90f9-10bcab32fdb8'::uuid, 8::numeric, 'docenas'),

  -- Medias existente
  ('3126d06f-0402-4057-b253-5e4b592c411b'::uuid, 736::numeric, 'docenas'),
  ('cb1df866-5cf3-4241-b3c8-3378d17c49f8'::uuid, 76::numeric, 'docenas'),
  ('d95cb7b5-cbbe-4a90-a653-8ce2813d9d19'::uuid, 30::numeric, 'docenas'),
  ('24743a92-bfb9-4c07-a9fb-f957f1d19165'::uuid, 30::numeric, 'docenas'),
  ('f24984bf-7252-4913-a695-de2eead03ec8'::uuid, 12::numeric, 'docenas'),
  ('8c517a1e-4505-4e3b-873e-224faaeb27e4'::uuid, 16::numeric, 'docenas'),
  ('cde8cfda-88c3-4e35-9774-e708941253ed'::uuid, 15::numeric, 'docenas'),
  ('61662d1c-64e2-4119-8916-40c28a15e2e2'::uuid, 16::numeric, 'docenas'),
  ('0a805bc3-af67-4efd-8c6d-5579dc9b7162'::uuid, 16::numeric, 'docenas'),
  ('92cbe8f6-46a4-4ab9-bc8e-aa43ee7d9171'::uuid, 15::numeric, 'docenas'),
  ('254f1c9a-f7eb-450f-a2eb-a1c61cadcf21'::uuid, 16::numeric, 'docenas'),
  ('d179f20b-6e10-4175-b92f-ab374afd536f'::uuid, 3::numeric, 'docenas'),
  ('cae7330a-74bd-4bf2-bcbf-5b5ec3a3906b'::uuid, 14::numeric, 'docenas'),
  ('e56bed31-51d1-4647-911e-706ea89e1ee9'::uuid, 12::numeric, 'docenas'),
  ('f3ba3980-0284-4e72-bfbf-8225a22731bb'::uuid, 3::numeric, 'docenas'),
  ('103f4f31-69ce-4942-9a5d-98dc079bf87b'::uuid, 4::numeric, 'docenas'),
  ('62be59da-2098-45af-8f2a-f09849e4fbee'::uuid, 4::numeric, 'docenas'),
  ('a76af400-f718-48f5-af57-4940006590bd'::uuid, 4::numeric, 'docenas'),
  ('5bffd8ce-ea5a-46b0-ae91-a14c1c1a1b43'::uuid, 30::numeric, 'docenas'),
  ('5482fff9-ef45-45d4-8ec2-4f096660ae39'::uuid, 30::numeric, 'docenas'),
  ('9215949e-11d0-4339-b73b-9a15cd74b33f'::uuid, 30::numeric, 'docenas'),
  ('e50cc340-29f1-461a-95ae-c57984a0d315'::uuid, 30::numeric, 'docenas'),
  ('85d6e4f7-e6f9-48a0-b2ea-822bbd0a2d9e'::uuid, 30::numeric, 'docenas'),
  ('e5138d6b-ddfc-4084-90b1-d6a04d2156ff'::uuid, 30::numeric, 'docenas'),

  -- Ropa Interior Hombre existente
  ('5de5b639-0ffc-410d-9794-7b96080875cd'::uuid, 51::numeric, 'docenas'),
  ('b7573fe3-f0f0-431f-b98c-80d03fab357c'::uuid, 87::numeric, 'unidades'),
  ('703cb355-cdd5-42c4-95a3-3d794dcbc618'::uuid, 159::numeric, 'unidades'),
  ('af269fd5-8560-40db-b657-9d676e194b32'::uuid, 135::numeric, 'unidades'),
  ('2b27ec33-3fcb-4113-b7a9-96dc348042f5'::uuid, 135::numeric, 'unidades'),
  ('42cf67d5-5ddb-4ad1-b1b9-51e61d34d77e'::uuid, 174::numeric, 'unidades'),
  ('9291c0d6-6836-4ba1-ba77-fc43686642ab'::uuid, 150::numeric, 'unidades'),
  ('db269112-fad4-47cc-9541-53c1a9ddcbfb'::uuid, 0::numeric, 'unidades'),
  ('77139b99-a618-4733-9963-038d32ffdaba'::uuid, 0::numeric, 'unidades'),
  ('5818626a-2104-4f5e-a7f5-f774fefa6b5d'::uuid, 72::numeric, 'unidades'),
  ('e043db82-9e25-4807-a126-5f3e928feaeb'::uuid, 138::numeric, 'unidades'),
  ('e0b3b587-4fc3-492a-b6d5-40619dffb624'::uuid, 132::numeric, 'unidades'),
  ('11a0a724-4e03-487a-8a64-b7ed750807c1'::uuid, 132::numeric, 'unidades'),
  ('0b751304-4ed4-49b5-8acc-3d14ff3aa1c6'::uuid, 156::numeric, 'unidades'),
  ('e6f1fb74-d211-41ba-bec3-b7c3978b67c1'::uuid, 90::numeric, 'unidades'),
  ('c2724d43-7791-425d-a645-c2d6a3c1dd67'::uuid, 0::numeric, 'unidades'),
  ('0c14b005-e99d-4523-a6d3-cd5f926540e5'::uuid, 36::numeric, 'unidades'),
  ('38173f92-86eb-40d1-8e01-e55c14a96ee0'::uuid, 60::numeric, 'unidades'),
  ('5c26eccf-ed7a-4719-bff7-ac50010059dc'::uuid, 60::numeric, 'unidades'),
  ('0783175f-cf94-4dcf-a3b2-61b3728aaeaf'::uuid, 60::numeric, 'unidades'),
  ('a434b551-7676-4c5e-8714-9f2af45f39ee'::uuid, 0::numeric, 'unidades'),
  ('f31012aa-441f-4310-9c51-ca1e0131c2c2'::uuid, 84::numeric, 'unidades'),
  ('7a822fc2-f6a9-4e3a-9468-2bef54e61c9d'::uuid, 132::numeric, 'unidades'),
  ('e2284d8c-57d0-4aad-869b-4faeef48ca67'::uuid, 120::numeric, 'unidades'),
  ('eea00d8f-4b6c-4f8a-90d3-a94ddf684be1'::uuid, 132::numeric, 'unidades'),
  ('fd357315-d33b-4908-8396-3df93395f390'::uuid, 132::numeric, 'unidades'),
  ('53906224-f388-4d43-9b21-842c5c6c40f6'::uuid, 0::numeric, 'unidades'),
  ('0d1ee4e2-a97f-4af4-9775-7eacbffec18e'::uuid, 0::numeric, 'unidades'),

  -- Ropa Interior Dama existente
  ('36741b3a-50a2-4d44-9104-60783c7ad4d8'::uuid, 15::numeric, 'docenas'),
  ('5b23a041-9154-4ce0-8fd7-6079fba4bec4'::uuid, 15::numeric, 'docenas'),
  ('4dc26f6d-890b-47f7-8d37-06fb7f107303'::uuid, 5::numeric, 'docenas'),
  ('ac4a1950-2659-41fe-999b-753497fe1890'::uuid, 11::numeric, 'docenas'),
  ('b8935466-c256-400e-90bb-7c674862ddb6'::uuid, 11::numeric, 'docenas'),
  ('f37f2af1-76d4-4a2e-8935-cfddf7829717'::uuid, 15::numeric, 'docenas'),
  ('ab6b2869-4720-43f0-8a64-13e659a5cc12'::uuid, 15::numeric, 'docenas'),
  ('79a8a99b-b61f-4413-be93-9e5333fd4d83'::uuid, 15::numeric, 'docenas'),
  ('304df3dd-9bb5-40c6-ba28-20a2f5752188'::uuid, 5::numeric, 'docenas'),
  ('67125816-8f94-4172-ac6c-c4103c011135'::uuid, 5::numeric, 'docenas'),
  ('e2d89e3d-5fb9-4e2e-9d6f-265ed1097584'::uuid, 5::numeric, 'docenas'),

  -- Ropa Interior Nino existente
  ('3a43594c-f882-415a-a003-48f23c8c1248'::uuid, 10::numeric, 'docenas'),
  ('be17707c-86fe-41d5-a545-e67cfcdc3214'::uuid, 10::numeric, 'docenas'),
  ('ac690724-53e9-45f7-9eec-b99dc1d0537e'::uuid, 10::numeric, 'docenas'),
  ('70ef1d7f-b294-4677-a7dc-b72dbf62b273'::uuid, 24::numeric, 'docenas'),
  ('7e13f6c0-dc03-4760-a633-a71336c8700c'::uuid, 30::numeric, 'docenas')
)
update public.products p
set
  stock = u.new_stock,
  stock_unit = u.new_stock_unit
from stock_updates u
where p.id = u.id
  and p.active = true;

-- Crear Talle 1 activo de Boxer Dufour Art. 11855 copiando los datos comerciales del Talle 2.
insert into public.products (
  name,
  base_name,
  option_name,
  assortment_name,
  category_id,
  stock,
  stock_unit,
  presentation,
  cost_price,
  sale_price,
  active,
  show_in_catalog,
  sort_order,
  brand,
  description,
  image_path,
  gallery_images
)
select
  p.name,
  p.base_name,
  '1',
  '',
  p.category_id,
  36,
  'unidades',
  p.presentation,
  p.cost_price,
  p.sale_price,
  true,
  p.show_in_catalog,
  greatest(1, coalesce(p.sort_order, 170) - 10),
  p.brand,
  p.description,
  p.image_path,
  p.gallery_images
from public.products p
where p.active = true
  and p.base_name = 'Boxer Dufour Art. 11855'
  and p.option_name = '2'
  and not exists (
    select 1
    from public.products existing
    where existing.active = true
      and existing.base_name = 'Boxer Dufour Art. 11855'
      and existing.option_name = '1'
  )
limit 1;

-- Productos nuevos que forman parte de la lista definitiva.
-- IMPORTANTE: un recuento no reactiva productos archivados (active = false).
-- Si existe archivado, se informa en la verificacion y queda archivado hasta restauracion explicita.

with desired_new_products(name, category_name, stock, stock_unit, presentation) as (
  values
  ('Juegos Sábanas París Esencial 1½ Plaza', 'Blanquería', 82::numeric, 'unidades', null),
  ('Juegos Sábanas París Esencial 2½ Plazas', 'Blanquería', 129::numeric, 'unidades', null),
  ('Juego de Sábanas París 600 hilos 1½ Plaza', 'Blanquería', 122::numeric, 'unidades', null),
  ('Juego de Sábanas París 600 hilos 2½ Plazas', 'Blanquería', 118::numeric, 'unidades', null),
  ('Juego de Sábanas París 800 hilos 1½ Plaza', 'Blanquería', 78::numeric, 'unidades', null),
  ('Juego de Sábanas París 800 hilos 2½ Plazas', 'Blanquería', 68::numeric, 'unidades', null),
  ('Sábanas Ajustables Algodón Twin', 'Blanquería', 24::numeric, 'unidades', null),
  ('Sábanas Ajustables Algodón Full', 'Blanquería', 24::numeric, 'unidades', null),
  ('Juego de Sábanas King Premium Deluxe París', 'Blanquería', 45::numeric, 'unidades', null),
  ('Toallón Importado Algodón', 'Blanquería', 264::numeric, 'unidades', null),
  ('Toallón de Secado Rápido', 'Blanquería', 150::numeric, 'unidades', null),
  ('Juego de Sábanas Goldsun Algodón Twin', 'Blanquería', 36::numeric, 'unidades', null),
  ('Juego de Sábanas Goldsun Algodón Full', 'Blanquería', 36::numeric, 'unidades', null),
  ('Medias 1/3 Elemento Dama Art. 401R', 'Medias', 9::numeric, 'docenas', 'Docena')
),
archived_matches as (
  select p.id, p.name, p.base_name
  from public.products p
  join desired_new_products d on p.name = d.name or p.base_name = d.name
  where p.active = false
)
insert into public.products (
  name,
  base_name,
  category_id,
  stock,
  stock_unit,
  presentation,
  active,
  show_in_catalog,
  sort_order
)
select
  d.name,
  d.name,
  c.id,
  d.stock,
  d.stock_unit,
  d.presentation,
  true,
  false,
  9000 + row_number() over (order by d.category_name, d.name)
from desired_new_products d
join public.categories c on c.name = d.category_name
where not exists (
  select 1
  from public.products p
  where p.active = true
    and (p.name = d.name or p.base_name = d.name)
)
and not exists (
  select 1
  from archived_matches a
  where a.name = d.name or a.base_name = d.name
);

commit;
-- Verificacion: productos de la lista definitiva que ya existian archivados y NO fueron reactivados.
with desired_new_products(name, category_name, stock, stock_unit, presentation) as (
  values
  ('Juegos Sábanas París Esencial 1½ Plaza', 'Blanquería', 82::numeric, 'unidades', null),
  ('Juegos Sábanas París Esencial 2½ Plazas', 'Blanquería', 129::numeric, 'unidades', null),
  ('Juego de Sábanas París 600 hilos 1½ Plaza', 'Blanquería', 122::numeric, 'unidades', null),
  ('Juego de Sábanas París 600 hilos 2½ Plazas', 'Blanquería', 118::numeric, 'unidades', null),
  ('Juego de Sábanas París 800 hilos 1½ Plaza', 'Blanquería', 78::numeric, 'unidades', null),
  ('Juego de Sábanas París 800 hilos 2½ Plazas', 'Blanquería', 68::numeric, 'unidades', null),
  ('Sábanas Ajustables Algodón Twin', 'Blanquería', 24::numeric, 'unidades', null),
  ('Sábanas Ajustables Algodón Full', 'Blanquería', 24::numeric, 'unidades', null),
  ('Juego de Sábanas King Premium Deluxe París', 'Blanquería', 45::numeric, 'unidades', null),
  ('Toallón Importado Algodón', 'Blanquería', 264::numeric, 'unidades', null),
  ('Toallón de Secado Rápido', 'Blanquería', 150::numeric, 'unidades', null),
  ('Juego de Sábanas Goldsun Algodón Twin', 'Blanquería', 36::numeric, 'unidades', null),
  ('Juego de Sábanas Goldsun Algodón Full', 'Blanquería', 36::numeric, 'unidades', null),
  ('Medias 1/3 Elemento Dama Art. 401R', 'Medias', 9::numeric, 'docenas', 'Docena')
)
select
  'ARCHIVADOS_NO_REACTIVADOS' as check_name,
  p.id,
  p.name,
  p.base_name,
  p.active,
  p.stock,
  p.stock_unit,
  p.updated_at
from public.products p
join desired_new_products d on p.name = d.name or p.base_name = d.name
where p.active = false
order by p.name;

-- Verificacion: productos activos de la lista definitiva y sus stocks finales.
select
  c.name as category,
  p.name,
  p.base_name,
  p.option_name,
  p.assortment_name,
  p.stock,
  p.stock_unit,
  p.presentation,
  p.active,
  p.show_in_catalog
from public.products p
left join public.categories c on c.id = p.category_id
where p.active = true
  and (
    p.id in (
      '95781694-051c-4d45-818e-86eb27648a53'::uuid,
      'ed02c44b-30ee-4f8e-a028-0a1c1eea64e3'::uuid,
      '8260a653-4bc5-4962-8c31-748327d19beb'::uuid,
      'f1e4a46d-4945-44b0-a05c-dc82d2b38319'::uuid,
      'c77a0a6f-8acb-4b20-8d33-d7f83a6786c1'::uuid,
      'be47d42a-b9af-43d1-b6fe-26fbb16d52f9'::uuid,
      '2361f469-a153-4564-acfc-fd2dfe771ef7'::uuid,
      '7bdb2701-2182-426f-8518-69b3a6321753'::uuid,
      '081bf7f6-bb91-423c-8702-9cee05dbe510'::uuid,
      'd0b38242-54ec-42e2-91bb-7b990eba27a4'::uuid,
      '097fad98-028c-461d-84f2-75150cdcb09b'::uuid,
      'a2e27dff-7554-467e-8e42-c65db41d1882'::uuid,
      '0c8ba956-b727-4901-a706-726f8bbd4c61'::uuid,
      '58955351-f6f2-4bfa-af95-69be1cd56f68'::uuid,
      '11b9f853-514c-489c-9f4d-2f788ffbaa82'::uuid,
      '0e80eb53-f669-4f42-8b3d-6fb3a9cf9419'::uuid,
      '039ae43e-20d6-4ce4-a9a8-755f886c7b69'::uuid,
      'eb885591-27fb-4fd6-90f9-10bcab32fdb8'::uuid,
      '3126d06f-0402-4057-b253-5e4b592c411b'::uuid,
      'cb1df866-5cf3-4241-b3c8-3378d17c49f8'::uuid,
      'd95cb7b5-cbbe-4a90-a653-8ce2813d9d19'::uuid,
      '24743a92-bfb9-4c07-a9fb-f957f1d19165'::uuid,
      'f24984bf-7252-4913-a695-de2eead03ec8'::uuid,
      '8c517a1e-4505-4e3b-873e-224faaeb27e4'::uuid,
      'cde8cfda-88c3-4e35-9774-e708941253ed'::uuid,
      '61662d1c-64e2-4119-8916-40c28a15e2e2'::uuid,
      '0a805bc3-af67-4efd-8c6d-5579dc9b7162'::uuid,
      '92cbe8f6-46a4-4ab9-bc8e-aa43ee7d9171'::uuid,
      '254f1c9a-f7eb-450f-a2eb-a1c61cadcf21'::uuid,
      'd179f20b-6e10-4175-b92f-ab374afd536f'::uuid,
      'cae7330a-74bd-4bf2-bcbf-5b5ec3a3906b'::uuid,
      'e56bed31-51d1-4647-911e-706ea89e1ee9'::uuid,
      'f3ba3980-0284-4e72-bfbf-8225a22731bb'::uuid,
      '103f4f31-69ce-4942-9a5d-98dc079bf87b'::uuid,
      '62be59da-2098-45af-8f2a-f09849e4fbee'::uuid,
      'a76af400-f718-48f5-af57-4940006590bd'::uuid,
      '5bffd8ce-ea5a-46b0-ae91-a14c1c1a1b43'::uuid,
      '5482fff9-ef45-45d4-8ec2-4f096660ae39'::uuid,
      '9215949e-11d0-4339-b73b-9a15cd74b33f'::uuid,
      'e50cc340-29f1-461a-95ae-c57984a0d315'::uuid,
      '85d6e4f7-e6f9-48a0-b2ea-822bbd0a2d9e'::uuid,
      'e5138d6b-ddfc-4084-90b1-d6a04d2156ff'::uuid,
      '5de5b639-0ffc-410d-9794-7b96080875cd'::uuid,
      'b7573fe3-f0f0-431f-b98c-80d03fab357c'::uuid,
      '703cb355-cdd5-42c4-95a3-3d794dcbc618'::uuid,
      'af269fd5-8560-40db-b657-9d676e194b32'::uuid,
      '2b27ec33-3fcb-4113-b7a9-96dc348042f5'::uuid,
      '42cf67d5-5ddb-4ad1-b1b9-51e61d34d77e'::uuid,
      '9291c0d6-6836-4ba1-ba77-fc43686642ab'::uuid,
      '5818626a-2104-4f5e-a7f5-f774fefa6b5d'::uuid,
      'e043db82-9e25-4807-a126-5f3e928feaeb'::uuid,
      'e0b3b587-4fc3-492a-b6d5-40619dffb624'::uuid,
      '11a0a724-4e03-487a-8a64-b7ed750807c1'::uuid,
      '0b751304-4ed4-49b5-8acc-3d14ff3aa1c6'::uuid,
      'e6f1fb74-d211-41ba-bec3-b7c3978b67c1'::uuid,
      'c2724d43-7791-425d-a645-c2d6a3c1dd67'::uuid,
      '0c14b005-e99d-4523-a6d3-cd5f926540e5'::uuid,
      '38173f92-86eb-40d1-8e01-e55c14a96ee0'::uuid,
      '5c26eccf-ed7a-4719-bff7-ac50010059dc'::uuid,
      '0783175f-cf94-4dcf-a3b2-61b3728aaeaf'::uuid,
      'a434b551-7676-4c5e-8714-9f2af45f39ee'::uuid,
      'f31012aa-441f-4310-9c51-ca1e0131c2c2'::uuid,
      '7a822fc2-f6a9-4e3a-9468-2bef54e61c9d'::uuid,
      'e2284d8c-57d0-4aad-869b-4faeef48ca67'::uuid,
      'eea00d8f-4b6c-4f8a-90d3-a94ddf684be1'::uuid,
      'fd357315-d33b-4908-8396-3df93395f390'::uuid,
      '53906224-f388-4d43-9b21-842c5c6c40f6'::uuid,
      '0d1ee4e2-a97f-4af4-9775-7eacbffec18e'::uuid,
      '36741b3a-50a2-4d44-9104-60783c7ad4d8'::uuid,
      '5b23a041-9154-4ce0-8fd7-6079fba4bec4'::uuid,
      '4dc26f6d-890b-47f7-8d37-06fb7f107303'::uuid,
      'ac4a1950-2659-41fe-999b-753497fe1890'::uuid,
      'b8935466-c256-400e-90bb-7c674862ddb6'::uuid,
      'f37f2af1-76d4-4a2e-8935-cfddf7829717'::uuid,
      'ab6b2869-4720-43f0-8a64-13e659a5cc12'::uuid,
      '79a8a99b-b61f-4413-be93-9e5333fd4d83'::uuid,
      '304df3dd-9bb5-40c6-ba28-20a2f5752188'::uuid,
      '67125816-8f94-4172-ac6c-c4103c011135'::uuid,
      'e2d89e3d-5fb9-4e2e-9d6f-265ed1097584'::uuid,
      '3a43594c-f882-415a-a003-48f23c8c1248'::uuid,
      'be17707c-86fe-41d5-a545-e67cfcdc3214'::uuid,
      'ac690724-53e9-45f7-9eec-b99dc1d0537e'::uuid,
      '70ef1d7f-b294-4677-a7dc-b72dbf62b273'::uuid,
      '7e13f6c0-dc03-4760-a633-a71336c8700c'::uuid
    )
    or p.name in (
      'Juegos Sábanas París Esencial 1½ Plaza',
      'Juegos Sábanas París Esencial 2½ Plazas',
      'Juego de Sábanas París 600 hilos 1½ Plaza',
      'Juego de Sábanas París 600 hilos 2½ Plazas',
      'Juego de Sábanas París 800 hilos 1½ Plaza',
      'Juego de Sábanas París 800 hilos 2½ Plazas',
      'Sábanas Ajustables Algodón Twin',
      'Sábanas Ajustables Algodón Full',
      'Juego de Sábanas King Premium Deluxe París',
      'Toallón Importado Algodón',
      'Toallón de Secado Rápido',
      'Juego de Sábanas Goldsun Algodón Twin',
      'Juego de Sábanas Goldsun Algodón Full',
      'Medias 1/3 Elemento Dama Art. 401R'
    )
    or (p.base_name = 'Boxer Dufour Art. 11855' and p.option_name = '1')
  )
order by c.name, p.name, p.option_name, p.assortment_name;

-- Verificacion: Arciel queda activo y sin cambios de stock.
select
  'ARCIEL_SIN_CAMBIO' as check_name,
  p.name,
  p.stock,
  p.stock_unit,
  p.presentation,
  p.active
from public.products p
where p.name = 'Juego Toalla y Toallón Algodón Arciel'
   or p.base_name = 'Juego Toalla y Toallón Algodón Arciel';

-- Verificacion: Cortina blackout no se reactivo ni se modifico como Cortina de Bano.
select
  'CORTINAS_CONTROL' as check_name,
  p.name,
  p.base_name,
  p.stock,
  p.stock_unit,
  p.presentation,
  p.active
from public.products p
where lower(p.name) like '%cortina%'
   or lower(p.base_name) like '%cortina%'
order by p.active desc, p.name;

-- Verificacion: todos los boxers activos con variantes de talle usan nomenclatura numerica.
select
  'BOXERS_TALLES_NO_NUMERICOS' as check_name,
  p.name,
  p.base_name,
  p.option_name,
  p.assortment_name,
  p.active
from public.products p
where p.active = true
  and lower(p.name) like '%boxer%'
  and coalesce(p.option_name, '') <> ''
  and p.option_name !~ '^[0-9]+$'
order by p.name, p.option_name;

