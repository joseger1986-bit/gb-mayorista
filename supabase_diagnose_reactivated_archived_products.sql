-- Punto X Mayor - diagnostico de productos posiblemente reactivados por error.
-- SOLO LECTURA. No modifica datos.

with recount_risky_names(name) as (
  values
    ('Juegos Sábanas París Esencial 1½ Plaza'),
    ('Juegos Sábanas París Esencial 2½ Plazas'),
    ('Juego de Sábanas París 600 hilos 1½ Plaza'),
    ('Juego de Sábanas París 600 hilos 2½ Plazas'),
    ('Juego de Sábanas París 800 hilos 1½ Plaza'),
    ('Juego de Sábanas París 800 hilos 2½ Plazas'),
    ('Sábanas Ajustables Algodón Twin'),
    ('Sábanas Ajustables Algodón Full'),
    ('Juego de Sábanas King Premium Deluxe París'),
    ('Toallón Importado Algodón'),
    ('Toallón de Secado Rápido'),
    ('Juego de Sábanas Goldsun Algodón Twin'),
    ('Juego de Sábanas Goldsun Algodón Full'),
    ('Medias 1/3 Elemento Dama Art. 401R')
),
visual_examples(name) as (
  values
    ('Juego de Sábanas París Basic 1½ Plaza'),
    ('Juego de Sábanas París Basic 2½ Plazas'),
    ('Juego de Sábanas París Cotton Touch 1½ Plaza'),
    ('Juego de Sábanas París Cotton Touch 2½ Plazas')
),
all_candidates as (
  select 'LISTA_RECUENTO_QUE_ANTES_REACTIVABA' as source, name from recount_risky_names
  union all
  select 'EJEMPLOS_VISIBLES_REPORTADOS' as source, name from visual_examples
)
select
  c.source,
  p.id,
  p.name,
  p.base_name,
  p.option_name,
  p.assortment_name,
  p.active,
  p.show_in_catalog,
  p.stock,
  p.stock_unit,
  p.presentation,
  p.created_at,
  p.updated_at
from all_candidates c
join public.products p on p.name = c.name or p.base_name = c.name
order by c.source, p.active desc, p.name, p.option_name, p.assortment_name;

-- Control adicional: cualquier producto activo con marca Paris/París en Blanqueria,
-- para revisar si hay mas articulos reactivados visualmente relacionados.
select
  'PARIS_ACTIVOS_CONTROL' as source,
  p.id,
  p.name,
  p.base_name,
  p.option_name,
  p.assortment_name,
  p.active,
  p.show_in_catalog,
  p.stock,
  p.stock_unit,
  p.presentation,
  p.created_at,
  p.updated_at
from public.products p
left join public.categories c on c.id = p.category_id
where p.active is true
  and lower(coalesce(c.name, '')) = lower('Blanquería')
  and (
    lower(coalesce(p.name, '')) like '%paris%'
    or lower(coalesce(p.name, '')) like '%parís%'
    or lower(coalesce(p.base_name, '')) like '%paris%'
    or lower(coalesce(p.base_name, '')) like '%parís%'
  )
order by p.name, p.option_name, p.assortment_name;
