alter table public.products
  add column if not exists base_name text,
  add column if not exists option_name text;

create index if not exists idx_products_base_name
  on public.products (base_name);

create index if not exists idx_products_option_name
  on public.products (option_name);
