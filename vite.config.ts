import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

/** Legacy .html URLs → SPA paths. */
function legacyRedirects(): Plugin {
  return {
    name: "express-legacy-redirects",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || req.method !== "GET") return next()
        const url = new URL(req.url, "http://localhost")

        if (url.pathname === "/poslugi.html") {
          res.statusCode = 301
          res.setHeader("Location", `/poslugi${url.search}`)
          res.end()
          return
        }

        if (url.pathname === "/kategoriya.html") {
          const slug = url.searchParams.get("slug")
          res.statusCode = 301
          res.setHeader(
            "Location",
            slug ? `/poslugi/${encodeURIComponent(slug)}` : "/poslugi",
          )
          res.end()
          return
        }

        next()
      })
    },
  }
}

const root = import.meta.dirname

export default defineConfig({
  appType: "spa",
  plugins: [react(), tailwindcss(), legacyRedirects()],
  resolve: {
    alias: {
      "@": path.resolve(root, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "5173"),
  },
  preview: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "5173"),
  },
})
