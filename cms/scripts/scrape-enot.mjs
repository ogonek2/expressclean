const categories = [
  { slug: "verkhniy-odyag", title: "Верхній одяг", path: "verkhniy-odyag" },
  { slug: "dlya-ulyublentsiv", title: "Для улюбленців", path: "dlya-ulyublentsiv" },
  { slug: "domashniy-tekstil", title: "Домашній текстиль", path: "domashniy-tekstil" },
  {
    slug: "igrashki-ta-dityachi-rechi",
    title: "Іграшки та дитячі речі",
    path: "igrashki-ta-dityachi-rechi",
  },
  { slug: "m-yaki-mebli", title: "М'які меблі", path: "m-yaki-mebli" },
  { slug: "prays-praski", title: "Прайс праски", path: "prays-praski" },
  { slug: "prannya-kilimiv", title: "Прання килимів", path: "prannya-kilimiv" },
  { slug: "sumky-ta-ryukzaky", title: "Сумки та рюкзаки", path: "sumky-ta-ryukzaky" },
  { slug: "tekstilnyy-odyag", title: "Текстильний одяг", path: "tekstilnyy-odyag" },
  {
    slug: "khimchistka-aksesuariv",
    title: "Хімчистка аксесуарів",
    path: "khimchistka-aksesuariv",
  },
  { slug: "khimchistka-vzuttya", title: "Хімчистка взуття", path: "khimchistka-vzuttya" },
  {
    slug: "khimchistka-odyagu-z-shkiry-ta-khutra",
    title: "Хімчистка одягу з шкіри та хутра",
    path: "khimchistka-odyagu-z-shkiry-ta-khutra",
  },
  { slug: "remont-vzuttya", title: "Ремонт взуття", path: "remont-vzuttya" },
]

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/json",
}

function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\u00a0/g, " ")
}

function parseServices(text) {
  const lines = text
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)

  const services = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // skip nav noise
    if (
      /^(Послуга|Потокова ціна|Індивідуальна ціна|Дія|Інші категорії|Про нас|Контакти)$/i.test(
        line,
      )
    ) {
      continue
    }

    // Look for a service title followed by "Потокова ..." nearby
    const window = lines.slice(i, i + 8)
    const priceIdx = window.findIndex((l) => /^Потокова\s+/i.test(l) || /^Потокова$/i.test(l))
    if (priceIdx === -1) continue

    let priceLine = window[priceIdx]
    if (/^Потокова$/i.test(priceLine) && window[priceIdx + 1]) {
      priceLine = `Потокова ${window[priceIdx + 1]}`
    }

    const priceMatch = priceLine.match(/Потокова\s+(.+)$/i)
    if (!priceMatch) continue

    // title is previous meaningful line(s)
    let title = line
    if (/^Потокова/i.test(title)) continue
    if (title.length < 2 || title.length > 120) continue
    if (/^\d+\s*послуг/i.test(title)) continue
    if (/ЄНОТ|Telegram|Viber|gmail|Київ|\+\d/i.test(title)) continue

    let individual = null
    const indIdx = window.findIndex((l) => /^Індивідуальна\s+/i.test(l) || /^Індивідуальна$/i.test(l))
    if (indIdx !== -1) {
      let indLine = window[indIdx]
      if (/^Індивідуальна$/i.test(indLine) && window[indIdx + 1]) {
        indLine = `Індивідуальна ${window[indIdx + 1]}`
      }
      const m = indLine.match(/Індивідуальна\s+(.+)$/i)
      if (m && !/^—|-|$/.test(m[1].trim())) individual = m[1].trim()
    }

    const key = `${title}|${priceMatch[1].trim()}`
    if (services.some((s) => `${s.name}|${s.price}` === key)) continue

    services.push({
      name: title,
      price: priceMatch[1].trim().replace(/\s+/g, " "),
      price_individual: individual ? individual.replace(/\s+/g, " ") : null,
    })
  }
  return services
}

async function tryApiGuess(slug) {
  const guesses = [
    `https://enot-24.com.ua/api/categories/${slug}`,
    `https://enot-24.com.ua/api/poslugi/${slug}`,
    `https://enot-24.com.ua/api/services?category=${slug}`,
    `https://api.enot-24.com.ua/categories/${slug}`,
  ]
  for (const url of guesses) {
    try {
      const res = await fetch(url, { headers })
      const ct = res.headers.get("content-type") || ""
      if (res.ok && ct.includes("json")) {
        return { url, data: await res.json() }
      }
    } catch {
      /* ignore */
    }
  }
  return null
}

const result = []

for (const cat of categories) {
  const url = `https://enot-24.com.ua/poslugi-ta-cini/${cat.path}`
  console.log("Fetching", url)
  const api = await tryApiGuess(cat.path)
  if (api) {
    console.log("API hit", api.url)
  }

  const res = await fetch(url, { headers })
  const html = await res.text()
  const text = strip(html)
  const services = parseServices(text)
  console.log(`  ${cat.title}: ${services.length} services (html ${html.length})`)
  if (services[0]) console.log("  sample", services[0])
  result.push({ ...cat, services })
}

import { writeFileSync } from "node:fs"
writeFileSync(
  new URL("../data/enot-catalog.json", import.meta.url),
  JSON.stringify(result, null, 2),
  "utf8",
)
console.log("Wrote cms/data/enot-catalog.json")
