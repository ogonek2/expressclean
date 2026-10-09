/**
 * Creates EXPRESS CLEAN content model in Directus:
 * categories, services, news + public read permissions + seed data.
 */
const BASE = process.env.DIRECTUS_URL || "http://localhost:8055"
const EMAIL = process.env.ADMIN_EMAIL || "admin@expressclean.ua"
const PASSWORD = process.env.ADMIN_PASSWORD || "ExpressClean!2026"

async function req(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    const msg = data?.errors?.[0]?.message || data?.message || text || res.statusText
    const err = new Error(`${method} ${path} → ${res.status}: ${msg}`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

async function login() {
  const data = await req("/auth/login", {
    method: "POST",
    body: { email: EMAIL, password: PASSWORD },
  })
  return data.data.access_token
}

async function ensureCollection(token, collection, meta = {}) {
  try {
    await req(`/collections/${collection}`, { token })
    console.log(`• collection exists: ${collection}`)
    return false
  } catch (e) {
    if (e.status !== 403 && e.status !== 404) throw e
  }
  await req("/collections", {
    method: "POST",
    token,
    body: {
      collection,
      meta: {
        icon: meta.icon || "box",
        note: meta.note || null,
        display_template: meta.display_template || null,
        singleton: Boolean(meta.singleton),
        sort_field: meta.sort_field || "sort",
        accountability: "all",
        ...meta,
      },
      schema: {},
      fields: [
        {
          field: "id",
          type: "integer",
          meta: { hidden: true, readonly: true, interface: "input", special: ["auto-increment"] },
          schema: { is_primary_key: true, has_auto_increment: true },
        },
      ],
    },
  })
  console.log(`+ collection created: ${collection}`)
  return true
}

async function ensureField(token, collection, field) {
  try {
    await req(`/fields/${collection}/${field.field}`, { token })
    console.log(`  · field exists: ${collection}.${field.field}`)
    return
  } catch (e) {
    if (e.status !== 403 && e.status !== 404) throw e
  }
  await req(`/fields/${collection}`, {
    method: "POST",
    token,
    body: field,
  })
  console.log(`  + field: ${collection}.${field.field}`)
}

async function ensureRelation(token, relation) {
  const existing = await req(
    `/relations?filter[collection][_eq]=${relation.collection}&filter[field][_eq]=${relation.field}`,
    { token },
  )
  if (existing.data?.length) {
    console.log(`  · relation exists: ${relation.collection}.${relation.field}`)
    return
  }
  await req("/relations", { method: "POST", token, body: relation })
  console.log(`  + relation: ${relation.collection}.${relation.field}`)
}

async function getPublicPolicyId(token) {
  const policies = await req("/policies?limit=-1", { token })
  const publicPolicy = policies.data.find(
    (p) => p.name === "Public" || p.id === "abf8a154-5b1c-4a46-ac9c-7300570f4f17",
  )
  if (publicPolicy) return publicPolicy.id

  // Directus 12 may use roles with policies — find role Public and its policies
  const roles = await req("/roles?limit=-1", { token })
  const publicRole = roles.data.find((r) => r.name === "Public" || r.id === "c86fc90b-3f93-4f8a-a8d0-0a0c0c0c0c0c")
  if (publicRole?.policies?.[0]) return publicRole.policies[0]

  // Create a dedicated public read policy if missing
  const created = await req("/policies", {
    method: "POST",
    token,
    body: {
      name: "Public Content Read",
      icon: "public",
      description: "Anonymous read access for website content",
      app_access: false,
      admin_access: false,
    },
  })
  return created.data.id
}

async function ensurePublicRead(token, policyId, collection, fields = ["*"]) {
  const perms = await req(
    `/permissions?filter[policy][_eq]=${policyId}&filter[collection][_eq]=${collection}&filter[action][_eq]=read`,
    { token },
  )
  if (perms.data?.length) {
    console.log(`  · public read exists: ${collection}`)
    return
  }
  // Directus Community: avoid custom permission rule filters (commercial feature).
  // Public gets full read; drafts are filtered on the frontend / API query.
  await req("/permissions", {
    method: "POST",
    token,
    body: {
      policy: policyId,
      collection,
      action: "read",
      fields,
      permissions: {},
      validation: {},
    },
  })
  console.log(`  + public read: ${collection}`)
}

async function seedIfEmpty(token, collection, items) {
  const existing = await req(`/items/${collection}?limit=1`, { token })
  if (existing.data?.length) {
    console.log(`• seed skipped (has data): ${collection}`)
    return
  }
  await req(`/items/${collection}`, { method: "POST", token, body: items })
  console.log(`+ seeded ${items.length} items → ${collection}`)
}

const categories = [
  {
    status: "published",
    sort: 1,
    slug: "odyag-ta-uniforma",
    title: "Одяг та уніформа",
    description:
      "Костюми, сорочки, формений і корпоративний одяг з персональним маркуванням.",
  },
  {
    status: "published",
    sort: 2,
    slug: "gotelnyy-tekstyl",
    title: "Готельний текстиль",
    description:
      "Постіль, рушники та халати. Партійна обробка за погодженим графіком.",
  },
  {
    status: "published",
    sort: 3,
    slug: "restorannyy-tekstyl",
    title: "Ресторанний текстиль",
    description:
      "Скатертини, серветки, текстиль кухні та уніформа команди закладу.",
  },
  {
    status: "published",
    sort: 4,
    slug: "shtory-ta-interyer",
    title: "Штори та інтер’єр",
    description:
      "Штори, тюль, чохли та декоративний текстиль з обережною обробкою.",
  },
  {
    status: "published",
    sort: 5,
    slug: "kylymy",
    title: "Килими та доріжки",
    description:
      "Прання килимів і текстильних покриттів із сушінням і поверненням на об’єкт.",
  },
  {
    status: "published",
    sort: 6,
    slug: "specodyag",
    title: "Спецодяг",
    description:
      "Робочий і захисний одяг для виробництв, складів і сервісних команд.",
  },
  {
    status: "published",
    sort: 7,
    slug: "shkira-ta-khutro",
    title: "Шкіра та хутро",
    description:
      "Делікатна хімчистка виробів зі шкіри, замші та хутра для бізнесу й персоналу.",
  },
  {
    status: "published",
    sort: 8,
    slug: "logistyka",
    title: "Забір і доставка",
    description:
      "Регулярна логістика, облік партій і повернення на ваш об’єкт у визначений день.",
  },
]

const servicesBySlug = {
  "odyag-ta-uniforma": [
    ["Костюм класичний (2 од.)", "від 420 ₴"],
    ["Піджак / жакет", "від 280 ₴"],
    ["Сорочка / блуза", "від 95 ₴"],
    ["Формений комплект", "від 190 ₴"],
    ["Халат робочий", "від 120 ₴"],
    ["Фартух / кітель", "від 85 ₴"],
  ],
  "gotelnyy-tekstyl": [
    ["Комплект постільної білизни", "від 160 ₴"],
    ["Простирадло", "від 55 ₴"],
    ["Підковдра", "від 70 ₴"],
    ["Рушник банний", "від 45 ₴"],
    ["Халат готельний", "від 140 ₴"],
    ["Наволочка", "від 35 ₴"],
  ],
  "restorannyy-tekstyl": [
    ["Скатертина", "від 90 ₴"],
    ["Серветка тканинна", "від 25 ₴"],
    ["Раннер / доріжка", "від 60 ₴"],
    ["Фартух офіціанта", "від 80 ₴"],
    ["Куртка кухаря", "від 150 ₴"],
    ["Рушник кухонний", "від 30 ₴"],
  ],
  "shtory-ta-interyer": [
    ["Штори (м²)", "від 120 ₴"],
    ["Тюль (м²)", "від 80 ₴"],
    ["Римська штора", "від 180 ₴"],
    ["Чохол на меблі", "від 220 ₴"],
    ["Декоративна подушка", "від 70 ₴"],
    ["Плед / покривало", "від 150 ₴"],
  ],
  kylymy: [
    ["Килим синтетичний (м²)", "від 95 ₴"],
    ["Килим вовняний (м²)", "від 140 ₴"],
    ["Доріжка (м.п.)", "від 110 ₴"],
    ["Килимок придверний", "від 180 ₴"],
    ["Ковролін (м²)", "від 85 ₴", "за домовленістю"],
    ["Виїзд на об’єкт", "за графіком"],
  ],
  specodyag: [
    ["Комбінезон", "від 160 ₴"],
    ["Куртка робоча", "від 130 ₴"],
    ["Штани робочі", "від 95 ₴"],
    ["Жилет сигнальний", "від 70 ₴"],
    ["Футболка / поло брендовані", "від 60 ₴"],
    ["Зимовий комплект", "від 240 ₴"],
  ],
  "shkira-ta-khutro": [
    ["Куртка шкіряна", "від 650 ₴"],
    ["Пальто / дублянка", "від 890 ₴"],
    ["Жилет хутряний", "від 720 ₴"],
    ["Спідниця шкіряна", "від 380 ₴"],
    ["Рукавички шкіряні", "від 180 ₴"],
    ["Індивідуальна оцінка", "після огляду"],
  ],
  logistyka: [
    ["Разовий забір", "за маршрутом"],
    ["Регулярний графік", "у договорі"],
    ["Експрес-логістика", "за наявності"],
    ["Акт приймання партії", "включено"],
    ["Маркування виробів", "за схемою"],
    ["Повернення на об’єкт", "у день SLA"],
  ],
}

async function main() {
  console.log(`Connecting to ${BASE} as ${EMAIL}`)
  const token = await login()
  console.log("Logged in")

  await ensureCollection(token, "categories", {
    icon: "category",
    note: "Категорії послуг сайту",
    display_template: "{{title}}",
    sort_field: "sort",
  })
  for (const field of [
    {
      field: "status",
      type: "string",
      meta: {
        interface: "select-dropdown",
        options: {
          choices: [
            { text: "Draft", value: "draft" },
            { text: "Published", value: "published" },
          ],
        },
        display: "labels",
        width: "half",
      },
      schema: { default_value: "draft", is_nullable: false },
    },
    {
      field: "sort",
      type: "integer",
      meta: { interface: "input", hidden: true },
      schema: { is_nullable: true },
    },
    {
      field: "slug",
      type: "string",
      meta: { interface: "input", required: true, width: "half", note: "URL-ключ" },
      schema: { is_unique: true, is_nullable: false },
    },
    {
      field: "title",
      type: "string",
      meta: { interface: "input", required: true, width: "half" },
      schema: { is_nullable: false },
    },
    {
      field: "description",
      type: "text",
      meta: { interface: "input-multiline" },
      schema: {},
    },
  ]) {
    await ensureField(token, "categories", field)
  }

  await ensureCollection(token, "services", {
    icon: "local_laundry_service",
    note: "Послуги та орієнтовні ціни",
    display_template: "{{name}} — {{price}}",
    sort_field: "sort",
  })
  for (const field of [
    {
      field: "status",
      type: "string",
      meta: {
        interface: "select-dropdown",
        options: {
          choices: [
            { text: "Draft", value: "draft" },
            { text: "Published", value: "published" },
          ],
        },
        width: "half",
      },
      schema: { default_value: "draft", is_nullable: false },
    },
    {
      field: "sort",
      type: "integer",
      meta: { interface: "input", hidden: true },
      schema: {},
    },
    {
      field: "category",
      type: "integer",
      meta: {
        interface: "select-dropdown-m2o",
        special: ["m2o"],
        required: true,
        width: "half",
        options: { template: "{{title}}" },
      },
      schema: { is_nullable: false },
    },
    {
      field: "name",
      type: "string",
      meta: { interface: "input", required: true, width: "half" },
      schema: { is_nullable: false },
    },
    {
      field: "price",
      type: "string",
      meta: { interface: "input", required: true, width: "half", note: "напр. від 420 ₴" },
      schema: { is_nullable: false },
    },
    {
      field: "note",
      type: "string",
      meta: { interface: "input", width: "half" },
      schema: {},
    },
  ]) {
    await ensureField(token, "services", field)
  }
  await ensureRelation(token, {
    collection: "services",
    field: "category",
    related_collection: "categories",
    meta: { sort_field: null },
    schema: { on_delete: "SET NULL" },
  })

  await ensureCollection(token, "news", {
    icon: "newspaper",
    note: "Новини та статті",
    display_template: "{{title}}",
    sort_field: "sort",
  })
  for (const field of [
    {
      field: "status",
      type: "string",
      meta: {
        interface: "select-dropdown",
        options: {
          choices: [
            { text: "Draft", value: "draft" },
            { text: "Published", value: "published" },
          ],
        },
        width: "half",
      },
      schema: { default_value: "draft", is_nullable: false },
    },
    {
      field: "sort",
      type: "integer",
      meta: { interface: "input", hidden: true },
      schema: {},
    },
    {
      field: "slug",
      type: "string",
      meta: { interface: "input", required: true, width: "half" },
      schema: { is_unique: true, is_nullable: false },
    },
    {
      field: "title",
      type: "string",
      meta: { interface: "input", required: true },
      schema: { is_nullable: false },
    },
    {
      field: "excerpt",
      type: "text",
      meta: { interface: "input-multiline" },
      schema: {},
    },
    {
      field: "body",
      type: "text",
      meta: { interface: "input-rich-text-html" },
      schema: {},
    },
    {
      field: "published_at",
      type: "timestamp",
      meta: { interface: "datetime", width: "half" },
      schema: {},
    },
  ]) {
    await ensureField(token, "news", field)
  }

  // Public access: Directus 11+ uses policies. Attach read perms to Public role/policy.
  let policyId = null
  try {
    policyId = await getPublicPolicyId(token)
    console.log(`Public policy: ${policyId}`)
  } catch (e) {
    console.warn("Could not resolve public policy:", e.message)
  }

  if (policyId) {
    // Attach policy to Public role if needed
    try {
      const roles = await req("/roles?limit=-1", { token })
      const publicRole = roles.data.find((r) => r.name === "Public")
      if (publicRole) {
        await req(`/roles/${publicRole.id}`, {
          method: "PATCH",
          token,
          body: { policies: [policyId] },
        }).catch(() => {})
      }
    } catch {
      /* ignore */
    }

    for (const collection of ["categories", "services", "news"]) {
      await ensurePublicRead(token, policyId, collection)
    }
  }

  await seedIfEmpty(token, "categories", categories)

  const cats = await req("/items/categories?limit=-1&fields=id,slug", { token })
  const bySlug = Object.fromEntries(cats.data.map((c) => [c.slug, c.id]))

  const serviceItems = []
  for (const [slug, rows] of Object.entries(servicesBySlug)) {
    const categoryId = bySlug[slug]
    if (!categoryId) continue
    rows.forEach((row, index) => {
      serviceItems.push({
        status: "published",
        sort: index + 1,
        category: categoryId,
        name: row[0],
        price: row[1],
        note: row[2] || null,
      })
    })
  }
  await seedIfEmpty(token, "services", serviceItems)

  await seedIfEmpty(token, "news", [
    {
      status: "published",
      sort: 1,
      slug: "zapusk-b2b-servisu",
      title: "Запуск B2B-сервісу EXPRESS CLEAN",
      excerpt:
        "Системна хімчистка й прання для готелів, HoReCa та офісів із фіксованим SLA.",
      body: "<p>Ми відкриваємо напрям корпоративного сервісу: графік забору, маркування партій і договірні строки повернення.</p>",
      published_at: new Date().toISOString(),
    },
    {
      status: "published",
      sort: 2,
      slug: "yak-pratsuye-oblik-partiy",
      title: "Як працює облік партій",
      excerpt: "Акт приймання, маркування виробів і контроль на кожному етапі.",
      body: "<p>Кожна партія фіксується в акті. Вироби маркуються за погодженою схемою, щоб нічого не губилося між об’єктом і цехом.</p>",
      published_at: new Date().toISOString(),
    },
  ])

  // Create static token for frontend (optional convenience)
  try {
    const me = await req("/users/me", { token })
    const userId = me.data.id
    await req(`/users/${userId}`, {
      method: "PATCH",
      token,
      body: { token: "expressclean-public-read-token" },
    })
    console.log("+ admin static token set: expressclean-public-read-token")
  } catch (e) {
    console.warn("Static token:", e.message)
  }

  console.log("\nSchema ready.")
  console.log(`Admin UI: ${BASE}`)
  console.log(`Login: ${EMAIL}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
