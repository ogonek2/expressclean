/**
 * Semantic site architecture (canonical URLs)
 *
 * /                         — головна (hero + огляд)
 * /poslugi/                 — повний каталог послуг (таблиця + фільтри)
 * /poslugi/:slug/           — канонічна сторінка категорії / прайс
 * /dlya-biznesu/            — B2B сегменти та умови
 * /yak-pratsyuyemo/         — процес + SLA
 * /faq/                     — питання та відповіді
 * /konsultatsiya/           — заявка на розрахунок
 *
 * Legacy (redirect):
 * /poslugi.html             → /poslugi/
 * /kategoriya.html?slug=x   → /poslugi/x/
 */

export const SITE_ORIGIN =
  typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : "https://expressclean.ua"

export const routes = {
  home: "/",
  services: "/poslugi",
  category: (slug: string) => `/poslugi/${encodeURIComponent(slug)}`,
  business: "/dlya-biznesu",
  process: "/yak-pratsyuyemo",
  faq: "/faq",
  consult: "/konsultatsiya",
  privacy: "/#privacy",
} as const

export const nav = [
  { label: "Послуги", href: routes.services },
  { label: "Для бізнесу", href: routes.business },
  { label: "Як працюємо", href: routes.process },
  { label: "FAQ", href: routes.faq },
] as const

export function categorySlugFromPath(pathname = window.location.pathname) {
  const parts = pathname.replace(/\.html$/, "").split("/").filter(Boolean)
  if (parts[0] === "poslugi" && parts[1] && parts[1] !== "index") {
    return decodeURIComponent(parts[1])
  }
  return ""
}

export function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${SITE_ORIGIN}${normalized}`
}
