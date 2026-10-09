import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/catalog.json"), "utf8"),
)
const SITE = process.env.SITE_ORIGIN || "https://expressclean.ua"

const urls = [
  `${SITE}/`,
  `${SITE}/poslugi`,
  ...catalog.categories.map((c) => `${SITE}/poslugi/${c.slug}`),
  `${SITE}/dlya-biznesu`,
  `${SITE}/yak-pratsyuyemo`,
  `${SITE}/faq`,
  `${SITE}/konsultatsiya`,
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
  </url>`,
  )
  .join("\n")}
</urlset>
`

fs.mkdirSync(path.join(root, "public"), { recursive: true })
fs.writeFileSync(path.join(root, "public/sitemap.xml"), sitemap, "utf8")
fs.writeFileSync(
  path.join(root, "public/robots.txt"),
  `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`,
  "utf8",
)

console.log(`Sitemap: ${urls.length} URLs`)
