-- GB Mayorista - soporte de galeria de imagenes por producto
alter table public.products
  add column if not exists gallery_images jsonb not null default '[]'::jsonb;

update public.products
set gallery_images = case
  when image_path is not null
    and btrim(image_path) <> ''
    and (
      gallery_images is null
      or jsonb_typeof(gallery_images) <> 'array'
      or jsonb_array_length(gallery_images) = 0
    )
    then jsonb_build_array(image_path)
  when gallery_images is null or jsonb_typeof(gallery_images) <> 'array'
    then '[]'::jsonb
  else gallery_images
end;
