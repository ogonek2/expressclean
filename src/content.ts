import catalog from "./data/catalog.json"

export type ServiceItem = {
  slug?: string
  name: string
  price: string
  price_individual?: string | null
  note?: string | null
  description?: string | null
}

export type ServiceCategory = {
  slug: string
  title: string
  count: number
  text: string
  icon_url?: string | null
  items: ServiceItem[]
}

export { nav } from "./routes"

export const serviceCategories: ServiceCategory[] = catalog.categories.map(
  (category) => ({
    slug: category.slug,
    title: category.title,
    count: category.services.length,
    text: category.description,
    icon_url: category.icon_url,
    items: category.services.map((service) => ({
      slug: service.slug,
      name: service.name,
      price: service.price,
      price_individual: service.price_individual,
      note: service.note,
      description: service.description,
    })),
  }),
)

export const allServices = serviceCategories.flatMap((category) =>
  category.items.map((item) => ({
    ...item,
    categorySlug: category.slug,
    categoryTitle: category.title,
  })),
)

export const segments = [
  [
    "Готелі",
    "Білизна, рушники, халати — графік синхронізований із завантаженням об’єкта.",
  ],
  ["HoReCa", "Текстиль залу й кухні, уніформа персоналу, регулярний забір."],
  [
    "Клініки",
    "Окремий потік для текстилю персоналу без необґрунтованих обіцянок стерилізації.",
  ],
  [
    "Офіси та рітейл",
    "Костюми, сорочки й формений одяг із маркуванням по співробітниках.",
  ],
] as const

export const process = [
  ["Заявка", "Фіксуємо тип текстилю, обсяг і графік."],
  ["Забір", "Приймаємо партію за актом на вашому об’єкті."],
  ["Маркування", "Ідентифікуємо вироби й розподіляємо потоки."],
  ["Обробка", "Підбираємо технологію відповідно до тканини."],
  ["Доставка", "Повертаємо партію в узгоджений день."],
] as const

export const faq = [
  [
    "Чи працюєте ви за договором?",
    "Так. У договорі фіксуємо графік, строки, логістику, порядок приймання та відповідальність сторін.",
  ],
  [
    "Як формується вартість?",
    "Розрахунок залежить від типу текстилю, обсягу партії, технології обробки та частоти забору. Після брифу готуємо індивідуальну КП.",
  ],
  [
    "Чи є мінімальний обсяг?",
    "Мінімальна партія залежить від напрямку й логістичної зони. Менеджер уточнить умови для вашого об’єкта.",
  ],
  [
    "Що відбувається зі складними плямами?",
    "Перед обробкою проводимо огляд і погоджуємо ризики. Не обіцяємо результат, який може пошкодити тканину.",
  ],
  [
    "Як не губляться речі?",
    "Кожну партію приймаємо за актом, а вироби маркуємо відповідно до погодженої схеми обліку.",
  ],
  [
    "Чи можна погодити фіксований графік?",
    "Так. Регулярність забору й доставки є частиною SLA та фіксується до старту співпраці.",
  ],
] as const
