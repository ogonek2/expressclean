import { ReactNode, useEffect, useId, useState } from "react"
import { useLocation } from "react-router-dom"
import { serviceCategories } from "../content"
import { nav, routes } from "../routes"
import { AppLink } from "./AppLink"

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <AppLink
      className={`logo ${compact ? "logo--compact" : ""}`}
      to={routes.home}
      aria-label="EXPRESS CLEAN — на головну"
    >
      <strong>EXPRESS CLEAN</strong>
      <span>хімчистка · прання · логістика</span>
    </AppLink>
  )
}

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 10h13M11 5l5 5-5 5" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M13 13l4 4" />
    </svg>
  )
}

function BurgerButton({
  open,
  onToggle,
  controlsId,
}: {
  open: boolean
  onToggle: () => void
  controlsId: string
}) {
  return (
    <button
      type="button"
      className={`burger ${open ? "is-open" : ""}`}
      aria-label={open ? "Закрити меню" : "Відкрити меню"}
      aria-expanded={open}
      aria-controls={controlsId}
      onClick={onToggle}
    >
      <span className="burger__box" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </button>
  )
}

function SearchButton({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <AppLink
      className="search-button"
      to={routes.services}
      aria-label="Пошук послуг"
      title="Пошук послуг"
      onClick={onNavigate}
    >
      <SearchIcon />
    </AppLink>
  )
}

const quickCategories = serviceCategories.slice(0, 6)

export function Header() {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1051px)")
    const onChange = () => {
      if (mq.matches) setOpen(false)
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const close = () => setOpen(false)

  return (
    <>
      <header className={`site-nav ${open ? "is-menu-open" : ""}`}>
        <div className="site-nav__top">
          <div className="container site-nav__top-inner">
            <div className="site-nav__top-links">
              <a href="mailto:b2b@expressclean.ua">b2b@expressclean.ua</a>
              <a className="site-nav__top-phone" href="tel:+380000000000">
                +380 00 000 00 00
              </a>
            </div>
            <div className="site-nav__top-links">
              <AppLink className="site-nav__top-cta" to={routes.consult}>
                Безкоштовний розрахунок
              </AppLink>
            </div>
          </div>
        </div>

        <div className="site-nav__main">
          <div className="container site-nav__main-inner">
            <Logo />

            <nav className="desktop-nav" aria-label="Головна навігація">
              {nav.map((item) => (
                <AppLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "is-active" : ""}`
                  }
                >
                  {item.label}
                </AppLink>
              ))}
            </nav>

            <div className="site-nav__actions">
              <AppLink className="header-cta" to={routes.consult}>
                Консультація
              </AppLink>
              <SearchButton />
            </div>

            <div className="site-nav__mobile">
              <BurgerButton
                open={open}
                onToggle={() => setOpen((value) => !value)}
                controlsId={menuId}
              />
            </div>
          </div>
        </div>
      </header>

      <div
        className={`nav-overlay ${open ? "is-open" : ""}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="nav-overlay__backdrop"
          tabIndex={open ? 0 : -1}
          aria-label="Закрити меню"
          onClick={close}
        />
        <div
          id={menuId}
          className="nav-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Меню"
        >
          <nav className="nav-panel__nav" aria-label="Мобільна навігація">
            {nav.map((item, index) => (
              <AppLink
                key={item.href}
                to={item.href}
                onClick={close}
                style={{ ["--i" as string]: index }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{item.label}</strong>
                </div>
                <ArrowIcon />
              </AppLink>
            ))}
          </nav>
          <AppLink className="nav-panel__offer" to={routes.consult} onClick={close}>
            <span>Сьогодні</span>
            <strong>Отримайте розрахунок під ваш об’єкт</strong>
            <em>Графік · обсяг · SLA</em>
          </AppLink>
          <div className="nav-panel__cats">
            <p className="nav-panel__label">Популярні категорії</p>
            <div className="nav-panel__cat-grid">
              {quickCategories.map((category) => (
                <AppLink
                  key={category.slug}
                  to={routes.category(category.slug)}
                  onClick={close}
                >
                  {category.title}
                </AppLink>
              ))}
            </div>
          </div>

          <div className="nav-panel__bottom">
            <AppLink className="button" to={routes.consult} onClick={close}>
              <span>Консультація</span>
              <ArrowIcon />
            </AppLink>
            <a
              className="nav-panel__phone"
              href="tel:+380000000000"
              onClick={close}
            >
              +380 00 000 00 00
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__top">
        <div>
          <Logo />
          <p>
            Системна хімчистка й прання для бізнесу. Від забору до повернення за
            погодженим SLA.
          </p>
        </div>
        <div className="footer__column">
          <strong>Послуги</strong>
          <AppLink to={routes.services}>Усі послуги</AppLink>
          <AppLink to={routes.category("domashniy-tekstil")}>
            Домашній текстиль
          </AppLink>
          <AppLink to={routes.category("verkhniy-odyag")}>Верхній одяг</AppLink>
        </div>
        <div className="footer__column">
          <strong>Компанія</strong>
          <AppLink to={routes.business}>Для бізнесу</AppLink>
          <AppLink to={routes.process}>Як працюємо</AppLink>
          <AppLink to={routes.faq}>Питання</AppLink>
          <AppLink to={routes.consult}>Консультація</AppLink>
        </div>
        <div className="footer__column">
          <strong>Контакти</strong>
          <a href="tel:+380000000000">+380 00 000 00 00</a>
          <a href="mailto:b2b@expressclean.ua">b2b@expressclean.ua</a>
          <span>Пн–Сб · за графіком</span>
        </div>
      </div>
      <div className="container footer__bottom" id="privacy">
        <span>© {new Date().getFullYear()} EXPRESS CLEAN</span>
        <AppLink to="/#privacy">Політика конфіденційності</AppLink>
        <AppLink to="/#privacy">Умови співпраці</AppLink>
        <span>Зроблено для системної чистоти</span>
      </div>
    </footer>
  )
}

export function ButtonLink({
  children,
  href,
  secondary = false,
}: {
  children: ReactNode
  href: string
  secondary?: boolean
}) {
  return (
    <AppLink
      className={`button ${secondary ? "button--secondary" : ""}`}
      to={href}
    >
      <span>{children}</span>
      <ArrowIcon />
    </AppLink>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string
  title: string
  text?: string
}) {
  return (
    <div className="section-heading">
      <span className="eyebrow">
        <i />
        {eyebrow}
      </span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  )
}

