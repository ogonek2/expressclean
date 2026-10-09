import type { ServiceCategory, ServiceItem } from "../content"
import {
  allServices as fallbackAll,
  serviceCategories as fallbackCategories,
} from "../content"

const DIRECTUS_URL = (
  import.meta.env.VITE_DIRECTUS_URL || "http://localhost:8055"
).replace(/\/$/, "")

export type NewsItem = {
  id: number
  slug: string
  title: string
  excerpt: string | null
  body: string | null
  published_at: string | null
}

export type FlatService = ServiceItem & {
  categorySlug: string
  categoryTitle: string
}

type DirectusCategory = {
  id: number
  slug: string
  title: string
  description: string | null
  icon_url?: string | null
  services?: {
    id: number
    slug?: string | null
    name: string
    price: string
    price_individual?: string | null
    note: string | null
    description?: string | null
    sort: number | null
    status?: string
  }[]
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${DIRECTUS_URL}${path}`)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

function mapCategories(data: DirectusCategory[]): ServiceCategory[] {
  return data.map((category) => {
    const items = (category.services || [])
      .filter((service) => !service.status || service.status === "published")
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      .map((service) => ({
        slug: service.slug || undefined,
        name: service.name,
        price: service.price,
        price_individual: service.price_individual,
        note: service.note,
        description: service.description,
      }))

    return {
      slug: category.slug,
      title: category.title,
      text: category.description || "",
      icon_url: category.icon_url,
      count: items.length,
      items,
    }
  })
}

export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  const data = await getJson<{ data: DirectusCategory[] }>(
    "/items/categories?filter[status][_eq]=published&sort=sort&fields=id,slug,title,description,icon_url,services.id,services.slug,services.name,services.price,services.price_individual,services.note,services.description,services.sort,services.status",
  )
  if (!data?.data?.length) return fallbackCategories
  return mapCategories(data.data)
}

export async function fetchAllServices(): Promise<FlatService[]> {
  const categories = await fetchServiceCategories()
  if (!categories.length) return fallbackAll
  return categories.flatMap((category) =>
    category.items.map((item) => ({
      ...item,
      categorySlug: category.slug,
      categoryTitle: category.title,
    })),
  )
}

export async function fetchCategoryBySlug(
  slug: string,
): Promise<ServiceCategory | null> {
  const categories = await fetchServiceCategories()
  return categories.find((category) => category.slug === slug) || null
}

export async function fetchNews(limit = 6): Promise<NewsItem[]> {
  const data = await getJson<{ data: NewsItem[] }>(
    `/items/news?filter[status][_eq]=published&sort=-published_at,-id&limit=${limit}&fields=id,slug,title,excerpt,body,published_at`,
  )
  return data?.data ?? []
}

export function getDirectusUrl() {
  return DIRECTUS_URL
}
