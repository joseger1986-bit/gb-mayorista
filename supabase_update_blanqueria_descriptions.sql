-- Actualiza únicamente descripciones de productos activos de Blanquería.
-- No modifica precios, stock, presentación, imágenes, visibilidad ni otros datos.

update public.products
set description = case coalesce(base_name, name)
  when 'Toalla de Mano F. Valente 400 g' then '100% algodón, 400 g/m². Toalla suave y absorbente, ideal para uso diario.'
  when 'Toalla de Visita F. Valente 450 g' then '100% algodón. Toalla de visita suave y absorbente, ideal para baño.'
  when 'Toallón F. Valente 400 g' then '100% algodón, 400 g/m². Medida 70 x 140 cm. Suave y absorbente.'
  when 'Toallón F. Valente 500 g' then '100% algodón, 500 g/m². Medida 80 x 150 cm. Suave y de gran absorción.'
  when 'Juego T+T F. Valente 400 g' then '100% algodón, 400 g/m². Toalla 45 x 80 cm y toallón 70 x 140 cm. Suaves y absorbentes.'
  when 'Juego T+T F. Valente 500 g' then '100% algodón, 500 g/m². Toalla 48 x 88 cm y toallón 80 x 150 cm. Suaves y de gran absorción.'
  when 'Repasadores F. Valente' then 'Repasador Franco Valente, práctico, resistente y absorbente para uso diario en cocina.'
  when 'Toalla de Mano Fantasía' then '100% algodón. Medida aproximada 40 x 70 cm. Suave y absorbente.'
  when 'Toallón Algodón Fantasía' then '100% algodón. Medida aproximada 70 x 130 cm. Suave y de gran absorción.'
  when 'Juego de Sábanas París Basic 1½ Plaza' then 'Poliéster. Ajustable 90 x 190 x 25 cm, plana 145 x 235 cm y funda 48 x 75 cm. Fácil lavado y secado rápido.'
  when 'Juego de Sábanas París Basic 2½ Plazas' then 'Poliéster. Ajustable 140 x 190 x 25 cm, plana 180 x 235 cm y fundas 48 x 75 cm. Fácil lavado y secado rápido.'
  when 'Juego de Sábanas París 400 hilos 1½ Plaza' then '100% poliéster Cotton Touch, 400 hilos. Para colchón de hasta 90 x 190 x 25 cm. Suave tacto algodón.'
  when 'Juego de Sábanas París 400 hilos 2½ Plazas' then '100% poliéster Cotton Touch, 400 hilos. Suave tacto algodón, cómodo y de fácil cuidado.'
  when 'Paños Multiuso París' then '100% poliéster. Paños de microfibra ultra absorbente de 26 x 31 cm. No rayan y pueden usarse secos o húmedos.'
  when 'Juego Toalla y Toallón Algodón Arciel' then '100% algodón, 420 g/m². Toalla 50 x 80 cm y toallón 70 x 135 cm. Suaves y absorbentes.'
  else description
end
where active is true
  and category_id in (select id from public.categories where name = 'Blanquería')
  and coalesce(base_name, name) in (
    'Toalla de Mano F. Valente 400 g',
    'Toalla de Visita F. Valente 450 g',
    'Toallón F. Valente 400 g',
    'Toallón F. Valente 500 g',
    'Juego T+T F. Valente 400 g',
    'Juego T+T F. Valente 500 g',
    'Repasadores F. Valente',
    'Toalla de Mano Fantasía',
    'Toallón Algodón Fantasía',
    'Juego de Sábanas París Basic 1½ Plaza',
    'Juego de Sábanas París Basic 2½ Plazas',
    'Juego de Sábanas París 400 hilos 1½ Plaza',
    'Juego de Sábanas París 400 hilos 2½ Plazas',
    'Paños Multiuso París',
    'Juego Toalla y Toallón Algodón Arciel'
  );