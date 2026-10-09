import { useEffect } from "react"
import { Business } from "../App"
import { routes } from "../routes"
import { applySeo } from "../seo"

export default function BusinessPage() {
  useEffect(() => {
    applySeo({
      title: "Хімчистка для бізнесу — готелі, HoReCa, клініки | EXPRESS CLEAN",
      description:
        "Сервіс прання та хімчистки під операційну модель об’єкта: графік, маркування, документи та SLA для готелів, ресторанів, клінік і офісів.",
      path: routes.business,
      jsonLd: {
        "@type": "Service",
        name: "Хімчистка та прання для бізнесу",
        provider: { "@type": "Organization", name: "EXPRESS CLEAN" },
        areaServed: "UA",
        url: routes.business,
      },
    })
  }, [])

  return (
    <main id="top">
      <Business />
    </main>
  )
}
