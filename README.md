# GB Mayorista

Aplicacion web estatica para un catalogo mayorista simple.

## Como usar

1. Abrir `index.html` en el navegador.
2. Usar el catalogo para agregar productos al carrito.
3. Abrir el carrito y enviar el pedido por WhatsApp.
4. Entrar a `Admin` para agregar o eliminar productos.

## Configuracion rapida

En `app.js`, cambiar `WHATSAPP_NUMBER` por el numero real con codigo de pais, sin espacios ni signos.

Ejemplo para Argentina:

```js
const WHATSAPP_NUMBER = "5491112345678";
```

Los productos y el carrito se guardan en `localStorage`, por eso esta version no necesita servidor ni base de datos.

## Roles de prueba

La app incluye botones para simular `Cliente`, `Empleado` y `Dueño`.

- Cliente: catalogo, precios, compra minima, carrito de consulta y WhatsApp. No genera venta y no descuenta stock.
- Empleado: productos, precios, stock y consultas/presupuestos. Puede editar productos, cantidades, observaciones y estados.
- Dueño: todo lo anterior mas ventas confirmadas, costos, ganancias estimadas y reportes.

Estados internos:

- Consulta recibida
- Presupuesto armado
- Pedido confirmado
- Preparado
- Enviado
- Retirado
- Cancelado

Solo `Pedido confirmado`, `Preparado`, `Enviado` y `Retirado` cuentan como venta real para reportes.
