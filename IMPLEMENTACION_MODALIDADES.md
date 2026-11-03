# Modalidades de compra: migracion aplicada, publicacion preparada

## Estado

El usuario ejecuto la migracion en Supabase y obtuvo `purchase_modes_ready`, con 96 configuraciones. Se verificaron por lectura las configuraciones y las RPC de presentacion reales. El frontend todavia no fue publicado en Vercel.
La aplicacion publicada sigue sin cambios.

## Cambios

- Pantalla publica de eleccion. Surtida conserva presentaciones habituales y minimo total de $150.000.
- Packs usa configuracion persistente por producto y no exige minimo monetario.
- Carritos publicos separados; el carrito surtido previo conserva su clave original.
- Revalidacion al recuperar y enviar. Un cambio de configuracion invalida el pack anterior para que se seleccione completo de nuevo; un cambio de precio actualiza los importes.
- Distribucion de talles por grupos compatibles, sin mezclar precios diferentes; validacion de stock y de packs completos en cliente y servidor.
- Selector habitual/packs en el catalogo interno. Las cantidades guardadas son cantidades comerciales reales.
- Edicion de packs exclusiva de Administrador. Los cambios exclusivos de pack no escriben productos, precios, costos ni stock.
- Cuatro PDF comerciales independientes y catalogo adicional de reventa sin precios. Se conserva descarga, vista previa y compartir.
- Pedidos web de ambas modalidades usan el mismo circuito y correlativo; UUID de reintento evita duplicar el mismo envio.
- Pedidos manuales mantienen su RPC y validaciones, con metadatos comerciales adicionales. El pago y descuento existentes se delegan sin reescribir sus cantidades.

## Migracion aplicada

El archivo `supabase_purchase_modes.sql` documenta la migracion ya aplicada. No volver a ejecutarlo para publicar el frontend.

La migracion es una transaccion. Crea `product_pack_settings`, habilita RLS y permite solamente lectura comercial publica. La escritura se hace mediante `internal_set_product_pack`, que verifica el token de perfil Administrador en el servidor.

Agrega columnas nuevas y opcionales de modalidad, reintento y detalle de pack a `orders` y `order_items`. Los registros historicos conservan sus valores: no se rellenan ni recalculan.

Conserva las implementaciones existentes de creacion web/local y pedidos manuales bajo nombres privados sin permiso de ejecucion de anon/authenticated. Sus entradas compatibles delegan en ellas despues de validar los datos y agregan solo los metadatos de operaciones nuevas o ediciones solicitadas.

Inicializa 96 configuraciones a partir de los IDs actuales y de las reglas anteriores del PDF. No almacena precios alternativos. `ON CONFLICT DO NOTHING` conserva cualquier configuracion que ya se hubiera editado al repetir la migracion.

No actualiza `products`, `product_variants`, `stock_movements`, clientes, secuencias ni importes de pedidos anteriores. No consulta `auth.users`.

Resultado final esperado en la misma ejecucion:

- result: purchase_modes_ready
- configured_products: 96 para el conjunto revisado (puede variar si posteriormente se agregan productos)
- authenticated_can_configure: true (la RPC exige ademas perfil Admin valido)
- anon_can_configure: false
- public_can_submit: true (necesario para pedidos de clientes sin login)

## Pruebas ejecutadas sin usar produccion

- PostgreSQL aislado (PGlite): ejecucion de la migracion completa; conservacion de productos e historicos; paridad JavaScript/SQL en las 96 configuraciones; permiso Admin/Empleado/anon; stock, packs incompletos, precios alterados, minimo exacto y reintentos.
- Pedido manual: guardar, recuperar, editar cantidades libres, pagar y repetir pago; un unico movimiento y numero conservado. Guardar pendiente no mueve stock.
- Navegador Chrome, anchos 390 y 1440: eleccion inicial, separacion y recuperacion de carritos, envio por packs inferior al minimo surtido mediante la RPC real sobre el PostgreSQL aislado y enlace WhatsApp, talles mezclados compatibles, XY 6 excluido y Goldsun.
- Editor Admin: cambio de configuracion guardado en SQL; precio derivado actualizado; registro maestro completo sin cambios.
- Cinco PDF generados con permisos de Empleado; verificacion de A4, margenes, categorias, datos de referencia, ausencia de costos, cortes y superposiciones.
- Comparacion de codigo: funciones de autenticacion/sesion, descuento de stock, movimientos, Reportes y Excel permanecen sin cambios.
- `node --check` en los tres archivos JavaScript.

Los guardados, pagos y cambios de configuracion se probaron exclusivamente en una base aislada. No se crearon pedidos ni movimientos de prueba en produccion.

Ademas se realizaron lecturas reales de Supabase: 96 productos, 96 configuraciones, 191 presentaciones habilitadas calculadas correctamente y XY talle 6 rechazado en packs. Se verifico que la respuesta comercial no incluya campos de costos y que el catalogo permaneciera igual despues de las consultas.

Chrome con el frontend preparado y el SDK real de Supabase verifico la carga de ambos catalogos, los 71 grupos de productos, los carritos independientes y la persistencia al recargar en 390 y 1440 px. Las escrituras HTTP se bloquearon en esta prueba y no se intento ninguna.

## Orden de activacion

1. SQL aplicado: completado; no requiere otra accion en Supabase.
2. Lecturas reales y pruebas aisladas: completadas.
3. Preparar un unico commit con el frontend completo y esta migracion documentada, sin incluir SQL ajeno que estaba modificado previamente.
4. Cuando se autorice publicar: `git push origin main` desde el repositorio. Vercel despliega el mismo proyecto para www.puntoxmayor.com.ar y gestion.puntoxmayor.com.ar.
5. Verificar el estado del deploy y el HTML/JS nuevo en ambos dominios.

Hasta recibir la indicacion de publicar, no hacer push a main ni un deploy manual.
