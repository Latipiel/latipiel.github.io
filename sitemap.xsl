<?xml version="1.0" encoding="UTF-8"?>
<!-- Hoja de estilo del sitemap: hace que se vea una tabla cuando alguien
     abre sitemap.xml en el navegador (Google lo lee igual, con o sin estilo). -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <title>Sitemap · Farmacia Dermatológica LatiPiel</title>
        <style>
          body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:#fdf7f5;color:#33302f;margin:0;padding:28px}
          h1{font-size:22px;margin:0 0 4px}
          p.sub{color:#6b5552;margin:0 0 20px;font-size:14px}
          table{border-collapse:collapse;width:100%;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.06)}
          th{background:#2f8f95;color:#fff;text-align:left;padding:10px 14px;font-size:13px}
          td{padding:9px 14px;border-top:1px solid #f0e2de;font-size:13px;word-break:break-all}
          tr:nth-child(even) td{background:#fdf9f8}
          a{color:#2f8f95}
          .count{font-weight:700}
        </style>
      </head>
      <body>
        <h1>Sitemap del catálogo</h1>
        <p class="sub">Farmacia Dermatológica LatiPiel · Ambato y Pelileo (Ecuador) ·
          <span class="count"><xsl:number value="count(urlset/url)" format="1"/></span> URLs indexadas.</p>
        <table>
          <tr><th>URL</th><th>Frecuencia</th><th>Prioridad</th></tr>
          <xsl:for-each select="urlset/url">
            <tr>
              <td><a href="{loc}"><xsl:value-of select="loc"/></a></td>
              <td><xsl:value-of select="changefreq"/></td>
              <td><xsl:value-of select="priority"/></td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
