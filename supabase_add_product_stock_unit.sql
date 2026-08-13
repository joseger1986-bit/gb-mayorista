alter table public.products
  add column if not exists stock_unit text not null default 'unidades'
  check (stock_unit in ('unidades', 'docenas'));
