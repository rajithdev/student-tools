# Launch report – Student Tools (7 October 2026)

## 1. Production URL
https://rajithdev.github.io/student-tools/ (GitHub Pages, interim host; see §11 for moving to Vercel or a custom domain).

## 2. Git
Repository: https://github.com/rajithdev/student-tools · branch `main` (source) · branch `gh-pages` (built output). No PR; direct commits to `main`.

## 3. Tools launched (11 pages, consolidated from the 13 requested intents)
| Page | Covers |
|---|---|
| /attendance-calculator/ | attendance %, can-miss, need-to-attend, projections, threshold ladder, ready-reckoner |
| /how-many-classes-can-i-miss/ | same engine, question-led, remaining-classes feasibility (classes-to-attend + classes-I-can-miss intents) |
| /cgpa-calculator/ | subjects → SGPA, semesters → CGPA (credit-weighted), VTU scale |
| /gpa-calculator/ | semester + cumulative GPA, 4.0/4.3, honors/AP weighting, target planner |
| /cgpa-to-percentage/ | both directions, 8 labelled formulas + custom, comparison table (CGPA→% and %→CGPA intents) |
| /cgpa-to-gpa/ | 10-point → 4.0 estimate, band table, WES caveats |
| /marks-percentage-calculator/ | total or subject-wise, best-of-5, reverse marks-needed (marks % + exam score intents) |
| /grade-calculator/ | weighted grade + single test score, 4 scales |
| /final-grade-calculator/ | score needed on final, percent or points (marks-needed intent) |
| /study-time-calculator/ | hours/day, feasibility, Pomodoro, day-by-day schedule |
| /exam-countdown/ | live countdown, study days after rest days, saved exams, .ics export |
Plus About, Contact, Privacy, Terms, custom 404.

## 4. SEO work completed
Search-intent research across 3 clusters (docs/research-*.md) and a consolidation map (docs/content-map.md). Per page: unique title ≤ 60 chars, description ≤ 160 chars, one H1, canonical, OG/Twitter tags with image, breadcrumb nav, semantic headings matching question-style queries, formula blocks, worked examples, common-mistakes and FAQ sections written from scratch. Site-wide: robots.txt, XML sitemap, web manifest, icons, crawlable header/footer navigation, contextual related-tool links, 404 with real 404 status, trailing-slash canonicalisation with 301. JSON-LD: Organization + WebSite (home), BreadcrumbList + WebPage + WebApplication (tool pages). FAQPage/HowTo deliberately not used (no longer rendered by Google). Verified in Google's Rich Results Test: crawled OK, Breadcrumbs valid, Software App valid.

## 5. Performance (Lighthouse 12, simulated slow-4G mobile, live URL)
| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| /attendance-calculator/ | 100 | 100 | 100 | 100 | 1.3 s | 0 | 0 ms |
| / | 100 | 100 | 100 | 100 | 1.9 s | 0 | 10 ms |
| /attendance-calculator/ desktop | 95 | – | – | – | 1.3 s | 0 | – |
Payload: one self-hosted variable font (41 KB), no third-party scripts, no images above the fold. Real-user INP will be reported by Search Console/CrUX once traffic exists.

## 6. Search Console
Not connected: requires your Google account. Steps: add property `https://rajithdev.github.io/student-tools/` (URL-prefix) in https://search.google.com/search-console, choose HTML-tag verification, put the token in the `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` repo variable (or `.env`), redeploy, verify, then submit `sitemap.xml`.

## 7. Analytics
Wired but dormant. Set one of `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, or `NEXT_PUBLIC_UMAMI_*` and redeploy. Events already emitted: `calculator_use` (tool + coarse status, never the numbers typed), `share` (method). Recommendation: GA4 with IP anonymisation (links to Search Console and AdSense, loaded lazily), or Plausible if you prefer cookieless.

## 8. Sitemap
https://rajithdev.github.io/student-tools/sitemap.xml – 16 URLs, served as application/xml, referenced from robots.txt.

## 9. robots.txt
https://rajithdev.github.io/student-tools/robots.txt – allows all, lists sitemap. (Builds without `NEXT_PUBLIC_SITE_URL` emit `Disallow: /` and `noindex` as a safety net.)

## 10. Indexing
Not yet indexed; Google has not been asked to crawl. Rich Results Test confirmed the page is crawlable and renders. Indexing will begin after Search Console verification and sitemap submission.

## 11. Actions that need you
1. **Search Console**: sign in with your Google account and verify (see §6).
2. **Analytics**: create a GA4 property (or Plausible site) and set the env variable.
3. **Vercel** (optional, recommended for a custom domain): run `vercel login`, then `vercel --prod`; set `NEXT_PUBLIC_SITE_URL` in the project, leave `NEXT_PUBLIC_BASE_PATH` empty.
4. **GitHub Actions deploy** (optional): run `gh auth refresh -s workflow`, then move `deploy/github-pages-workflow.yml` to `.github/workflows/deploy.yml`.
5. **Domain**: the folder name suggests studenttools.in; RDAP shows it is registered. If it is yours, point it at the host and set `NEXT_PUBLIC_SITE_URL=https://studenttools.in`. If not, unregistered as of today: classcalc.in, studentcalc.in, bunkcalc.in, gradekit.in, studenttools.app, bunkcalc.com. Brand suggestion: a memorable name over an exact-match one (e.g. "ClassCalc", "GradeKit").
6. **AdSense**: apply only after Search Console shows steady traffic (typically after 4–8 weeks). Ad slots are reserved (`data-ad-slot="below-calculator"` and `"sidebar"`), outside the calculator and result areas.

## 12. Next 10 highest-value SEO improvements
1. Verify Search Console, submit the sitemap, request indexing for the two attendance pages.
2. Move to a root domain (sub-path hosting dilutes signals and makes a later migration costlier).
3. Add an informational guide: "75% attendance rule in India: condonation, medical leave, what happens below 75%", linking to both attendance tools.
4. University-specific CGPA-to-percentage pages (VTU 2018 vs 2021, Anna, Mumbai, CBSE) only with real regulation excerpts and scheme-year selectors.
5. Author byline + short "how we verify formulas" page (E-E-A-T), referenced via `author` in WebPage JSON-LD.
6. Per-tool OG images with the tool name (currently one shared image).
7. Hindi copy for the attendance tools ("bunk calculator", "attendance kaise nikale") as a proper `hi` locale with hreflang.
8. Embeddable attendance widget (`<iframe>` snippet) for college club sites and student blogs.
9. Collect CrUX/INP data after launch and tune any interaction over 200 ms (row-heavy calculators are the candidates).
10. Add `cgpa-to-percentage` long-tail answers ("8.2 CGPA in percentage") as an in-page lookup table rather than new URLs.

## 13. Keywords / intents targeted first
attendance calculator · attendance percentage calculator · 75 attendance calculator · how many classes can I miss (with 75 attendance) · classes needed for 75 attendance · bunk calculator · CGPA calculator · SGPA to CGPA · CGPA to percentage (+ VTU/Anna/Mumbai/CBSE modifiers) · percentage to CGPA · GPA calculator · marks percentage calculator · final grade calculator / what do I need on my final · grade calculator · study time calculator · exam countdown.

## 14. 30/60/90-day organic growth plan
**Days 1–30 (foundation).** Search Console + analytics live; sitemap submitted; root domain decided and set; fix any coverage errors; publish the 75%-rule guide; share the attendance tool in 5–10 student communities (college subreddits, Discord servers, WhatsApp/Telegram study groups) with a plain, non-promotional post; ask two college tech clubs to link it from their resources page.
**Days 31–60 (expand).** Review Search Console queries; add H2/FAQ answers for queries with impressions but low CTR; ship university-specific converter pages where impressions show demand; add per-tool OG images and the embeddable widget; reach out to 10 educational blogs/YouTubers who cover attendance or CGPA with the comparison-table angle ("your college's formula differs").
**Days 61–90 (compound).** Hindi attendance pages if India dominates traffic; publish "how many days can I miss in a semester" and "does attendance affect internal marks" guides; measure CWV from CrUX; apply for AdSense once traffic is steady; start a lightweight changelog so returning students see the tools are maintained.

## Link-earning plan (legitimate)
Make the tools reference-worthy: shareable result URLs (done), comparison table of CGPA formulas (done), ready-reckoner tables (done), embed widget (next). Outreach targets: college placement cells and student councils (resource pages), engineering college subreddits and Discords, education bloggers who write "how to calculate CGPA" posts (offer the formula-confidence table as a correction), Product Hunt/Peerlist-style launches for "bunk calculator", open-source listing of the calculation library.
