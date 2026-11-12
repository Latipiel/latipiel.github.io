# Fichas de producto para Google (SEO)

Cada producto del catálogo tiene su propia página estática en `p/<id>.html`
(título propio, descripción, Open Graph y datos estructurados `Product`).
Eso es lo que Google indexa: si alguien busca "cleanance gel avène", el
resultado puede ser la ficha exacta de ese producto.

## Flujo para actualizar las fichas

1. **Volcar el catálogo vivo** (productos, precios y fotos de como los ve el
   visitante, incluidos los cambios hechos en el panel de administración):
   abre `https://latipiel.github.io/?dump=1` → se descarga `catalogo.json`.
   Guárdalo en `data/catalogo.json`.

2. **Regenerar las fichas**:

   ```
   node tools/generar-fichas.mjs
   ```

   Escribe `p/*.html`, `p/index.html` (directorio de todos los productos),
   `sitemap.xml` y actualiza `robots.txt`.

3. **Publicar**: `git add -A && git commit -m "Actualiza fichas SEO" && git push`.

## Enlace directo a un producto

`index.html?p=<id>` abre el catálogo con ese producto ya seleccionado
(la tarjeta a la vista y su ficha abierta). El `id` es el del archivo
`p/<id>.html`; el botón "Ver ficha completa" del modal lleva a él.

`id` se calcula con `productId(marca, nombre)`, la misma función en
`index.html` y en `tools/generar-fichas.mjs`. Si cambias una de las dos,
cambia la otra.

## Notas

- Los precios no se incluyen en las fichas: en el sitio se muestran como
  "Consultar precio" y un precio congelado en Google se desactualiza solo.
- `og:image` usa la foto que el visitante ve; para los productos con foto
  local (`img/...`) se sirve desde el propio sitio.
