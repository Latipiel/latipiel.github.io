/**
 * Generador de fichas estáticas de producto (SEO) para LatiPiel.
 *
 *   node tools/generar-fichas.mjs
 *
 * Lee  : data/catalogo.json  (volcado del catálogo vivo; se descarga con
 *        https://latipiel.github.io/?dump=1 )
 * Escribe:
 *   p/<id>.html   una ficha por producto (título, descripción, Open Graph,
 *                  datos estructurados Product) — es lo que Google indexa
 *   p/index.html  directorio de todos los productos (para que Google los
 *                  descubra sin depender del catálogo, que es una SPA)
 *   sitemap.xml   con todas las URLs
 *   robots.txt    permiso de rastreo + referencia al sitemap
 *
 * El identificador <id> se calcula igual que productId() en index.html,
 * para que el enlace index.html?p=<id> abra justo ese producto.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://latipiel.github.io";
const FUENTE = join(RAIZ, "data", "catalogo.json");
const DESTINO = join(RAIZ, "p");

/* Idéntico a productId() del sitio. */
function productId(brand, name) {
  const base = (brand + " " + name).toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "").slice(0, 64) || "producto";
  let h = 0; const s = brand + "|" + name;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  return base + "-" + (h % 1679616).toString(36);
}

const esc = (v) => String(v == null ? "" : v)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const cat = (p) => {
  const s = (p.segments || []).filter(Boolean);
  return s.length ? s.join(" · ") : "Farmacia dermatológica";
};

const imagen = (p) => {
  const u = p.image || "";
  if (!u) return "";
  if (u.startsWith("/") || u.startsWith("img/")) return SITE + "/" + u.replace(/^\/+/, "");
  if (u.startsWith("http://")) return "https://" + u.slice(7);
  return u;
};

const texto = (p) => {
  const partes = [];
  if (p.description) partes.push(p.description);
  if (p.summary && !partes.includes(p.summary)) partes.push(p.summary);
  if (p.actives) partes.push("Principios activos: " + p.actives);
  if (p.use) partes.push("Modo de uso: " + p.use);
  if (p.routine) partes.push("Momento de uso: " + p.routine);
  return partes.join(" ");
};

function descripcionMeta(p) {
  const t = texto(p).replace(/\s+/g, " ").trim();
  const base = t || `${p.name} de ${p.brand} en la farmacia dermatológica LatiPiel (Ambato y Pelileo).`;
  return base.length > 300 ? base.slice(0, 297).replace(/\s\S*$/, "") + "…" : base;
}

function ficha(p, id) {
  const url = `${SITE}/p/${id}.html`;
  const img = imagen(p);
  const vol = (p.volume || "").trim();
  const benef = (p.benefits || []).filter(Boolean);
  const datos = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: vol ? `${p.name} ${vol}` : p.name,
    brand: { "@type": "Brand", name: p.brand },
    category: cat(p),
    description: descripcionMeta(p),
    url,
    ...(img ? { image: img } : {}),
    ...(p.skin ? { audience: p.skin } : {}),
    manufacturer: { "@type": "Organization", name: p.brand },
    additionalProperty: [
      ...(p.skin ? [{ "@type": "PropertyValue", name: "Tipo de piel", value: p.skin }] : []),
      ...(vol ? [{ "@type": "PropertyValue", name: "Presentación", value: vol }] : []),
      ...(p.actives ? [{ "@type": "PropertyValue", name: "Principios activos", value: p.actives }] : []),
    ],
  };
  const desc = descripcionMeta(p);
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(p.name)}${vol ? " " + esc(vol) : ""} | ${esc(p.brand)} | Farmacia Dermatológica LatiPiel</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<link rel="sitemap" type="application/xml" title="Sitemap" href="${SITE}/sitemap.xml">
<meta property="og:type" content="product">
<meta property="og:site_name" content="Farmacia Dermatológica LatiPiel">
<meta property="og:locale" content="es_EC">
<meta property="og:title" content="${esc(p.name)}${vol ? " " + esc(vol) : ""} | ${esc(p.brand)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
${img ? `<meta property="og:image" content="${esc(img)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.name)}${vol ? " " + esc(vol) : ""} | ${esc(p.brand)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(img)}">` : ""}
<script type="application/ld+json">${JSON.stringify(datos)}</script>
<style>
body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#33302f;background:#fdf7f5}
main{max-width:760px;margin:0 auto;padding:24px 18px 48px}
nav{font-size:13px;font-weight:700;margin-bottom:18px}
nav a{color:#2f8f95}
h1{font-size:26px;line-height:1.2;margin:0 0 4px}
.marca{font-weight:800;color:#2f8f95;letter-spacing:.04em;text-transform:uppercase;font-size:12px;margin:0 0 14px}
.vol{color:#6b5552;font-size:14px;margin:0 0 18px}
img.foto{max-width:100%;max-height:360px;border-radius:18px;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.08)}
h2{font-size:17px;margin:26px 0 8px}
p,li{line-height:1.6;font-size:15px}
ul{padding-left:20px}
.cta{display:inline-block;margin-top:10px;margin-right:10px;padding:12px 18px;border-radius:12px;background:#3aa0a6;color:#fff;font-weight:800;text-decoration:none;font-size:14px}
.wa{background:#25D366;color:#fff}
.seg{display:inline-block;background:#e8f4f3;color:#2f6f74;border-radius:999px;padding:4px 12px;font-size:12px;font-weight:700;margin-bottom:12px}
footer{margin-top:36px;font-size:12px;color:#8a7f7d}
</style>
</head>
<body>
<main>
<nav><a href="/">← Volver al catálogo</a> · <a href="/p/">Todos los productos</a></nav>
<p class="seg">${esc(cat(p))}</p>
<h1>${esc(p.name)}${vol ? " " + esc(vol) : ""}</h1>
<p class="marca">${esc(p.brand)}</p>
${img ? `<img class="foto" src="${esc(img)}" alt="${esc(p.name)}${vol ? " " + esc(vol) : ""} de ${esc(p.brand)}" loading="eager">` : ""}
${p.skin ? `<h2>Para qué tipo de piel</h2><p>${esc(p.skin)}</p>` : ""}
${p.actives ? `<h2>Principios activos</h2><p>${esc(p.actives)}</p>` : ""}
${p.use ? `<h2>Modo de uso</h2><p>${esc(p.use)}</p>` : ""}
${p.routine ? `<h2>Cuándo usarlo</h2><p>${esc(p.routine)}</p>` : ""}
${benef.length ? `<h2>Beneficios</h2><ul>${benef.map(b => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
${p.description ? `<h2>Descripción</h2><p>${esc(p.description)}</p>` : ""}
<h2>Consultar y comprar</h2>
<p>Precio y disponibilidad según la sucursal (Ambato y Pelileo). Escríbenos para confirmar stock, precio y datos del producto.</p>
<a class="cta" href="/index.html?p=${encodeURIComponent(id)}">Verlo en el catálogo</a>
<a class="cta wa" href="https://wa.me/?text=${encodeURIComponent(`Hola LatiPiel, quiero información sobre ${p.brand} ${p.name}${vol ? " " + vol : ""}`)}">Consultar por WhatsApp</a>
<footer>Farmacia Dermatológica LatiPiel · Ambato y Pelileo, Ecuador · <a href="/sitemap.xml">Mapa del sitio</a></footer>
</main>
</body>
</html>
`;
}

function directorio(productos) {
  const porMarca = new Map();
  for (const p of productos) {
    if (!porMarca.has(p.brand)) porMarca.set(p.brand, []);
    porMarca.get(p.brand).push(p);
  }
  const secciones = [...porMarca.entries()].map(([marca, ps]) => `
  <section>
    <h2>${esc(marca)}</h2>
    <ul>${ps.map(p => `<li><a href="${esc(p.id)}.html">${esc(p.name)}${p.volume ? " " + esc(p.volume) : ""}</a></li>`).join("")}</ul>
  </section>`).join("\n");
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Todos los productos | Farmacia Dermatológica LatiPiel</title>
<meta name="description" content="Catálogo completo de productos de la farmacia dermatológica LatiPiel: ${productos.length} referencias de ${porMarca.size} laboratorios, con ficha de cada producto.">
<link rel="canonical" href="${SITE}/p/">
<style>body{font-family:system-ui,sans-serif;color:#33302f;background:#fdf7f5;margin:0}
main{max-width:900px;margin:0 auto;padding:24px 18px 48px}
h1{font-size:26px}h2{font-size:17px;color:#2f6f74;margin:22px 0 6px}
ul{padding-left:18px;line-height:1.7}a{color:#2f8f95}</style>
</head>
<body><main>
<h1>Todos los productos</h1>
<p>${productos.length} referencias de ${porMarca.size} laboratorios. Cada ficha tiene su descripción, principios activos y forma de comprar en Ambato y Pelileo.</p>
${secciones}
</main></body></html>
`;
}

const catalogo = JSON.parse(readFileSync(FUENTE, "utf8"));
mkdirSync(DESTINO, { recursive: true });

const vistos = new Set();
const productos = [];
for (const p of catalogo) {
  if (!p || !p.brand || !p.name) continue;
  let id = productId(p.brand, p.name);
  if (vistos.has(id)) { let n = 2; while (vistos.has(id + "-" + n)) n++; id = id + "-" + n; }
  vistos.add(id);
  productos.push({ ...p, id });
}

let escritas = 0;
for (const p of productos) {
  writeFileSync(join(DESTINO, p.id + ".html"), ficha(p, p.id), "utf8");
  escritas++;
}
writeFileSync(join(DESTINO, "index.html"), directorio(productos), "utf8");

/* Limpiar las fichas de productos que ya no están en el catálogo: si se
   quedan, Google indexa páginas de productos que ya no se venden. */
const validas = new Set(productos.map(p => p.id + ".html"));
let borradas = 0;
for (const f of readdirSync(DESTINO)) {
  if (f === "index.html" || !f.endsWith(".html")) continue;
  if (!validas.has(f)) { unlinkSync(join(DESTINO, f)); borradas++; }
}

const urls = [
  `<url><loc>${SITE}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
  `<url><loc>${SITE}/p/</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`,
  ...productos.map(p => `<url><loc>${SITE}/p/${p.id}.html</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
];
/* El sitemap se deja en XML puro (sin hojas de estilo): es lo que Google
   espera. La versión legible para personas es p/index.html, con el listado
   de todos los productos enlazado a su ficha. */
writeFileSync(join(RAIZ, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`, "utf8");

const robotsPath = join(RAIZ, "robots.txt");
const robots = existsSync(robotsPath) ? readFileSync(robotsPath, "utf8") : "";
if (!/^Sitemap:/m.test(robots)) {
  const base = robots.replace(/\s*$/, "\n");
  writeFileSync(robotsPath, base + `Sitemap: ${SITE}/sitemap.xml\n`, "utf8");
}

console.log(`Fichas generadas: ${escritas} en p/`);
console.log(`Directorio: p/index.html`);
console.log(`Sitemap: sitemap.xml (${urls.length} URLs)`);
console.log(`robots.txt: ${/^Sitemap:/m.test(readFileSync(robotsPath, "utf8")) ? "actualizado" : "ya tenía sitemap"}`);
