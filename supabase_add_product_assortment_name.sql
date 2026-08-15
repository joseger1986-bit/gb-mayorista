alter table public.products
  add column if not exists base_name text,
  add column if not exists option_name text,
  add column if not exists assortment_name text not null default '';

update public.products
set
  option_name = case
    when trim(coalesce(option_name, '')) <> '' then trim(option_name)
    when name ~* '\s+Talle\s+[0-9]+(\s*-\s*[0-9]+)?$'
      then regexp_replace(name, '^.*\s+Talle\s+([0-9]+(\s*-\s*[0-9]+)?)$', '\1', 'i')
    when name ~* '\s+T[0-9]+$'
      then regexp_replace(name, '^.*\s+T([0-9]+)$', '\1', 'i')
    when name ~* '\s+[0-9]+\s*-\s*[0-9]+$'
      and name !~* '\s+Surtido\s+[T]?[0-9]+\s*-\s*[0-9]+$'
      then regexp_replace(name, '^.*\s+([0-9]+\s*-\s*[0-9]+)$', '\1', 'i')
    else ''
  end,
  assortment_name = case
    when trim(coalesce(assortment_name, '')) <> '' then trim(assortment_name)
    when name ~* '\s+Surtido\s+T?[0-9]+\s*-\s*[0-9]+$'
      then regexp_replace(name, '^.*\s+Surtido\s+T?([0-9]+)\s*-\s*([0-9]+)$', '\1-\2', 'i')
    when name ~* '\s+Surtido\s+Talle\s*[0-9]+\s*-\s*[0-9]+$'
      then regexp_replace(name, '^.*\s+Surtido\s+Talle\s*([0-9]+)\s*-\s*([0-9]+)$', '\1-\2', 'i')
    when name ~* '\s+T[0-9]+\s*-\s*[0-9]+\s+Surtido$'
      then regexp_replace(name, '^.*\s+T([0-9]+)\s*-\s*([0-9]+)\s+Surtido$', '\1-\2', 'i')
    when option_name ~* '^Surtido\s+T?[0-9]+\s*-\s*[0-9]+$'
      then regexp_replace(option_name, '^Surtido\s+T?([0-9]+)\s*-\s*([0-9]+)$', '\1-\2', 'i')
    else ''
  end,
  base_name = case
    when trim(coalesce(base_name, '')) <> '' then trim(base_name)
    when name ~* '\s+Surtido\s+T?[0-9]+\s*-\s*[0-9]+$'
      then trim(regexp_replace(name, '\s+Surtido\s+T?[0-9]+\s*-\s*[0-9]+$', '', 'i'))
    when name ~* '\s+Surtido\s+Talle\s*[0-9]+\s*-\s*[0-9]+$'
      then trim(regexp_replace(name, '\s+Surtido\s+Talle\s*[0-9]+\s*-\s*[0-9]+$', '', 'i'))
    when name ~* '\s+Talle\s+[0-9]+(\s*-\s*[0-9]+)?$'
      then trim(regexp_replace(name, '\s+Talle\s+[0-9]+(\s*-\s*[0-9]+)?$', '', 'i'))
    when name ~* '\s+T[0-9]+\s*-\s*[0-9]+\s+Surtido$'
      then trim(regexp_replace(name, '\s+T[0-9]+\s*-\s*[0-9]+\s+Surtido$', '', 'i'))
    when name ~* '\s+T[0-9]+$'
      then trim(regexp_replace(name, '\s+T[0-9]+$', '', 'i'))
    when name ~* '\s+[0-9]+\s*-\s*[0-9]+$'
      then trim(regexp_replace(name, '\s+[0-9]+\s*-\s*[0-9]+$', '', 'i'))
    else trim(name)
  end;

update public.products
set
  option_name = regexp_replace(option_name, '^Talle\s+(.+)$', '\1', 'i')
where option_name ~* '^Talle\s+';

update public.products
set
  option_name = regexp_replace(option_name, '^T([0-9]+)$', '\1', 'i')
where option_name ~* '^T[0-9]+$';

update public.products
set
  assortment_name = regexp_replace(option_name, '^Surtido\s+T?([0-9]+)\s*-\s*([0-9]+)$', '\1-\2', 'i'),
  option_name = ''
where option_name ~* '^Surtido\s+T?[0-9]+\s*-\s*[0-9]+$';

update public.products
set name = trim(base_name)
where trim(coalesce(base_name, '')) <> ''
  and trim(name) <> trim(base_name);

create index if not exists idx_products_base_name
  on public.products (base_name);

create index if not exists idx_products_option_name
  on public.products (option_name);

create index if not exists idx_products_assortment_name
  on public.products (assortment_name);
