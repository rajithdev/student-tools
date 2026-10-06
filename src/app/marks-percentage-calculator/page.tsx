import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/ToolPage";
import { MarksPercentageCalculator } from "@/components/calculators/MarksPercentageCalculator";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const metadata: Metadata = toolMetadata(getTool("marks-percentage-calculator"));

export default function Page() {
  return (
    <ToolPage
      slug="marks-percentage-calculator"
      intro="Enter marks obtained and total marks to get your percentage, or add subjects one by one with their own maximum marks. Switch on best-of-5 for boards that count your five best subjects, or work backwards to find the marks you need for a target percentage."
      calculator={<MarksPercentageCalculator />}
    >
      <h2 id="formula">How to calculate percentage of marks</h2>
      <p className="formula">Percentage = Marks obtained ÷ Total maximum marks × 100</p>
      <p>
        If you scored 452 out of 500, your percentage is 452 ÷ 500 × 100 = <strong>90.4%</strong>. For several subjects, add up the marks obtained across all subjects and divide by the sum of the maximum marks, not by the number of subjects. Dividing by the number of subjects only works when every subject is out of 100.
      </p>

      <h2 id="subjects">Percentage of marks across 5 or 6 subjects</h2>
      <p>
        Six subjects out of 100 each with marks 92, 85, 78, 88, 95 and 70 total 508 out of 600, so the percentage is 508 ÷ 600 × 100 = <strong>84.67%</strong>. If one subject is out of 50, say a practical with 42 marks, the total becomes 550 maximum and the calculation changes to (466 + 42) ÷ 550; the subject-wise mode handles mixed maxima automatically.
      </p>

      <h2 id="best-of-5">What “best of 5” means</h2>
      <p>
        CBSE and several state boards report a percentage based on your five best subjects, typically one language plus four others, when you have taken six. The calculator drops the lowest-scoring subject when “Best of 5” is on and shows which one it dropped. Rules on which subjects may be dropped vary by board and by the college you apply to, so treat this as the common pattern rather than a guarantee.
      </p>

      <h2 id="reverse">Marks needed for a target percentage</h2>
      <p className="formula">Marks needed = Target % × Total marks ÷ 100</p>
      <p>To score 75% out of 600 you need 450 marks. If you already have 310 from four papers, you need 140 across the remaining two. The reverse mode computes both numbers.</p>

      <h2 id="bands">Percentage bands used by Indian boards</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Percentage</th>
              <th scope="col">Common label</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>90 and above</td><td>Outstanding / A1 band</td></tr>
            <tr><td>75 to 89.99</td><td>Distinction</td></tr>
            <tr><td>60 to 74.99</td><td>First division</td></tr>
            <tr><td>45 to 59.99</td><td>Second division</td></tr>
            <tr><td>33 to 44.99</td><td>Pass / third division</td></tr>
          </tbody>
        </table>
      </div>
      <p>Pass marks are 33% for CBSE and most state boards and 35% or 40% at many universities. Labels differ between boards; the calculator uses the pattern above as a guide only.</p>

      <h2 id="mistakes">Common mistakes</h2>
      <ul>
        <li>
          <strong>Averaging percentages instead of marks</strong> when subjects have different maximum marks.
        </li>
        <li>
          <strong>Including additional or optional subjects</strong> that your board excludes from the aggregate.
        </li>
        <li>
          <strong>Rounding each subject first.</strong> Keep raw marks and round only the final percentage.
        </li>
      </ul>

      <h2 id="faq">Common questions</h2>
      <h3>What percentage is 450 out of 500?</h3>
      <p>90%. Divide 450 by 500 and multiply by 100.</p>
      <h3>How do I convert a percentage to CGPA?</h3>
      <p>
        Divide by 9.5 for the CBSE convention, or use your university’s formula in the <Link href="/cgpa-to-percentage/">CGPA to percentage converter</Link>, which works in both directions.
      </p>
      <h3>Does this calculate grades too?</h3>
      <p>
        For letter grades and weighted course grades, use the <Link href="/grade-calculator/">grade calculator</Link>. To find the score you need on a final exam, use the <Link href="/final-grade-calculator/">final grade calculator</Link>.
      </p>
    </ToolPage>
  );
}
