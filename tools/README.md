# Fichas de producto para Google (SEO)

Cada producto del catálogo tiene su propia página estática en `p/<id>.html`
(título propio, descripción, Open Graph y datos estructurados `Product`).
Eso es lo que Google indexa: si alguien busca "cleanance gel avène", el
resultado puede ser la ficha exacta de ese producto.

## IndexNow (aviso instantáneo a los buscadores)

Al regenerar las fichas, el generador avisa a **Google, Bing y Yandex**
mediante IndexNow (`api.indexnow.org`) con la lista de URLs, para que no
dependan del rastreo del sitemap. La clave pública está en
`tools/indexnow-key.txt` y se publica en la raíz del sitio
(`https://latipiel.github.io/<clave>.txt`); IndexNow la valida contra esa
dirección, por eso debe estar publicada antes de avisar.

Si el aviso devuelve un error, las fichas se generan igual: el sitemap y el
rastreo normal siguen funcionando.

## Flujo para actualizar las fichas

### Opción A — desde el panel de administración (un clic)
En **Administración → "🧩 Actualizar fichas SEO (ZIP)"**:
1. El navegador genera el catálogo vivo y descarga `fichas-seo.zip`.
2. Descomprime el ZIP y haz doble clic en **APLICAR.bat**: copia el catálogo al
   repositorio, regenera `p/`, `sitemap.xml` y `robots.txt`, y hace commit + push
   a `main` (usa el git que viene con GitHub Desktop).
3. GitHub Pages publica el sitio en 1–3 minutos.

### Opción B — desde el terminal
1. **Volcar el catálogo vivo** (productos, precios y fotos de como los ve el
   visitante, incluidos los cambios hechos en el panel de administración):
   abre `https://latipiel.github.io/?dump=1` → se descarga `catalogo.json`.
   Guárdalo en `data/catalogo.json`.

2. **Regenerar las fichas**:

   ```
   node tools/generar-fichas.mjs
   ```

   Escribe `p/*.html`, `p/index.html` (directorio de todos los productos),
   `sitemap.xml` y actualiza `robots.txt`. Las fichas de productos que ya no
   están en el catálogo se borran (si no, Google indexaría productos
   withdrawn).

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
