alter table public.products
  add column if not exists description text not null default '';

comment on column public.products.description is 'Descripcion opcional visible desde el catalogo publico.';
