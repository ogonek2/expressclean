import { absoluteUrl } from "./routes"

export type SeoInput = {
  title: string
  description: string
  path: string
  type?: "website" | "article"
  noindex?: boolean
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

function upsertMeta(
  attr: "name" | "property",
  key: string,
  content: string,
) {
  let node = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  )
  if (!node) {
    node = document.createElement("meta")
    node.setAttribute(attr, key)
    document.head.appendChild(node)
  }
  node.content = content
}

function upsertLink(rel: string, href: string) {
  let node = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!node) {
    node = document.createElement("link")
    node.rel = rel
    document.head.appendChild(node)
  }
  node.href = href
}

function upsertJsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  const id = "seo-jsonld"
  let node = document.getElementById(id) as HTMLScriptElement | null
  if (!node) {
    node = document.createElement("script")
    node.type = "application/ld+json"
    node.id = id
    document.head.appendChild(node)
  }
  node.textContent = JSON.stringify(data)
}

export function applySeo({
  title,
  description,
  path,
  type = "website",
  noindex = false,
  jsonLd,
}: SeoInput) {
  const url = absoluteUrl(path)
  document.documentElement.lang = "uk"
  document.title = title

  upsertMeta("name", "description", description)
  upsertMeta("name", "robots", noindex ? "noindex,nofollow" : "index,follow")
  upsertMeta("property", "og:title", title)
  upsertMeta("property", "og:description", description)
  upsertMeta("property", "og:type", type)
  upsertMeta("property", "og:url", url)
  upsertMeta("property", "og:locale", "uk_UA")
  upsertMeta("property", "og:site_name", "EXPRESS CLEAN")
  upsertMeta("name", "twitter:card", "summary_large_image")
  upsertMeta("name", "twitter:title", title)
  upsertMeta("name", "twitter:description", description)
  upsertLink("canonical", url)

  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "EXPRESS CLEAN",
      url: absoluteUrl("/"),
      email: "b2b@expressclean.ua",
      telephone: "+380000000000",
      description:
        "Хімчистка, прання та логістика текстилю для бізнесу в Україні.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "EXPRESS CLEAN",
      url: absoluteUrl("/"),
      inLanguage: "uk-UA",
      potentialAction: {
        "@type": "SearchAction",
        target: `${absoluteUrl("/poslugi/")}?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    ...(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []),
  ]

  upsertJsonLd(graph)
}
