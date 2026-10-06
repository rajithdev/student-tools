import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/ToolPage";
import { CgpaToGpaConverter } from "@/components/calculators/CgpaToGpaConverter";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const metadata: Metadata = toolMetadata(getTool("cgpa-to-gpa"));

export default function Page() {
  return (
    <ToolPage
      slug="cgpa-to-gpa"
      intro="Estimate your GPA on the 4.0 scale from a 10-point CGPA or a percentage. The result is an estimate: credential evaluators convert each course separately, and universities abroad often ask for the original CGPA rather than a converted figure."
      calculator={<CgpaToGpaConverter />}
    >
      <h2 id="how">How a 10-point CGPA maps to a 4.0 GPA</h2>
      <p>Two approaches are common. The linear one scales the whole range:</p>
      <p className="formula">GPA (4.0) ≈ CGPA ÷ 10 × 4</p>
      <p>
        So 7.5 CGPA becomes 3.0. The band approach maps grade bands to US letters: 9.0 and above to A (4.0), 8.0 to 8.9 to A− (3.7), 7.0 to 7.9 to B+ (3.3), 6.0 to 6.9 to B (3.0), 5.0 to 5.9 to B− (2.7), 4.0 to 4.9 to C (2.0). The two methods disagree by up to half a point in the middle of the scale, which is why the converter shows both.
      </p>

      <h2 id="wes">How WES and other evaluators actually convert</h2>
      <p>
        World Education Services and similar bodies do not apply a formula to your final CGPA. They take each course on the transcript, assign a US letter grade based on the Indian grade or marks and the institution’s own grading scale, weight it by credits, and compute a US-style GPA. Two students with the same CGPA can receive different evaluated GPAs because their course-level grades differ. WES also considers the institution’s classification thresholds (first class, distinction) when mapping.
      </p>
      <p>Use this page for a sanity check and for application forms that insist on a 4.0 figure. For the official number, order an evaluation or ask the receiving university whether they accept the 10-point CGPA directly, which many now do.</p>

      <h2 id="percentage">Converting a percentage to GPA</h2>
      <p>
        If your transcript shows a percentage rather than a CGPA, the converter first turns it into a 10-point CGPA by dividing by 9.5, the most common convention, then applies the mapping above. If your university uses a different percentage equivalence, convert with the{" "}
        <Link href="/cgpa-to-percentage/">CGPA to percentage converter</Link> first and enter the CGPA here.
      </p>

      <h2 id="faq">Common questions</h2>
      <h3>Is 8 CGPA equal to 3.2 GPA?</h3>
      <p>Linearly, yes (8 ÷ 10 × 4 = 3.2). Under the band method it is 3.7 because 8.0 falls in the A− band. An evaluator could land anywhere between depending on your course grades.</p>
      <h3>Is 9 CGPA a 4.0 GPA?</h3>
      <p>In band terms, 9.0 and above is usually treated as an A, so 4.0. Linearly it is 3.6. Most admissions officers familiar with Indian grading will read 9.0 as an excellent result either way.</p>
      <h3>Should I convert at all on my application?</h3>
      <p>Only if the form requires it. Where there is a free-text field, state the CGPA with its scale (for example “8.7 / 10”) and let the university convert. If the form demands a 4.0 number, use the linear estimate and note the method.</p>
    </ToolPage>
  );
}
