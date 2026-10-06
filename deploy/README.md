# Deployment

The site is a static export (`pnpm build` → `out/`). It can be hosted anywhere static files are served.

## GitHub Pages (current)

Two options:

1. **GitHub Actions (preferred).** Copy `github-pages-workflow.yml` to `.github/workflows/deploy.yml` and push.
   Pushing workflow files needs a token with the `workflow` scope: run `gh auth refresh -s workflow` once.
   Set repository variables `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_BASE_PATH` (Settings → Secrets and variables → Actions → Variables).
2. **Manual branch deploy (no extra scope).** `pnpm deploy:pages` builds with the production env and pushes `out/` to the `gh-pages` branch, which Pages serves.

## Vercel

`vercel login`, then `vercel --prod`. Set `NEXT_PUBLIC_SITE_URL` to the production origin in the Vercel project settings; leave `NEXT_PUBLIC_BASE_PATH` empty. `vercel.json` adds security and cache headers.

## Custom domain

Set `NEXT_PUBLIC_SITE_URL=https://yourdomain.tld` and `NEXT_PUBLIC_BASE_PATH=` (empty), rebuild, and point DNS at the host. Canonicals, sitemap, robots, OG tags and JSON-LD all derive from these two variables.
