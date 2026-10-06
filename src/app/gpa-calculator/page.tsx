import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/ToolPage";
import { GpaCalculator } from "@/components/calculators/GpaCalculator";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const metadata: Metadata = toolMetadata(getTool("gpa-calculator"));

export default function Page() {
  return (
    <ToolPage
      slug="gpa-calculator"
      intro="Enter each course’s letter grade and credit hours to get your semester GPA on the 4.0 scale. Add your previous cumulative GPA and credits to see your new cumulative GPA, switch on honors/AP weighting, or plan the GPA you need over your next credits."
      calculator={<GpaCalculator />}
    >
      <h2 id="formula">How GPA is calculated</h2>
      <p>Each letter grade maps to grade points. Multiply by the course’s credit hours, add up, and divide by the total credits:</p>
      <p className="formula">GPA = Σ (Credit hours × Grade points) ÷ Σ Credit hours</p>
      <p>
        Example: Calculus (4 credits, A = 4.0), Chemistry (3 credits, B+ = 3.3), History (3 credits, A− = 3.7) and a 1-credit seminar (C = 2.0). Quality points: 16 + 9.9 + 11.1 + 2 = 39, credits 11, GPA = 39 ÷ 11 = <strong>3.55</strong>.
      </p>

      <h2 id="scale">Letter grades on the 4.0 scale</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Letter</th>
              <th scope="col">Grade points</th>
              <th scope="col">Typical percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>A+</td><td>4.0 (4.3 at some schools)</td><td>97–100</td></tr>
            <tr><td>A</td><td>4.0</td><td>93–96</td></tr>
            <tr><td>A−</td><td>3.7</td><td>90–92</td></tr>
            <tr><td>B+</td><td>3.3</td><td>87–89</td></tr>
            <tr><td>B</td><td>3.0</td><td>83–86</td></tr>
            <tr><td>B−</td><td>2.7</td><td>80–82</td></tr>
            <tr><td>C+</td><td>2.3</td><td>77–79</td></tr>
            <tr><td>C</td><td>2.0</td><td>73–76</td></tr>
            <tr><td>C−</td><td>1.7</td><td>70–72</td></tr>
            <tr><td>D+</td><td>1.3</td><td>67–69</td></tr>
            <tr><td>D</td><td>1.0</td><td>63–66</td></tr>
            <tr><td>D−</td><td>0.7</td><td>60–62</td></tr>
            <tr><td>F</td><td>0.0</td><td>below 60</td></tr>
          </tbody>
        </table>
      </div>
      <p>Percentage bands are the common pattern in US schools, not a standard. Your syllabus or registrar’s grading policy decides.</p>

      <h2 id="cumulative">Semester GPA vs cumulative GPA</h2>
      <p>
        Your cumulative GPA is the same formula applied to every course you have taken. To update it without re-entering old courses, multiply your previous cumulative GPA by your previous credits to recover the quality points, add this semester’s quality points, and divide by the combined credits:
      </p>
      <p className="formula">New cumulative GPA = (Previous GPA × Previous credits + Σ this semester) ÷ (Previous credits + Credits this semester)</p>
      <p>A 3.2 GPA over 60 credits followed by a 3.8 semester over 15 credits becomes (192 + 57) ÷ 75 = <strong>3.32</strong>. The more credits you already have, the less one semester moves the number.</p>

      <h2 id="weighted">Weighted vs unweighted GPA</h2>
      <p>
        High schools often add 0.5 points for honors courses and 1.0 for AP or IB courses, so an A in AP Biology is worth 5.0 instead of 4.0. Weighted GPAs can exceed 4.0, and colleges usually recalculate them on their own scale. Enable “Weighted” in the calculator to mark individual courses as Honors or AP/IB.
      </p>

      <h2 id="target">How to raise your GPA to a target</h2>
      <p>
        Because GPA is a credit-weighted average, the GPA you need over your next <em>N</em> credits to reach a target <em>T</em> is:
      </p>
      <p className="formula">Needed GPA = (T × (Current credits + N) − Current quality points) ÷ N</p>
      <p>
        If the result is above 4.0 (or your scale’s maximum), the target is not reachable within those credits. The planner in the calculator applies this to your numbers and tells you plainly when it is out of reach.
      </p>

      <h2 id="faq">Common questions</h2>
      <h3>Do pass/fail courses count?</h3>
      <p>Normally not. Credits for a “Pass” are earned but excluded from the GPA calculation, while a “Fail” may count as 0 at some schools. Leave such courses out unless your school says otherwise.</p>
      <h3>What is a good GPA?</h3>
      <p>Context matters: 3.0 is the usual threshold for good standing and many scholarships, 3.5 and above is often called honors, and competitive graduate programmes typically look for 3.5 or higher. Employers rarely ask for more than 3.0.</p>
      <h3>How is a 10-point CGPA different?</h3>
      <p>
        Indian universities use a 10-point scale with credit weighting; see the <Link href="/cgpa-calculator/">CGPA calculator</Link>. Converting between the two is approximate; the <Link href="/cgpa-to-gpa/">CGPA to GPA converter</Link> explains why.
      </p>
    </ToolPage>
  );
}
