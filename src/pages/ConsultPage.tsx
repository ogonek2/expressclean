import { useEffect } from "react"
import { LeadForm } from "../App"
import { SectionHeading } from "../components/Layout"
import { routes } from "../routes"
import { applySeo } from "../seo"

export default function ConsultPage() {
  useEffect(() => {
    applySeo({
      title: "Консультація та розрахунок — EXPRESS CLEAN",
      description:
        "Залиште заявку на розрахунок хімчистки та прання для вашого об’єкта. Підготуємо графік, обсяг і комерційну пропозицію.",
      path: routes.consult,
      jsonLd: {
        "@type": "ContactPage",
        name: "Консультація EXPRESS CLEAN",
        url: routes.consult,
      },
    })
  }, [])

  return (
    <main id="top">
      <section className="section section--soft" style={{ paddingBottom: 0 }}>
        <div className="container">
          <SectionHeading
            eyebrow="Консультація"
            title="Розрахунок під ваш об’єкт"
            text="Опишіть місто, тип текстилю та орієнтовний обсяг — підготуємо пропозицію з графіком і SLA."
          />
        </div>
      </section>
      <LeadForm />
    </main>
  )
}
