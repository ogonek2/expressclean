/**
 * Replaces categories/services in Directus with enot-24 catalog.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const BASE = process.env.DIRECTUS_URL || "http://localhost:8055"
const EMAIL = process.env.ADMIN_EMAIL || "admin@expressclean.ua"
const PASSWORD = process.env.ADMIN_PASSWORD || "ExpressClean!2026"

const catalog = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../data/enot-catalog.json"),
    "utf8",
  ),
)

async function req(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(
      `${method} ${path} → ${res.status}: ${data?.errors?.[0]?.message || JSON.stringify(data)}`,
    )
  }
  return data
}

async function ensureField(token, collection, field) {
  try {
    await req(`/fields/${collection}/${field.field}`, { token })
  } catch {
    await req(`/fields/${collection}`, { method: "POST", token, body: field })
    console.log(`+ field ${collection}.${field.field}`)
  }
}

async function main() {
  const login = await req("/auth/login", {
    method: "POST",
    body: { email: EMAIL, password: PASSWORD },
  })
  const token = login.data.access_token
  console.log("Logged in")

  await ensureField(token, "services", {
    field: "slug",
    type: "string",
    meta: { interface: "input", width: "half" },
    schema: { is_nullable: true },
  })
  await ensureField(token, "services", {
    field: "price_individual",
    type: "string",
    meta: { interface: "input", width: "half", note: "Індивідуальна ціна" },
    schema: { is_nullable: true },
  })
  await ensureField(token, "services", {
    field: "description",
    type: "text",
    meta: { interface: "input-multiline" },
    schema: {},
  })
  await ensureField(token, "categories", {
    field: "icon_url",
    type: "string",
    meta: { interface: "input", note: "URL іконки" },
    schema: { is_nullable: true },
  })

  // Delete existing services then categories
  const existingServices = await req("/items/services?limit=-1&fields=id", { token })
  for (const row of existingServices.data || []) {
    await req(`/items/services/${row.id}`, { method: "DELETE", token })
  }
  console.log(`deleted services: ${existingServices.data?.length || 0}`)

  const existingCats = await req("/items/categories?limit=-1&fields=id", { token })
  for (const row of existingCats.data || []) {
    await req(`/items/categories/${row.id}`, { method: "DELETE", token })
  }
  console.log(`deleted categories: ${existingCats.data?.length || 0}`)

  for (const cat of catalog.categories) {
    const created = await req("/items/categories", {
      method: "POST",
      token,
      body: {
        status: "published",
        sort: cat.sort,
        slug: cat.slug,
        title: cat.title,
        description: cat.description,
        icon_url: cat.icon_url,
      },
    })
    const categoryId = created.data.id
    const batch = cat.services.map((s) => ({
      status: "published",
      sort: s.sort,
      category: categoryId,
      slug: s.slug,
      name: s.name,
      price: s.price,
      price_individual: s.price_individual,
      note: s.note,
      description: s.description,
    }))

    // create in chunks
    const chunk = 50
    for (let i = 0; i < batch.length; i += chunk) {
      await req("/items/services", {
        method: "POST",
        token,
        body: batch.slice(i, i + chunk),
      })
    }
    console.log(`+ ${cat.slug}: ${batch.length} services`)
  }

  console.log("Import complete", catalog.totals)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
