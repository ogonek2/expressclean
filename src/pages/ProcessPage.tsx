import { useEffect } from "react"
import { Process, Sla } from "../App"
import { routes } from "../routes"
import { applySeo } from "../seo"

export default function ProcessPage() {
  useEffect(() => {
    applySeo({
      title: "Як працюємо — процес і SLA | EXPRESS CLEAN",
      description:
        "П’ять контрольованих кроків: заявка, забір, маркування, обробка, доставка. Строки та відповідальність фіксуємо в договорі.",
      path: routes.process,
      jsonLd: {
        "@type": "HowTo",
        name: "Як працює EXPRESS CLEAN",
        description:
          "Заявка, забір, маркування, обробка та повернення текстилю за погодженим графіком.",
        step: [
          { "@type": "HowToStep", name: "Заявка" },
          { "@type": "HowToStep", name: "Забір" },
          { "@type": "HowToStep", name: "Маркування" },
          { "@type": "HowToStep", name: "Обробка" },
          { "@type": "HowToStep", name: "Доставка" },
        ],
      },
    })
  }, [])

  return (
    <main id="top">
      <Process />
      <Sla />
    </main>
  )
}
