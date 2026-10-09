import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const dir = join(dirname(fileURLToPath(import.meta.url)), "../data")
const bootstrap = JSON.parse(readFileSync(join(dir, "enot-bootstrap.json"), "utf8"))

/** Prefer leaf categories (with parent), skip pure parent aggregators that only mirror children. */
const parentIds = new Set(
  bootstrap.categories.filter((c) => c.parentId).map((c) => c.parentId),
)

function flattenServices(c) {
  const fromItems = (c.items || []).map((item, i) => ({
    slug: item.href || `service-${item.id}`,
    name: item.name,
    price: item.priceBatch || item.price || "за запитом",
    price_individual: item.individualPrice || null,
    note: item.marker || null,
    description: item.seoDescription || null,
    sort: i + 1,
    promo: Boolean(item.promo),
  }))

  if (fromItems.length) return fromItems

  const sections = c.repairPriceList?.sections || []
  const flattened = []
  let sort = 1
  for (const section of sections) {
    for (const item of section.items || []) {
      flattened.push({
        slug: `repair-${item.id}`,
        name: item.name,
        price: item.priceLabel || `${item.price} грн`,
        price_individual: null,
        note: section.title,
        description: item.unit ? `Одиниця: ${item.unit}` : null,
        sort: sort++,
        promo: false,
      })
    }
  }
  return flattened
}

const leafCategories = bootstrap.categories.filter((c) => {
  if (parentIds.has(c.id)) return false
  const services = flattenServices(c)
  return services.length > 0
})

const categories = leafCategories.map((c, index) => ({
  slug: c.id,
  title: c.title,
  description: c.parentTitle
    ? `${c.title}. Напрям: ${c.parentTitle}.`
    : `Послуги категорії «${c.title}».`,
  sort: index + 1,
  icon_url: c.iconUrl || null,
  services: flattenServices(c),
}))

const catalog = {
  source: "enot-24.com.ua",
  imported_at: new Date().toISOString(),
  categories,
  totals: {
    categories: categories.length,
    services: categories.reduce((n, c) => n + c.services.length, 0),
  },
}

mkdirSync(dir, { recursive: true })
writeFileSync(join(dir, "enot-catalog.json"), JSON.stringify(catalog, null, 2))
console.log(catalog.totals)
console.log(categories.map((c) => `${c.slug}: ${c.services.length}`).join("\n"))
