import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata("/terms", "Terms of Use", `Terms for using ${site.name}: free educational calculators provided as-is; verify institutional rules with your own university.`);

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">Terms of Use</h1>
      <p className="mt-2 text-sm text-fg-faint">Last updated 7 October 2026</p>
      <article className="prose-tool mt-6">
        <h2>Use of the tools</h2>
        <p>{site.name} provides free calculators for educational and informational purposes. You may use them for personal, non-commercial purposes and link to them freely.</p>
        <h2>No guarantee of institutional outcomes</h2>
        <p>
          The calculators apply the formulas and thresholds shown on each page. Attendance requirements, condonation rules, grading scales and CGPA-to-percentage conversions differ between institutions and change over time. <strong>Always confirm with your own university’s regulations or your marks card.</strong> We are not responsible for decisions made on the basis of a result, including exam eligibility, admissions or employment.
        </p>
        <h2>Accuracy</h2>
        <p>We test our calculations carefully, but the service is provided “as is” without warranties of any kind. If you believe a result is wrong, please report it through the contact page.</p>
        <h2>Acceptable use</h2>
        <p>Do not attempt to disrupt the site, scrape it at a rate that affects other users, or misrepresent our results as official institutional documents.</p>
        <h2>Intellectual property</h2>
        <p>The site’s text, design and code are owned by {site.name} unless stated otherwise. Formulas themselves are not proprietary; attributions to institutions are provided for accuracy.</p>
        <h2>Changes</h2>
        <p>We may update these terms and the tools at any time. Continued use after a change constitutes acceptance.</p>
      </article>
    </div>
  );
}
