# Student Tools

Fast, accurate, mobile-first calculators for students: attendance (and how many classes you can miss), SGPA/CGPA, GPA, CGPA ↔ percentage, CGPA → GPA, marks percentage, weighted grade, final grade needed, study time and exam countdown.

Built with Next.js 16 (static export), React 19, Tailwind v4 and TypeScript. No backend, no accounts; every calculation runs in the browser and results are shareable through the URL.

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # unit tests for every formula (Vitest)
pnpm e2e          # Playwright smoke tests against the static export (run `pnpm build` first)
pnpm check        # lint + typecheck + unit tests + build
```

## Configure

Copy `.env.example` to `.env.local`. `NEXT_PUBLIC_SITE_URL` is the canonical production origin and drives canonicals, sitemap, robots, Open Graph and JSON-LD. `NEXT_PUBLIC_BASE_PATH` is only for sub-path hosting such as GitHub project pages. Analytics and Search Console verification are optional and load nothing when empty.

## Structure

- `src/lib/calc/` – pure, tested calculation engines (`attendance`, `grades`, `gpa`, `study`)
- `src/lib/tools.ts` – registry of tool pages (titles, descriptions, related links, sitemap)
- `src/components/calculators/` – client components, one per tool
- `src/app/<tool>/page.tsx` – server-rendered page with explanatory content
- `docs/` – search research and the search-intent → page map
- `deploy/` – deployment notes, GitHub Pages workflow and branch-deploy script

## Deploy

See [deploy/README.md](deploy/README.md).
