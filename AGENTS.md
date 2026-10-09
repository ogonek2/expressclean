# express-clean

React + Vite + Tailwind CSS project for EXPRESS CLEAN.

## Development Server

```bash
npm run dev
```

Default Vite port is 5173 (or `$PORT` if set).

## Project Structure

- `src/main.tsx` — React entrypoint; imports `src/index.css` and mounts `src/App.tsx`
- `src/App.tsx` — Primary application component
- `src/index.css` — Global CSS and Tailwind CSS v4 import
- `index.html` — Vite HTML shell
- `package.json` — Dependencies and scripts
- `vite.config.ts` — Vite config with React, Tailwind CSS v4, and `@` → `src` alias
- `.mise.toml` — Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

Use Tailwind utility classes directly in JSX. Put global CSS or Tailwind v4 theme customization in `src/index.css`. No separate Tailwind or PostCSS config file is required.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
