alter table public.products
  add column if not exists base_name text,
  add column if not exists option_name text;

update public.products
set
  option_name = case
    when trim(coalesce(option_name, '')) <> '' then trim(option_name)
    when name ~* '\s+Surtido\s+T[0-9]+\s*-\s*[0-9]+$'
      then regexp_replace(name, '^.*\s+(Surtido\s+T[0-9]+\s*-\s*[0-9]+)$', '\1', 'i')
    when name ~* '\s+Talle\s+[[:alnum:]]+$'
      then regexp_replace(name, '^.*\s+(Talle\s+[[:alnum:]]+)$', '\1', 'i')
    when name ~* '\s+T[0-9]+\s*-\s*[0-9]+\s+Surtido$'
      then regexp_replace(name, '^.*\s+T([0-9]+)\s*-\s*([0-9]+)\s+Surtido$', 'Surtido T\1-\2', 'i')
    when name ~* '\s+T[0-9]+$'
      then regexp_replace(name, '^.*\s+T([0-9]+)$', 'Talle \1', 'i')
    else ''
  end,
  base_name = case
    when trim(coalesce(base_name, '')) <> '' then trim(base_name)
    when name ~* '\s+Surtido\s+T[0-9]+\s*-\s*[0-9]+$'
      then trim(regexp_replace(name, '\s+Surtido\s+T[0-9]+\s*-\s*[0-9]+$', '', 'i'))
    when name ~* '\s+Talle\s+[[:alnum:]]+$'
      then trim(regexp_replace(name, '\s+Talle\s+[[:alnum:]]+$', '', 'i'))
    when name ~* '\s+T[0-9]+\s*-\s*[0-9]+\s+Surtido$'
      then trim(regexp_replace(name, '\s+T[0-9]+\s*-\s*[0-9]+\s+Surtido$', '', 'i'))
    when name ~* '\s+T[0-9]+$'
      then trim(regexp_replace(name, '\s+T[0-9]+$', '', 'i'))
    else trim(name)
  end
where trim(coalesce(base_name, '')) = ''
   or trim(coalesce(option_name, '')) = '';

create index if not exists idx_products_base_name
  on public.products (base_name);

create index if not exists idx_products_option_name
  on public.products (option_name);
