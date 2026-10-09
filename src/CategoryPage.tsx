import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { fetchCategoryBySlug, fetchServiceCategories } from "./api/directus"
import { AppLink } from "./components/AppLink"
import { ButtonLink, SectionHeading } from "./components/Layout"
import { CategoryCards, ServicesTable } from "./components/ServicesTable"
import {
  serviceCategories as fallbackCategories,
  type ServiceCategory,
} from "./content"
import { routes } from "./routes"
import { applySeo } from "./seo"

export default function CategoryPage() {
  const { slug = "" } = useParams()
  const [category, setCategory] = useState<ServiceCategory | null>(
    () => fallbackCategories.find((item) => item.slug === slug) || null,
  )
  const [others, setOthers] = useState<ServiceCategory[]>(fallbackCategories)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setCategory(fallbackCategories.find((item) => item.slug === slug) || null)

    void Promise.all([
      slug ? fetchCategoryBySlug(slug) : Promise.resolve(null),
      fetchServiceCategories(),
    ]).then(([current, list]) => {
      if (!alive) return
      setCategory(current)
      setOthers(list)
      setLoading(false)
      if (current) {
        applySeo({
          title: `${current.title} — прайс послуг | EXPRESS CLEAN`,
          description:
            current.text ||
            `Прайс категорії «${current.title}»: ${current.count} послуг з потоковими та індивідуальними цінами.`,
          path: routes.category(current.slug),
          jsonLd: {
            "@type": "CollectionPage",
            name: current.title,
            description: current.text,
            url: routes.category(current.slug),
            isPartOf: { "@type": "CollectionPage", url: routes.services },
          },
        })
      } else if (!slug) {
        applySeo({
          title: "Категорії послуг — EXPRESS CLEAN",
          description:
            "Оберіть категорію хімчистки чи прання та відкрийте окремий прайс.",
          path: routes.services,
        })
      } else {
        applySeo({
          title: "Категорію не знайдено — EXPRESS CLEAN",
          description: "Такої категорії немає в каталозі EXPRESS CLEAN.",
          path: routes.category(slug),
          noindex: true,
        })
      }
    })

    return () => {
      alive = false
    }
  }, [slug])

  if (!slug) {
    return (
      <main id="top" className="section">
        <div className="container">
          <SectionHeading eyebrow="Категорії" title="Оберіть категорію послуг" />
          <div style={{ marginTop: 36 }}>
            <CategoryCards categories={others} />
          </div>
        </div>
      </main>
    )
  }

  if (!loading && !category) {
    return (
      <main id="top" className="section">
        <div className="container">
          <SectionHeading
            eyebrow="404"
            title="Такої категорії немає"
            text="Перевірте посилання або оберіть напрям зі списку."
          />
          <div style={{ marginTop: 28 }}>
            <ButtonLink href={routes.services}>Усі послуги</ButtonLink>
          </div>
          <div style={{ marginTop: 48 }}>
            <CategoryCards categories={others} />
          </div>
        </div>
      </main>
    )
  }

  if (!category) return null

  return (
    <main id="top" className="services-page">
      <section className="section services-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Навігаційний шлях">
            <AppLink to={routes.home}>Головна</AppLink>
            <span>/</span>
            <AppLink to={routes.services}>Послуги</AppLink>
            <span>/</span>
            <span>{category.title}</span>
          </nav>
          <div className="heading-row">
            <SectionHeading
              eyebrow="Категорія"
              title={category.title}
              text={category.text}
            />
            <div className="heading-actions">
              <ButtonLink href={routes.services} secondary>
                Усі послуги
              </ButtonLink>
              <ButtonLink href={routes.consult}>Замовити</ButtonLink>
            </div>
          </div>

          <p className="catalog-count">{category.count} послуг у таблиці</p>
          <ServicesTable rows={category.items} />
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <SectionHeading
            eyebrow="Інші категорії"
            title="Перегляньте суміжні напрями"
          />
          <div style={{ marginTop: 36 }}>
            <CategoryCards
              categories={others.filter((item) => item.slug !== category.slug)}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
