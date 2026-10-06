import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/ToolPage";
import { AttendanceCalculator } from "@/components/calculators/AttendanceCalculator";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const metadata: Metadata = toolMetadata(getTool("how-many-classes-can-i-miss"));

export default function Page() {
  return (
    <ToolPage
      slug="how-many-classes-can-i-miss"
      intro="Enter what you have attended so far and, if you know it, how many classes are still left this term. You get the exact number of classes you can safely skip, the number you must attend in a row to recover, and whether recovery is still possible before the semester ends."
      calculator={<AttendanceCalculator variant="planner" />}
    >
      <h2 id="skip">How many classes can I miss with 75% attendance?</h2>
      <p>
        You can miss as many classes as it takes for your attended count to fall to exactly 75% of the new total. In one line:
      </p>
      <p className="formula">Safe misses = floor( Attended × 100 ÷ 75 − Held )</p>
      <p>
        Suppose 50 classes have been held and you attended 44 (88%). 44 × 100 ÷ 75 = 58.67, minus 50 gives 8.67, so you can miss <strong>8 classes</strong>: 44 ÷ 58 = 75.9%. A ninth miss puts you at 44 ÷ 59 = 74.6%, under the line. The result is always rounded <em>down</em>, because a partial class is still a whole absence on the register.
      </p>
      <p>
        If you are already below 75%, the answer is zero. Any further absence makes recovery longer, which is what the “Must attend” figure measures.
      </p>

      <h2 id="attend">How many classes do I need to attend to get 75%?</h2>
      <p className="formula">Classes to attend in a row = ceil( (75 × Held − 100 × Attended) ÷ 25 )</p>
      <p>
        With 28 attended of 40 held (70%): (75 × 40 − 100 × 28) ÷ 25 = (3000 − 2800) ÷ 25 = 8. Attend the next <strong>8 classes</strong> without fail and you reach 36 ÷ 48 = 75%. Each miss during that stretch adds about three more classes to the count at a 75% threshold, and about four at 80%.
      </p>
      <p>
        For other requirements replace 75 and 25 with <em>R</em> and <em>100 − R</em>. At 85% the denominator is only 15, so the same 10-point gap takes far longer to close.
      </p>

      <h2 id="remaining">Can I still reach 75% before the semester ends?</h2>
      <p>
        Not always. If only <em>L</em> classes are left, the best you can finish at is (Attended + L) ÷ (Held + L). When that is below the requirement, no amount of effort fixes it, and you should talk to your department about condonation, make-up classes or medical certificates now rather than at exam time.
      </p>
      <p>Three typical situations, each at a 75% requirement with 30 classes left:</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Situation</th>
              <th scope="col">Now</th>
              <th scope="col">Best possible finish</th>
              <th scope="col">What it takes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Comfortable</td>
              <td>45 of 50 (90%)</td>
              <td>75 of 80 (93.8%)</td>
              <td>Attend 15 of 30; skip up to 15</td>
            </tr>
            <tr>
              <td>Tight</td>
              <td>33 of 50 (66%)</td>
              <td>63 of 80 (78.8%)</td>
              <td>Attend 27 of 30; skip at most 3</td>
            </tr>
            <tr>
              <td>Impossible</td>
              <td>30 of 50 (60%)</td>
              <td>60 of 80 (75%) — exactly, with zero misses</td>
              <td>Attend all 30. With 29 left instead, the target is out of reach</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Enter “Classes remaining” in the calculator and it works out your own row, including the number you can still skip.</p>

      <h2 id="weekly">Planning misses across the week</h2>
      <p>
        Students often ask whether they can skip one particular day every week. Convert the question into classes: if a subject meets four times a week and ten weeks remain, 40 classes are left. Skipping one of the four each week means 10 misses out of 40, so your end-of-term figure is (Attended + 30) ÷ (Held + 40). Put 40 into “Classes remaining” and compare the “can skip” figure with 10.
      </p>

      <h2 id="mistakes">Common mistakes</h2>
      <ul>
        <li>
          <strong>Counting classes that were cancelled</strong>. Only conducted classes count in “held”.
        </li>
        <li>
          <strong>Mixing subjects</strong>. Many universities apply the minimum to each subject. A strong aggregate does not rescue one weak lab course.
        </li>
        <li>
          <strong>Assuming rounding</strong>. 74.9% is below 75% almost everywhere. The planner treats the requirement as a hard floor.
        </li>
        <li>
          <strong>Spending the buffer early</strong>. The safe-miss count assumes you attend everything else. Keep a reserve for illness late in the term.
        </li>
      </ul>

      <h2 id="faq">Common questions</h2>
      <h3>Does this work for 80% or 85% requirements?</h3>
      <p>Yes. Pick 80 or 85 from the presets, or type any value such as 66.67 for a two-thirds rule.</p>
      <h3>What if I only want my current attendance percentage?</h3>
      <p>
        The <Link href="/attendance-calculator/">attendance calculator</Link> shows the same figures with a ready-reckoner table and an explanation of the 75% rule, condonation and medical leave.
      </p>
      <h3>Can I share my result?</h3>
      <p>Yes. The page address updates as you type; copy it or use the Share button. Nothing is uploaded.</p>
    </ToolPage>
  );
}
