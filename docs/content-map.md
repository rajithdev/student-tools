# Search-intent → page map (decided 2026-10-07)

Research in `research-attendance.md`, `research-cgpa.md`, `research-marks-study-schema.md`.
Rule: one page per *intent*, not per keyword. Modifier keywords (75%, 80%, college, bunk, "with steps") are handled by
presets, anchors and H2 sections on the owning page.

| Page | Primary intent | Keywords absorbed (no separate page) |
|---|---|---|
| `/attendance-calculator/` | compute attendance %, safe-skip, classes needed | attendance percentage calculator, 75/80/85% attendance calculator, college attendance calculator, bunk calculator, attendance required calculator |
| `/how-many-classes-can-i-miss/` | question-led planner: skip / recover with remaining classes | how many classes can I miss (with 75 attendance), how many classes to attend for 75, classes needed for 75 attendance, safe bunk calculator |
| `/cgpa-calculator/` | SGPA from subjects, CGPA from semesters (credit-weighted) | SGPA calculator, SGPA to CGPA, CGPA from grades |
| `/gpa-calculator/` | semester + cumulative GPA, 4.0 scale | college GPA calculator, semester GPA, weighted GPA, how to calculate GPA |
| `/cgpa-to-percentage/` | bidirectional conversion with institution formula | percentage to CGPA, SGPA to percentage, CGPA to percentage VTU/Anna/Mumbai/CBSE, "8.2 CGPA in percentage" |
| `/cgpa-to-gpa/` | 10-point → 4.0 estimate for study abroad | CGPA to GPA, 10 point CGPA to 4 point GPA, WES GPA |
| `/marks-percentage-calculator/` | marks → percentage, subject-wise, best-of-5 | percentage calculator for marks, marks to percentage, percentage out of 500/600, exam score calculator (marks framing) |
| `/grade-calculator/` | weighted current grade + letter | weighted grade calculator, test score calculator, exam score calculator (US framing) |
| `/final-grade-calculator/` | score needed on final | what do I need on my final, marks needed calculator, grade needed to pass |
| `/study-time-calculator/` | hours/day to finish before exam | study hours calculator, study planner calculator, pomodoro study calculator |
| `/exam-countdown/` | days/hours until exam, study days left | days until exam, exam countdown timer, how many days until my exam |

Deliberately NOT created: `/75-attendance-calculator`, `/80-…`, `/attendance-NN`, `/exam-score-calculator`,
`/marks-needed-calculator`, `/weighted-grade-calculator`, `/percentage-out-of-500`, `/sgpa-calculator`,
`/percentage-to-cgpa` (all would cannibalise the owning page). University-specific converter pages
(`/cgpa-to-percentage/vtu` …) are a post-launch candidate only if each gets substantial unique content.

Structured data (per `research-marks-study-schema.md` §8): BreadcrumbList + WebPage on every tool page, WebSite +
Organization site-wide, WebApplication (EducationalApplication, free) as accurate descriptive markup. No FAQPage
(no longer shown by Google), no HowTo (deprecated), no AggregateRating (no real ratings).
