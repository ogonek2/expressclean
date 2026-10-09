import { FormEvent, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  fetchAllServices,
  fetchServiceCategories,
  type FlatService,
} from "./api/directus"
import { AppLink } from "./components/AppLink"
import { ButtonLink, SectionHeading } from "./components/Layout"
import { CategoryCards, ServicesTable } from "./components/ServicesTable"
import {
  allServices as fallbackAll,
  serviceCategories as fallbackCategories,
  type ServiceCategory,
} from "./content"
import { routes } from "./routes"
import { applySeo } from "./seo"

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""

  const [categories, setCategories] =
    useState<ServiceCategory[]>(fallbackCategories)
  const [services, setServices] = useState<FlatService[]>(fallbackAll)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    applySeo({
      title: "Усі послуги та ціни — EXPRESS CLEAN",
      description:
        "Повний прайс EXPRESS CLEAN: фільтр за категорією, пошук по назві та актуальні ціни хімчистки й прання.",
      path: routes.services,
      jsonLd: {
        "@type": "CollectionPage",
        name: "Каталог послуг EXPRESS CLEAN",
        url: routes.services,
      },
    })

    void Promise.all([fetchServiceCategories(), fetchAllServices()]).then(
      ([cats, rows]) => {
        setCategories(cats)
        setServices(rows)
        setLoading(false)
      },
    )
  }, [])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return services.filter((row) => {
      if (category && row.categorySlug !== category) return false
      if (!needle) return true
      return (
        row.name.toLowerCase().includes(needle) ||
        row.categoryTitle.toLowerCase().includes(needle) ||
        (row.note || "").toLowerCase().includes(needle) ||
        row.price.toLowerCase().includes(needle)
      )
    })
  }, [services, query, category])

  function patchParams(next: { q?: string; category?: string }) {
    const params = new URLSearchParams()
    const q = next.q ?? query
    const cat = next.category ?? category
    if (q.trim()) params.set("q", q.trim())
    if (cat) params.set("category", cat)
    setSearchParams(params, { replace: true })
  }

  function onSearch(event: FormEvent) {
    event.preventDefault()
  }

  return (
    <main id="top" className="services-page">
      <section className="section services-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Навігаційний шлях">
            <AppLink to={routes.home}>Головна</AppLink>
            <span>/</span>
            <span>Послуги</span>
          </nav>
          <div className="heading-row">
            <SectionHeading
              eyebrow="Усі послуги"
              title="Загальний прайс із фільтрами та пошуком"
              text="Категорія → окремий прайс, або вся таблиця з фільтрами й пошуком."
            />
            <ButtonLink href={routes.consult}>Консультація</ButtonLink>
          </div>

          <form className="catalog-toolbar" onSubmit={onSearch}>
            <label className="catalog-search">
              <span>Пошук</span>
              <input
                value={query}
                onChange={(event) => patchParams({ q: event.target.value })}
                placeholder="Назва послуги, категорія, ціна…"
                autoComplete="off"
              />
            </label>
            <label className="catalog-filter">
              <span>Категорія</span>
              <select
                value={category}
                onChange={(event) =>
                  patchParams({ category: event.target.value })
                }
              >
                <option value="">Усі категорії</option>
                {categories.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.title} ({item.count})
                  </option>
                ))}
              </select>
            </label>
            {(query || category) && (
              <button
                type="button"
                className="catalog-reset"
                onClick={() => setSearchParams({}, { replace: true })}
              >
                Скинути
              </button>
            )}
          </form>

          <div className="catalog-chips">
            <button
              type="button"
              className={!category ? "is-active" : ""}
              onClick={() => patchParams({ category: "" })}
            >
              Усі
            </button>
            {categories.map((item) => (
              <button
                type="button"
                key={item.slug}
                className={category === item.slug ? "is-active" : ""}
                onClick={() => patchParams({ category: item.slug })}
              >
                {item.title}
              </button>
            ))}
          </div>

          <p className="catalog-count">
            {loading
              ? "Завантажуємо прайс…"
              : `Знайдено ${filtered.length} з ${services.length} послуг`}
          </p>

          <ServicesTable rows={filtered} showCategory />
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <SectionHeading
            eyebrow="Категорії"
            title="Або відкрийте окремий прайс категорії"
          />
          <div style={{ marginTop: 36 }}>
            <CategoryCards categories={categories} />
          </div>
        </div>
      </section>
    </main>
  )
}
