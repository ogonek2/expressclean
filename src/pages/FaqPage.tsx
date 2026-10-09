import { useEffect } from "react"
import { Faq, LeadForm } from "../App"
import { faq } from "../content"
import { routes } from "../routes"
import { applySeo } from "../seo"

export default function FaqPage() {
  useEffect(() => {
    applySeo({
      title: "FAQ — питання про хімчистку для бізнесу | EXPRESS CLEAN",
      description:
        "Договір, формування ціни, мінімальний обсяг, облік виробів і фіксований графік забору — відповіді перед стартом співпраці.",
      path: routes.faq,
      jsonLd: {
        "@type": "FAQPage",
        mainEntity: faq.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    })
  }, [])

  return (
    <main id="top">
      <Faq />
      <LeadForm />
    </main>
  )
}
