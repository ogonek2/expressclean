const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
}

const home = await fetch("https://enot-24.com.ua/", { headers })
const html = await home.text()
console.log("home length", html.length)
console.log(html.slice(0, 2500))

const scripts = [...html.matchAll(/src=["']([^"']+)["']/g)].map((m) => m[1])
console.log("scripts", scripts)

for (const src of scripts.slice(0, 15)) {
  const url = src.startsWith("http") ? src : new URL(src, "https://enot-24.com.ua/").href
  try {
    const res = await fetch(url, { headers })
    const body = await res.text()
    console.log("\nSCRIPT", url, body.length)
    const apiHits = [
      ...body.matchAll(/https?:\\\/\\\/[^"'\\s]+/g),
      ...body.matchAll(/["'`](\/api\/[^"'`]+)["'`]/g),
      ...body.matchAll(/["'`](https?:\/\/[^"'`]*api[^"'`]*)["'`]/g),
      ...body.matchAll(/strapi|supabase|directus|graphql|poslug|categor/gi),
    ]
    console.log(
      "hits sample",
      [...new Set(apiHits.map((m) => m[0] || m[1]).filter(Boolean))].slice(0, 40),
    )
  } catch (e) {
    console.log("fail", url, e.message)
  }
}
