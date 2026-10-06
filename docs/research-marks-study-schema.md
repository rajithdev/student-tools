# SEO Research: Marks/Grades + Study-Planning Clusters, and Schema Guidance (Oct 2026)

Pages examined (fetched, with HTML inspected for `ld+json`): rogerhub.com/final, calculator.net/grade-calculator.html, omnicalculator.com/other/final-grade, gigacalculator.com/calculators/marks-percentage-calculator.php, inchcalculator.com/marks-percentage-calculator/, pearson.com/channels/calculators/final-grade-calculator, pearson.com/channels/calculators/study-schedule-calculator, clock7.com/exam-countdown/. Google docs: software-app, faqpage, breadcrumb, site-names, search-gallery, 2023/08 howto-faq-changes blog.

---

## 1. Search intent map and consolidation

### Cluster A: Marks and grades — three distinct intents, not one

| Intent group | Queries | Verdict |
|---|---|---|
| **A1. Marks -> percentage** (India/UK/Asia boards; "obtained / total x 100") | marks percentage calculator, percentage calculator for marks, marks to percentage, percentage of marks out of 500 / 600, how to calculate percentage of marks of 6 subjects | **One page.** SERP is dominated by Indian school/edu sites (EuroSchool, Orchids, Oswal, Vedantu, Careers360) plus inchcalculator/gigacalculator. US-style "grade" pages do not rank here. |
| **A2. Weighted current grade** (US/Canada letter grades, category weights) | grade calculator, weighted grade calculator, test score calculator, exam score calculator (partial) | **One page.** calculator.net ranks with a weighted table + letter grades; "test grade calculator" (Pearson/Omni) is a points-to-letter converter that sits between A1 and A2. |
| **A3. Required score on final** | final grade calculator, what do I need on my final, marks needed calculator, grade needed to pass | **One page.** Very strong, stable intent (RogerHub has owned it for a decade). Same formula every page: `(target - current x (1 - w)) / w`. |

Decisions:
- "final grade calculator" != "grade calculator". calculator.net puts both on one URL, but every other top result (RogerHub, Omni, Giga, Pearson, RemNote) uses a dedicated final-grade page, and the query phrasing ("what do I need") is a goal-seeking intent. Keep separate.
- "marks needed calculator" and "what do I need on my final" = A3; do not build a separate page. Handle "marks needed to pass" (pass mark 33%/35%/40% Indian context) as a mode inside A3 or A1, not a new URL.
- "exam score calculator" / "test score calculator" = mostly A2-lite (points scored -> percent + letter). Fold into the grade calculator as a "single test" tab; add a "points -> percent -> letter" table. Do not build a fourth page; that is the main cannibalization risk with A1.
- Cannibalization risks to watch: (a) marks-percentage vs test-score (both are score/total x 100): differentiate by audience and vocabulary (marks/subjects/boards vs points/letter grade/GPA); (b) grade vs final-grade: never put a "what do I need on my final" mode on the grade page; (c) "percentage of marks out of 500/600" long-tails: do NOT spin separate pages per total; satisfy with on-page preset buttons (500/600/700/1000) and a lookup table on the marks page.

### Cluster B: Study planning — two intents

| Intent | Queries | Verdict |
|---|---|---|
| **B1. Study hours / plan** | study time calculator, study hours calculator, study planner calculator, how many hours a day should I study, pomodoro study calculator | One page; pomodoro as a mode. SERP is thin/low-authority (Pearson, elysiatools, hacecuentas, RemNote, blogs). Very winnable. |
| **B2. Exam countdown** | exam countdown, days until exam, exam countdown timer, how many days until my exam | Web SERP mixed: App Store/Play listings dominate "exam countdown" (Exam Countdown app, Chrome extension), but "days until my exam"/"exam countdown timer" return web tools (clock7, RemNote). See section 7. |

---

## 2. What the ranking pages do well / poorly

**RogerHub (A3 leader)**: six modes (basic, post-exam, test-category, multi-part final, point system, dropped grades); collapsible FAQ; minimal prose; AdSense present. Weak: dated design, no letter grade output, no "share result", no schema at all.

**calculator.net (A2 leader)**: three tools on one URL (weighted grade, final-grade planning, final grade), letter/GPA table, add-rows UI, settings for grade/weight format. Weak: history-of-grading filler, no structured data, cluttered desktop layout, modest mobile ergonomics.

**Omnicalculator (A3)**: multi-grading-system selector (US, Canada, GCSE, Australia, India CCE), up to 9 prior exams, author + PhD reviewer bylines, share/reset, video. Schema: Article + WebPage + Organization + Person, plus FAQPage. Weak: very long essay (anxiety, motivation) pushes content far below the fold.

**Gigacalculator (A1)**: accepts multiple scores in one field (space/comma separated), class-average section, worked examples table, citation tools, embed, Article + BreadcrumbList schema, AdSense. Weak: one output only, no subject-wise rows, dated UI.

**Inchcalculator (A1)**: cleanest UX of the set: two fields, dark mode, share, cite, author/reviewer bylines, BreadcrumbList + WebPage + Organization. Monetised with Raptive ads. Weak: single score only, thin content (3 steps).

**Pearson Channels (A3, B1)**: title tag with modifiers ("Required Final Exam Score & Course Grade"), step-by-step solutions, what-if scenarios, example problems; SoftwareApplication + FAQPage schema. Study schedule tool is feature-rich (4 modes: countdown, weekly, catch-up, cram; topics with confidence; readiness score; copy schedule). Weak: heavy page, corporate chrome, slow.

**Clock7 (B2)**: countdown + daily-hours-needed combined, exam presets (IELTS, SAT, GCSE, NEET, GRE...), dedicated sub-pages per exam, WebApplication + FAQPage + BreadcrumbList, AdSense. Weak: generic content, obvious ad load.

---

## 3. Missing features worth adding

Marks percentage (A1): subject-wise rows with per-subject max (board-exam style, 5/6 subjects), "best of 5" toggle (CBSE/ICSE convention), presets for /500 /600 /700 /1000, reverse mode (percentage -> marks), CGPA <-> percentage link, grade band (distinction/first class) by common Indian thresholds, printable/shareable result, lookup table for the chosen total.

Grade calculator (A2): weighted categories with drop-lowest, letter + GPA scale selector (US 4.0, UK classification, percentage), "single test" tab (points scored -> % -> letter), save state in URL (shareable), export to CSV.

Final grade needed (A3): everything RogerHub does plus letter-grade target picker, "is it achievable?" messaging (>100% = not reachable, show max achievable), chart of required score vs target, points-based mode, bulk "what if" table for A/B/C targets, "marks needed to pass" quick mode (pass % selector).

Study hours (B1): inputs = exam date, topics/pages, difficulty, available days off, hours/day cap; outputs = total hours, hours per day, per-topic split, feasibility warning, pomodoro count (25/5, 50/10 custom), ICS calendar export, printable plan. Nobody currently offers calendar export cleanly.

Exam countdown (B2): multiple exams, named countdown, shareable URL (`?exam=NEET&date=...`), live days/hours/minutes, "study days left" (exclude rest days), link to B1 with the date prefilled, exam preset dates (publicly announced boards/tests, kept updated).

---

## 4. Question-style long-tail (PAA-type) queries observed

A1: how to calculate percentage of marks; how to calculate percentage of marks of 6 subjects; what percentage is 450 out of 500; how to convert marks into percentage; how to calculate percentage for 12th class; how to calculate percentage from CGPA.
A2/A3: how do I calculate my final grade; what grade do I need on my final to get an A; what do I need on my final to pass; how to calculate weighted grade; what is 15 out of 20 as a percentage; how much is my final worth.
B1/B2: how many hours a day should I study for an exam; how many days before an exam should I start studying; how many pomodoros in 3 hours; is 2 hours of study a day enough; how to make a study timetable for exams; how many days until (NEET/JEE/GCSE/SAT).

Use these as H2/H3 headings with 40-60 word direct answers (snippet-friendly). They also feed AI Overviews, which already summarise the formula on these SERPs.

---

## 5. Schema and SERP features present

Schema found on competitors: Article/WebPage/Organization/Person (Omni, Giga), BreadcrumbList (Inch, Giga, Clock7), FAQPage (Omni, Pearson, Clock7: legacy, no longer rendered), SoftwareApplication (Pearson), WebApplication + Offer (Clock7). RogerHub and calculator.net ship none and still rank #1, so schema is not a ranking lever here.

SERP features: AI Overview on most "how to"/"what do I need" phrasings (formula + worked example); People Also Ask; featured snippets for formula queries; app-pack/App Store results for "exam countdown"; sitelinks for brands (calculator.net, RogerHub). No calculator rich result exists for tool pages.

---

## 6. Recommended pages

| URL | Title tag (<60 chars) | H1 | Meta description |
|---|---|---|---|
| /marks-percentage-calculator | Marks Percentage Calculator – Marks to Percentage (Out of 500, 600) | Marks Percentage Calculator | Calculate your percentage from marks obtained and total marks. Subject-wise entry, best-of-5, presets for 500, 600 and 1000 marks, plus the formula and examples. |
| /grade-calculator | Grade Calculator – Weighted Grade & Test Score Calculator | Grade Calculator | Enter assignment, test and exam scores with weights to get your current weighted grade, letter grade and GPA. Also converts a single test score to a percentage. |
| /final-grade-calculator | Final Grade Calculator – What Do I Need on My Final? | Final Grade Calculator: What Do I Need on My Final Exam? | Find the exact score you need on your final exam to reach your target grade. Enter current grade, final weight and goal; supports points, categories and pass marks. |
| /study-time-calculator | Study Time Calculator – Hours per Day Until Your Exam | Study Time Calculator | Work out how many study hours you need and how many hours a day to study before your exam. Includes topic split, pomodoro sessions and a printable plan. |
| /exam-countdown | Exam Countdown – Days Until My Exam | Exam Countdown: How Many Days Until Your Exam? | Count down the days, hours and minutes to your exam date, see study days remaining and get a daily study-hours target. Save and share your countdown link. |

Internal linking: A1 <-> A2 <-> A3 in a "Grade tools" block; B2 -> B1 via prefilled date; A3 -> B1 ("you need 78% — plan the hours"). Hub page /grades or /study-tools with BreadcrumbList.

Do not create: /exam-score-calculator, /marks-needed-calculator, /weighted-grade-calculator, /percentage-out-of-500 (handle all via tabs/presets + redirects if they already exist).

---

## 7. Is exam countdown / study time worth a page?

- **Study time calculator: yes.** Competitors are weak or slow; informational PAA volume ("how many hours a day should I study") is substantial and tool + answer content fits well. Pomodoro is a mode, not a page.
- **Exam countdown: yes, but as a secondary page with modest expectations.** "Exam countdown" head term is app-dominated (App Store, Chrome extension) and generic countdown sites (timeanddate-style) compete for "days until". Web tools (clock7, RemNote) do rank for "exam countdown timer"/"days until my exam", and clock7 gets extra reach from per-exam sub-pages. Build one page with shareable URL state, exam presets and a tight link to the study-time tool; skip a per-exam sub-page farm unless you can keep official dates accurate (stale dates are a trust and quality problem).

---

## 8. Structured data for calculator/tool pages: what Google actually supports (2025-2026)

- **SoftwareApplication / WebApplication**: Still a documented "Software app" rich result; WebApplication is an accepted subtype. But the rich result **requires** `name`, `offers.price` (0 for free) and an `aggregateRating` or `review`. Without a genuine rating it earns nothing, and self-serving/fabricated ratings violate review-snippet policy. Verdict: optional. Only add WebApplication if you have real, visible user ratings; otherwise skip (it is ignored, not harmful).
- **FAQPage**: Restricted in Aug 2023 to well-known government/health sites, then removed from Search entirely (Google's doc now says the feature no longer appears; reporting and Rich Results Test support dropped mid-2026). Zero SERP value for a calculator site. Not harmful, but do not spend effort on it; use visible Q&A headings instead.
- **HowTo**: Deprecated Sept 2023 (mobile first, then desktop). Do not implement.
- **Sitelinks search box (WebSite + SearchAction)**: Removed Nov 2024. Do not implement SearchAction.
- **BreadcrumbList**: Fully supported (desktop and mobile), appears in the URL line. Implement on every tool page with a 2-3 level trail (Home > Grade Tools > Final Grade Calculator). Requires `position`, `name`, `item`.
- **WebSite (site name)**: Supported; home page only; `name`, `url`, optional `alternateName`. Implement to control the site name shown in results.
- **Organization**: Supported rich-result entry (logo, name, url, sameAs, contact). Put on home page; reference via `publisher`/`@id` elsewhere.
- **WebPage / Article with author Person**: No calculator rich result, but harmless and consistent with top competitors (Omni, Giga, Inch). Use WebPage (not Article unless there is genuine editorial content) with `author` Person (+ `ProfilePage` for author pages) to support E-E-A-T signals and bylines.
- **Math solver**: exists in the gallery but is for step-by-step math problem solvers, not calculators; not applicable.

Safe, useful minimum per tool page: `BreadcrumbList` + `WebPage` (name, description, datePublished/dateModified, author, publisher @id). Site-wide once: `WebSite` + `Organization`. Everything else is ignored by Google today.
