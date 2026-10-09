import type { FlatService } from "../api/directus"
import type { ServiceItem } from "../content"
import { routes } from "../routes"
import { AppLink } from "./AppLink"
import { ArrowIcon } from "./Layout"

type Row = ServiceItem & {
  categorySlug?: string
  categoryTitle?: string
}

export function ServicesTable({
  rows,
  showCategory = false,
  emptyText = "Нічого не знайдено за вашим запитом.",
}: {
  rows: Row[] | FlatService[]
  showCategory?: boolean
  emptyText?: string
}) {
  if (!rows.length) {
    return <p className="table-empty">{emptyText}</p>
  }

  return (
    <div className="price-table">
      <div
        className={`price-row price-row--head ${showCategory ? "price-row--with-cat" : ""}`}
      >
        {showCategory && <span>Категорія</span>}
        <span>Послуга</span>
        <span>Потокова ціна</span>
        <span>Індивідуальна</span>
        <span>Дія</span>
      </div>
      {rows.map((item) => (
        <div
          className={`price-row ${showCategory ? "price-row--with-cat" : ""}`}
          key={`${item.categorySlug || ""}-${item.slug || item.name}-${item.price}`}
        >
          {showCategory && (
            <AppLink
              className="price-row__cat"
              to={routes.category((item as FlatService).categorySlug)}
            >
              {(item as FlatService).categoryTitle}
            </AppLink>
          )}
          <div>
            <strong>{item.name}</strong>
            {item.note && <em>{item.note}</em>}
          </div>
          <span className="price-row__cost">{item.price}</span>
          <span className="price-row__cost price-row__cost--muted">
            {item.price_individual || "—"}
          </span>
          <AppLink to={routes.consult}>
            Замовити
            <ArrowIcon />
          </AppLink>
        </div>
      ))}
    </div>
  )
}

export function CategoryCards({
  categories,
}: {
  categories: {
    slug: string
    title: string
    count: number
    text: string
  }[]
}) {
  return (
    <div className="catalog-grid">
      {categories.map((category, index) => (
        <AppLink
          className="catalog-card"
          to={routes.category(category.slug)}
          key={category.slug}
        >
          <div className="catalog-card__meta">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <em>{category.count} послуг</em>
          </div>
          <h3>{category.title}</h3>
          <p>{category.text}</p>
          <strong>
            Відкрити прайс
            <ArrowIcon />
          </strong>
        </AppLink>
      ))}
    </div>
  )
}
