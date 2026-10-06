# CGPA / GPA / Percentage-conversion cluster — SEO research (2026-10-07)

Method: WebSearch for each target query (US-index results, so Indian SERP positions are approximate), then fetched/inspected 9 ranking pages: omnicalculator.com/other/gpa, calculator.net/gpa-calculator.html, gpacalculator.net/college-gpa-calculator/, num8ers.com/score-calculator/cgpa-to-percentage-calculator/, onlineresult.in/tools/cgpa-to-percentage-calculator, softwaretestinghelp.com/online-tools/cgpa-to-percentage-calculator/, yocket.com/tools/sgpa-to-cgpa-calculator, vtulife.in/sgpa-calculator, academic.exammint.in (Mumbai page). Primary sources: UGC CBCS guidelines (via stthomas.ac.in/cbcss mirror), VTU B.E. 2017 CBCS Regulations PDF (jyothyit.ac.in mirror), CBSE CCE certificate PDF (cbse.gov.in, 403 on fetch; formula text confirmed via search snippet).

## 1. Intent map and page consolidation

| Query | Intent | Decision |
|---|---|---|
| CGPA calculator, SGPA calculator, SGPA to CGPA calculator | Indian student: compute SGPA from subject grades+credits, then CGPA from semester SGPAs+credits | **One page**, two modes (Subjects -> SGPA, Semesters -> CGPA). Competitors (vtulife, onlineresult) already rank one combined page; num8ers splits and ranks weaker for the head term. |
| CGPA to percentage, percentage to CGPA, SGPA to percentage | Convert a 10-point score to % for job/exam forms (or reverse for CBSE/abroad) | **One bidirectional page.** The same URLs (softwaretestinghelp, num8ers) rank for both directions, the formula is identical, and the users are identical; two pages would cannibalize. SGPA->% uses the same multipliers, so it is a tab, not a page. Target "CGPA to percentage" as primary (higher volume); carry "percentage to CGPA" in title/H2. |
| CGPA to percentage VTU / Anna University / Mumbai / CBSE | Same conversion but formula-specific; strong long-tail | University selector on the main converter **plus** thin-but-distinct sub-pages for the 4-6 biggest institutions (onlineresult.in ranks 60+ parametric variants this way). |
| GPA calculator, college GPA calculator, semester GPA calculator, weighted GPA calculator, how to calculate GPA | US/4.0-scale student: letter grades x credits, cumulative with prior GPA, honors/AP weighting | **One page** with college/high-school toggle (Omni ranks one page for all; gpacalculator.net splits college/high-school). Split later only if a high-school weighted page earns its own demand. |
| 10 point CGPA to 4 point GPA (WES) | Study-abroad applicant | **Separate page** — different audience, different content (WES caveats). |

Result: 4 tool pages (CGPA/SGPA calculator; CGPA<->Percentage converter with university sub-pages; GPA calculator; CGPA to GPA), not 10.

## 2. What ranking pages do well / poorly

Well:
- onlineresult.in: 60+ university formula selector, per-university URLs, division classification (FCD/First Class), comparison matrix, FAQPage+HowTo+WebApplication schema. Best feature set in the India cluster.
- gpacalculator.net: semester + cumulative, 4.0/4.3 switch, transcript export, 13-question FAQ, WebApplication+FAQPage+HowTo schema, "On this page" nav.
- Omni: progressive disclosure, honors/AP weighting, authored/reviewed by-lines, cited sources, Article+FAQPage schema.
- calculator.net: accepts letter, percentage or point grades; integrated "GPA planning" (target GPA) calculator.

Poorly:
- num8ers and softwaretestinghelp present "Percentage = CGPA x 9.5" as the default universal rule with little or no institution caveat; num8ers' FAQ heading exists with no content; AggregateRating schema on a calculator (spam risk).
- yocket SGPA->CGPA tool only does simple average although its own copy says credit weighting is required — tool/content mismatch.
- vtulife: numeric grade points only, no letter-grade mapping, no FAQ.
- Google-indexed "GPA calculator" results are heavily polluted by spun/spam articles on hijacked subdomains — a clean, fast, schema-marked tool page has a real opening.
- No page audited shows a worked step-by-step of the user's own numbers (we can).

## 3. Missing features worth building
1. University/board formula selector with scheme/regulation year (VTU 2018 vs 2021 scheme, Anna Reg 2013/2017/2021, Mumbai Engg vs other faculties) and "copy the formula printed on your marks card" warning.
2. Letter-grade entry (O/A+/A...) and numeric grade-point entry side by side; UGC default with editable scale.
3. Credit-weighted SGPA->CGPA with per-semester rows; equal-credits shortcut shown only as a special case.
4. Reverse conversion in the same widget; result shows the formula applied and the class (First Class with Distinction etc.).
5. Shareable result URL (`?cgpa=8.2&uni=vtu-2018`) to capture "8.2 CGPA in percentage" long tail like onlineresult does.
6. GPA: prior-GPA + prior-credits cumulative, honors/AP toggle (+0.5/+1.0), A+ = 4.0 vs 4.3 switch, target-GPA planner.
7. CGPA->GPA: band table plus explicit "WES does not publish a formula; this is an estimate."

## 4. Question-style long-tail (PAA / FAQ candidates)
- How do I convert CGPA to percentage? Why multiply by 9.5? Is 9.5 valid for engineering?
- What is 7.5 / 8 / 8.2 / 9.5 CGPA in percentage? What is 75% in CGPA?
- What is the difference between SGPA and CGPA? How is CGPA calculated from SGPA? Is CGPA the average of SGPA?
- How to calculate CGPA from marks (CBSE)? Is 8 CGPA good? What CGPA is First Class / Distinction?
- How is GPA calculated with credits? What GPA is a B+? Is a 3.5 GPA good? Weighted vs unweighted GPA?
- How does WES convert Indian CGPA to GPA? Is 8 CGPA equal to 3.2 GPA?

## 5. Schema and SERP features observed
- Schema in use: FAQPage + Question/Answer (Omni, gpacalculator.net, num8ers, onlineresult, vtulife); HowTo/HowToStep (gpacalculator.net, num8ers, onlineresult); WebApplication (gpacalculator.net, onlineresult) / SoftwareApplication+Offer+AggregateRating (num8ers); Article (Omni), BlogPosting+BreadcrumbList (softwaretestinghelp); none on calculator.net.
- Recommend: WebApplication (applicationCategory "EducationalApplication", offers price 0) + FAQPage + BreadcrumbList; HowTo optional. Skip AggregateRating.
- SERP features: People Also Ask on every conversion query; featured snippet (definition/formula list) for "CGPA to percentage"; parametric long-tail pages ("x CGPA in percentage") ranking as distinct results; university pages (Jain, BMU) and edtech blogs (Careers360, Yocket) compete for informational variants. Ad scripts detected on num8ers, onlineresult and vtulife; none on Omni/calculator.net/gpacalculator.net.

## 6. Recommended pages

| URL | Title tag | H1 | Meta description |
|---|---|---|---|
| /cgpa-calculator | SGPA & CGPA Calculator (10-Point, Credit-Weighted) | SGPA & CGPA Calculator | Calculate SGPA from subject grades and credits, then CGPA across semesters using the UGC credit-weighted formula. Letter or numeric grades, instant result. |
| /cgpa-to-percentage | CGPA to Percentage Calculator – VTU, Anna, Mumbai, CBSE Formulas | CGPA to Percentage Calculator (and Percentage to CGPA) | Convert CGPA or SGPA to percentage with your university's official formula (x9.5, x10, (CGPA-0.75)x10, 7.1xCGPA+11) and back again. |
| /cgpa-to-percentage/vtu (also /anna-university, /mumbai-university, /cbse) | VTU CGPA to Percentage Calculator – 2018 vs 2021 Scheme | VTU CGPA to Percentage Calculator | Pick your VTU scheme and convert CGPA to percentage with the equivalence VTU prints on the marks card. |
| /gpa-calculator | GPA Calculator – Semester, Cumulative & Weighted (4.0 Scale) | GPA Calculator | Enter letter grades and credit hours to get semester and cumulative GPA on the 4.0 scale, with honors/AP weighting and a target-GPA planner. |
| /cgpa-to-gpa | CGPA to GPA Converter – 10-Point to 4.0 Scale | CGPA to GPA (4.0 Scale) Converter | Estimate your 4.0 GPA from a 10-point CGPA or percentage, see the band table, and learn how WES actually evaluates Indian transcripts. |

## 7. Formula verification

| Board / University | Formula | Evidence |
|---|---|---|
| CBSE Class IX/X (2009-10 to 2017 grading era) | Overall indicative % = 9.5 x CGPA; subject % = 9.5 x GP | **Well-sourced**: text on CBSE's own CCE certificate (cbse.gov.in/cce/...pdf). CBSE calls it "indicative". Current Class 10 marks-based results do not need it. |
| UGC CBCS (general degree, CBCS universities) | No official % formula; SGPA = Σ(Ci x Gi)/ΣCi, CGPA = Σ(Ci x Si)/ΣCi | **Well-sourced** (UGC guidelines via stthomas.ac.in/cbcss). "x 9.5 is the UGC rule" is a widespread **unsupported** claim — present x9.5 as a convention, not UGC policy. |
| VTU 2015/2017/2018 schemes | % = (CGPA − 0.75) x 10 | **Well-sourced**: VTU B.E. 2017 Regulations clause 17OB 7.1 "Conversion formula for CGPA into percentage" with an 8.20 CGPA illustration (formula itself is an embedded image in the PDF; value matches 74.5%); consistent across jainuniversity, exammint, onlineresult. Class: FCD >= 70%, FC 60-70%. |
| VTU 2021/2022 schemes | % = CGPA x 10 | **Secondary sources only** (exammint, knowledgeumacademy). Mark "verify on marks card". |
| Anna University (Reg 2013/2017/2021) | % = CGPA x 10 | **Moderately sourced**: consistent across onlineresult, exammint, totalcalchub; no annauniv.edu document fetched. |
| Mumbai University, Faculty of Technology | % = 7.1 x CGPI + 11 (commonly cited); circular Exam/Engg./720 of 2015 reportedly gives 7.1xCGPI+12 (CGPI<7) / 7.4xCGPI+12 (CGPI>=7); other faculties (CGPI − 0.75) x 10 | **Uncertain / conflicting**: three variants in secondary sources, circular UG/05 of 2018-19 cited but not retrievable (mu.ac.in pages behind bot check). Offer both and label batch applicability clearly. |
| "AICTE formula" (CGPA − 0.75) x 10 | Widely attributed to AICTE/IITs/NITs/DU | **Unverified** as an AICTE mandate; treat as "used by several technical universities". |
| 4-point / 5-point scales | % = CGPA x 25 ; % = CGPA x 20 | Arithmetic convention only, no authority. |
| 10-point CGPA -> 4.0 GPA | No published WES formula; WES iGPA converts each course grade then credit-weights; linear CGPA/10 x 4 and band tables (9.0-10 -> 4.0, 8.0-8.9 -> 3.7, 7.0-7.9 -> 3.3 ...) are third-party estimates | wes.org/igpa-calculator redirected to a JS app (no fetchable text); secondary sources (indiascholarships, smartcgpa, num8ers) agree WES does not disclose a formula. |

## 8. Grade-point scales

**India 10-point (UGC CBCS, 2015)**: O=10 (Outstanding), A+=9, A=8, B+=7, B=6, C=5, P=4 (Pass), F=0, Ab=0. Variants: VTU 2017 CBCS uses S=10, A=9, B=8, C=7, D=6, E=4, F=0 (no 5); IARE/JNTU-style S/A+/A/B+/B/C with 10/9/8/7/6/5; many autonomous colleges add O=10, A+=9.5 steps. Always make the scale editable.

**US 4.0 letter scale (plus/minus)**: A+=4.0 (4.3 at some schools), A=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7, C+=2.3, C=2.0, C-=1.7, D+=1.3, D=1.0, D-=0.7, F=0. Weighted high-school variants add +0.5 (honors) / +1.0 (AP/IB), topping at 5.0. Typical percentage bands: A 93-100, A- 90-92, B+ 87-89, B 83-86, B- 80-82, C+ 77-79, C 73-76, C- 70-72, D 60-69, F <60 (institution-dependent; calculator.net and gpacalculator.net tables agree).

## Sources
UGC CBCS table/formulas: https://stthomas.ac.in/cbcss/ (mirror of UGC guidelines); https://vikaspedia.in/education/policies-and-schemes/choice-based-credit-system-cbcs (search snippet). VTU: https://jyothyit.ac.in/wp-content/uploads/2023/06/VTU-BE-2017-Scheme-Regulations.pdf; https://academic.exammint.in/tools/vtu-cgpa-to-percentage-converter; https://www.jainuniversity.ac.in/resources/calculator/vtu-cgpa-to-percentage-calculator. CBSE: https://cbse.gov.in/cce/CCE%20Certificate-2009-11-A3%20size%20(Coloured)-13-10-2010.pdf. Anna: https://onlineresult.in/tools/cgpa-to-percentage-calculator/anna-university; https://academic.exammint.in/tools/anna-university-cgpa-to-percentage-calculator. Mumbai: https://academic.exammint.in/tools/mumbai-university-cgpi-to-percentage-converter; https://www.ccbp.in/gpa-cgpa-calculator/mumbai-university-cgpa-calculator; https://www.careers360.com/question-hi-im-a-final-yr-bms-student-of-mumbai-university-... (circular 720/2015 cited). WES: https://applications.wes.org/igpa-calculator/; https://indiascholarships.in/study-abroad/study-in/usa/usa-wes-gpa-calculator-spec; https://smartcgpa.com/wes-gpa-calculator. Competitor pages: as listed in Method.
