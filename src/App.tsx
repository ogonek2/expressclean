import { FormEvent, useEffect, useState } from "react"
import { fetchNews, fetchServiceCategories, type NewsItem } from "./api/directus"
import {
  ArrowIcon,
  ButtonLink,
  SectionHeading,
} from "./components/Layout"
import { AppLink } from "./components/AppLink"
import {
  faq,
  process,
  segments,
  serviceCategories as fallbackCategories,
  type ServiceCategory,
} from "./content"
import { routes } from "./routes"
import { applySeo } from "./seo"

function Hero() {
  return (
      <section className="hero hero--sell">
        <div className="hero__media" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1760722974657-f64bce2f9cc5?auto=format&fit=crop&w=2000&q=85"
            alt=""
          />
        </div>
        <div className="hero__veil" aria-hidden="true" />

        <div className="hero__stage">
          <div className="container hero__content">
            <p className="hero__brand">ХІМЧИСТКА</p>
            <h1>
              Чистий текстиль для вашого бізнесу —
              <em> у день, який ви зафіксували.</em>
            </h1>
            <p className="hero__lead">
              Забираємо, обробляємо й повертаємо уніформу та текстиль з обліком
              партій. Без сюрпризів по строках.
            </p>
            <div className="hero__buttons">
              <ButtonLink href={routes.consult}>Отримати консультацію</ButtonLink>
              <ButtonLink href={routes.services} secondary>
                Дивитись прайс
              </ButtonLink>
            </div>
          </div>

          <div className="hero__proof">
            <div className="container hero__proof-grid">
              <div>
                <span>01</span>
                <strong>Забір</strong>
              </div>
              <div>
                <span>02</span>
                <strong>Облік</strong>
              </div>
              <div>
                <span>03</span>
                <strong>Повернення в строк</strong>
              </div>
              <AppLink className="hero__proof-cta" to={routes.consult}>
                Розрахувати
                <ArrowIcon />
              </AppLink>
            </div>
          </div>
        </div>
      </section>
  )
}

function ServicesPreview({ categories }: { categories: ServiceCategory[] }) {
  return (
    <section className="section section--catalog" id="послуги">
      <div className="container">
        <div className="catalog-head">
          <div>
            <span className="eyebrow">
              <i />
              Послуги та ціни
            </span>
            <h2>Оберіть категорію</h2>
          </div>
          <AppLink className="catalog-head__link" to={routes.services}>
            Усі послуги
            <ArrowIcon />
          </AppLink>
        </div>
        <div className="catalog-grid catalog-grid--compact">
          {categories.map((category, index) => (
            <AppLink
              className="catalog-card catalog-card--compact"
              to={routes.category(category.slug)}
              key={category.slug}
            >
              <div className="catalog-card__meta">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <em>{category.count} послуг</em>
              </div>
              <h3>{category.title}</h3>
              <strong>
                Прайс
                <ArrowIcon />
              </strong>
            </AppLink>
          ))}
        </div>
      </div>
    </section>
  )
}

function NewsPreview({ items }: { items: NewsItem[] }) {
  if (!items.length) return null
  return (
    <section className="section section--soft" id="news">
      <div className="container">
        <SectionHeading
          eyebrow="Новини"
          title="Оновлення сервісу та практики"
          text="Матеріали з CMS — публікуйте в Directus колекції News."
        />
        <div className="news-grid">
          {items.map((item) => (
            <article className="news-card" key={item.id}>
              <span>
                {item.published_at
                  ? new Date(item.published_at).toLocaleDateString("uk-UA")
                  : "Новина"}
              </span>
              <h3>{item.title}</h3>
              {item.excerpt && <p>{item.excerpt}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Business() {
  const [active, setActive] = useState(0)
  return (
    <section className="section section--soft" id="business">
      <div className="container">
        <SectionHeading
          eyebrow="Для бізнесу"
          title="Працюємо з процесом вашого об’єкта"
          text="Графік, маркування й документи адаптуємо до операційної моделі, а не навпаки."
        />
        <div className="segments">
          <div
            className="segments__nav"
            role="tablist"
            aria-label="Сегменти бізнесу"
          >
            {segments.map(([name], index) => (
              <button
                key={name}
                type="button"
                className={active === index ? "is-active" : ""}
                onClick={() => setActive(index)}
                role="tab"
                aria-selected={active === index}
              >
                <span>0{index + 1}</span>
                {name}
                <ArrowIcon />
              </button>
            ))}
          </div>
          <div className="segment-detail" role="tabpanel">
            <span className="eyebrow">
              <i />
              Рішення для сегмента
            </span>
            <h3>{segments[active][0]}</h3>
            <p>{segments[active][1]}</p>
            <ul>
              <li>Графік під операційне навантаження</li>
              <li>Маркування за об’єктом або співробітником</li>
              <li>Документи для бухгалтерії</li>
            </ul>
            <ButtonLink href={routes.consult} secondary>
              Розрахувати для об’єкта
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Process() {
  return (
    <section className="section process" id="process">
      <div className="container">
        <div className="heading-row">
          <SectionHeading
            eyebrow="Процес"
            title="П’ять контрольованих кроків"
          />
          <p>
            Ви знаєте, де партія, коли її повернуть і хто відповідає за кожен
            етап.
          </p>
        </div>
        <div className="steps">
          {process.map(([name, text], index) => (
            <div className="step" key={name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <i />
              <h3>{name}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <div className="responsibility">
          <div>
            <span className="eyebrow">
              <i />
              Відповідальність
            </span>
            <h3>Домовленості не залишаються «на словах»</h3>
          </div>
          <div className="responsibility__list">
            <p>
              <span>01</span>Склад і стан партії фіксуємо в акті приймання.
            </p>
            <p>
              <span>02</span>Строк циклу та графік логістики — у договорі.
            </p>
            <p>
              <span>03</span>Ризики для складних виробів погоджуємо до обробки.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Sla() {
  return (
    <section className="section section--dark" id="sla">
      <div className="container">
        <div className="heading-row">
          <SectionHeading
            eyebrow="SLA"
            title="Строк залежить від партії. Відповідальність — ні."
          />
          <p>
            Фінальний цикл визначаємо після оцінки обсягу, складу тканин і
            маршруту.
          </p>
        </div>
        <div className="sla-table">
          <div className="sla-row sla-row--head">
            <span>Режим</span>
            <span>Для чого</span>
            <span>Строк</span>
            <span>Умова</span>
          </div>
          <div className="sla-row">
            <strong>Стандартний</strong>
            <span>Регулярні партії</span>
            <span>За договором</span>
            <span>Плановий графік</span>
          </div>
          <div className="sla-row">
            <strong>Експрес</strong>
            <span>Термінова потреба</span>
            <span>Після оцінки</span>
            <span>За наявності потужності</span>
          </div>
        </div>
        <p className="sla-note">
          Без прихованого роздрібного прайсу: комерційна пропозиція враховує
          реальні параметри вашого об’єкта.
        </p>
      </div>
    </section>
  )
}

export function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="section" id="faq">
      <div className="container faq-layout">
        <div>
          <SectionHeading
            eyebrow="FAQ"
            title="До початку співпраці"
            text="Коротко про договір, ціну, облік і регулярний графік."
          />
          <AppLink className="text-link" to={routes.consult}>
            Поставити інше запитання <ArrowIcon />
          </AppLink>
        </div>
        <div className="faq-list">
          {faq.map(([question, answer], index) => (
            <div
              className={`faq-item ${open === index ? "is-open" : ""}`}
              key={question}
            >
              <button
                type="button"
                onClick={() => setOpen(open === index ? -1 : index)}
                aria-expanded={open === index}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {question}
                <i />
              </button>
              <div className="faq-answer">
                <p>{answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function LeadForm() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!consent) {
      setError(true)
      return
    }
    setError(false)
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 700)
  }

  return (
    <section className="section request" id="request">
      <div className="container request__grid">
        <div className="request__copy">
          <span className="eyebrow">
            <i />
            Комерційна пропозиція
          </span>
          <h2>Розрахуємо сервіс для вашого об’єкта</h2>
          <p>
            Залиште базові дані. Ми уточнимо склад партії, маршрут і підготуємо
            пропозицію з графіком та SLA.
          </p>
          <div className="contact-cards">
            <a href="tel:+380000000000">
              <span>Телефон</span>
              <strong>+380 00 000 00 00</strong>
            </a>
            <a href="mailto:b2b@expressclean.ua">
              <span>Email</span>
              <strong>b2b@expressclean.ua</strong>
            </a>
          </div>
        </div>
        {sent ? (
          <div className="success" role="status">
            <span>✓</span>
            <p>Заявку прийнято</p>
            <h3>Дякуємо. Повернемося з уточненнями для розрахунку.</h3>
            <button type="button" onClick={() => setSent(false)}>
              Надіслати ще одну заявку
            </button>
          </div>
        ) : (
          <form className="lead-form" onSubmit={submit} noValidate>
            <div className="form-row">
              <label>
                Ім’я
                <input
                  name="name"
                  required
                  placeholder="Як до вас звертатися"
                />
              </label>
              <label>
                Телефон
                <input
                  name="phone"
                  required
                  type="tel"
                  placeholder="+380 __ ___ __ __"
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Компанія
                <input name="company" placeholder="Назва компанії" />
              </label>
              <label>
                Тип об’єкта
                <select name="type" defaultValue="">
                  <option value="" disabled>
                    Оберіть сегмент
                  </option>
                  <option>Готель / апартаменти</option>
                  <option>Ресторан / кафе</option>
                  <option>Клініка</option>
                  <option>Офіс / рітейл</option>
                  <option>Інше</option>
                </select>
              </label>
            </div>
            <label>
              Про задачу
              <textarea
                name="message"
                placeholder="Місто, орієнтовний обсяг і бажаний графік"
                rows={3}
              />
            </label>
            <label className={`checkbox ${error ? "has-error" : ""}`}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
              <i aria-hidden="true" />
              <span>
                Погоджуюся на обробку персональних даних відповідно до{" "}
                <a href="#privacy">політики конфіденційності</a>.
              </span>
            </label>
            {error && (
              <p className="form-error">Підтвердьте згоду на обробку даних.</p>
            )}
            <button className="submit-button" type="submit" disabled={loading}>
              <span>{loading ? "Надсилаємо…" : "Отримати пропозицію"}</span>
              {!loading && <ArrowIcon />}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export default function App() {
  const [categories, setCategories] = useState<ServiceCategory[]>(
    fallbackCategories,
  )
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    applySeo({
      title: "EXPRESS CLEAN — хімчистка одягу та текстилю для бізнесу",
      description:
        "Прання і хімчистка одягу, уніформи та текстилю для бізнесу з логістикою, маркуванням і погодженим SLA.",
      path: routes.home,
      jsonLd: {
        "@type": "WebPage",
        name: "EXPRESS CLEAN",
        url: routes.home,
      },
    })
    void fetchServiceCategories().then(setCategories)
    void fetchNews(3).then(setNews)
  }, [])

  return (
    <main id="top">
      <Hero />
      <ServicesPreview categories={categories} />
      <Business />
      <Process />
      <Sla />
      <NewsPreview items={news} />
      <Faq />
      <LeadForm />
    </main>
  )
}
