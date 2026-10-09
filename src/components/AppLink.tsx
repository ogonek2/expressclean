import { CSSProperties, ReactNode } from "react"
import { Link, NavLink } from "react-router-dom"

function isExternal(to: string) {
  return /^(https?:|mailto:|tel:)/i.test(to) || to.startsWith("//")
}

/** Client-side navigation for internal routes; plain <a> for external/hash-only. */
export function AppLink({
  to,
  href,
  children,
  className,
  onClick,
  title,
  style,
  "aria-label": ariaLabel,
  end,
}: {
  to?: string
  href?: string
  children: ReactNode
  className?: string | ((args: { isActive: boolean }) => string)
  onClick?: () => void
  title?: string
  style?: CSSProperties
  "aria-label"?: string
  end?: boolean
}) {
  const target = to || href || "/"

  if (isExternal(target) || target.startsWith("#")) {
    return (
      <a
        href={target}
        className={
          typeof className === "function"
            ? className({ isActive: false })
            : className
        }
        onClick={onClick}
        title={title}
        style={style}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    )
  }

  if (typeof className === "function") {
    return (
      <NavLink
        to={target}
        end={end}
        className={({ isActive }) => className({ isActive })}
        onClick={onClick}
        title={title}
        style={style}
        aria-label={ariaLabel}
      >
        {children}
      </NavLink>
    )
  }

  return (
    <Link
      to={target}
      className={className}
      onClick={onClick}
      title={title}
      style={style}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  )
}
