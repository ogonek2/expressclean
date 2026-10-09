import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const API = "https://enot-api.qpanel-erp.online"
const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
  Origin: "https://enot-24.com.ua",
  Referer: "https://enot-24.com.ua/",
}

async function get(path) {
  const url = path.startsWith("http") ? path : `${API}${path}`
  const res = await fetch(url, { headers })
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${url}: ${typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data).slice(0, 200)}`)
  }
  return data
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), "../data")
mkdirSync(outDir, { recursive: true })

console.log("bootstrap /")
const bootstrap = await get("/api/v1/bootstrap?route=/")
writeFileSync(join(outDir, "enot-bootstrap.json"), JSON.stringify(bootstrap, null, 2))

console.log("services all")
const services = await get("/api/v1/services")
writeFileSync(join(outDir, "enot-services-raw.json"), JSON.stringify(services, null, 2))

// Discover categories from bootstrap or services
const catsFromBootstrap =
  bootstrap?.categories ||
  bootstrap?.data?.categories ||
  bootstrap?.payload?.categories ||
  null

console.log("bootstrap keys", Object.keys(bootstrap || {}))
if (bootstrap?.data) console.log("bootstrap.data keys", Object.keys(bootstrap.data))
if (Array.isArray(services)) console.log("services array", services.length)
else console.log("services keys", Object.keys(services || {}))

const categoryList =
  catsFromBootstrap ||
  services?.categories ||
  services?.data?.categories ||
  []

console.log("categoryList length", Array.isArray(categoryList) ? categoryList.length : typeof categoryList)

// Try listing category pages from known slugs + bootstrap
let known = []
if (Array.isArray(categoryList) && categoryList.length) {
  known = categoryList
} else {
  // parse from services if they include category
  const items = Array.isArray(services)
    ? services
    : services?.data || services?.items || services?.services || []
  const map = new Map()
  for (const item of items) {
    const cat = item.category || item.category_slug || item.categorySlug
    if (!cat) continue
    const slug = typeof cat === "string" ? cat : cat.slug || cat.id
    const title = typeof cat === "string" ? cat : cat.title || cat.name || slug
    if (!map.has(slug)) map.set(slug, { slug, title, services: [] })
  }
  known = [...map.values()]
}

const catalog = []
const slugCandidates = known.length
  ? known.map((c) => (typeof c === "string" ? c : c.slug || c.path || c.id))
  : [
      "verkhniy-odyag",
      "dlya-ulyublentsiv",
      "domashniy-tekstil",
      "igrashki-ta-dityachi-rechi",
      "m-yaki-mebli",
      "prays-praski",
      "prannya-kilimiv",
      "sumky-ta-ryukzaky",
      "tekstilnyy-odyag",
      "khimchistka-aksesuariv",
      "khimchistka-vzuttya",
      "khimchistka-odyagu-z-shkiry-ta-khutra",
      "remont-vzuttya",
    ]

for (const slug of slugCandidates) {
  try {
    const data = await get(`/api/v1/categories/${encodeURIComponent(slug)}`)
    console.log("category", slug, "keys", Object.keys(data || {}), "ok")
    catalog.push({ slug, data })
  } catch (e) {
    console.log("category fail", slug, e.message)
  }
}

writeFileSync(join(outDir, "enot-categories-raw.json"), JSON.stringify(catalog, null, 2))
console.log("done", catalog.length)
