import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/ToolPage";
import { AttendanceCalculator } from "@/components/calculators/AttendanceCalculator";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { ReadyReckoner } from "@/content/ReadyReckoner";

export const metadata: Metadata = toolMetadata(getTool("attendance-calculator"));

export default function Page() {
  return (
    <ToolPage
      slug="attendance-calculator"
      intro="Enter the classes you attended and the classes held. You get your attendance percentage, how many classes you can still miss, and how many you must attend in a row to get back to 75% (or any requirement your college sets)."
      calculator={<AttendanceCalculator />}
    >
      <h2 id="formula">How attendance percentage is calculated</h2>
      <p>Attendance percentage is the share of conducted classes you were present for:</p>
      <p className="formula">Attendance % = Classes attended ÷ Classes held × 100</p>
      <p>
        If 42 of 56 classes have been held and you attended 42, your attendance is 42 ÷ 56 × 100 = <strong>75%</strong>. Classes that were cancelled or never held are not counted in either number. Most colleges count lectures, tutorials and labs separately, so check whether your institution reports one combined figure or one per subject.
      </p>

      <h2 id="can-miss">How many classes can I miss and still keep 75%?</h2>
      <p>
        Every class you skip raises the total held without raising the classes attended. The largest number of classes you can miss while staying at or above a requirement <em>R</em> is:
      </p>
      <p className="formula">Classes you can miss = floor( Attended × 100 ÷ R − Held )</p>
      <p>
        With 48 attended out of 60 held (80%) and a 75% requirement: 48 × 100 ÷ 75 − 60 = 4. You can miss <strong>4 classes</strong> and sit at exactly 48 ÷ 64 = 75%. The fifth miss drops you to 73.8%. The calculator above does this for you and also shows what the next 1, 2, 3, 5 and 10 misses would do.
      </p>

      <h2 id="need">How many classes do I need to attend to reach 75%?</h2>
      <p>
        When you are below the requirement, attending a class raises both numbers by one. The smallest number of consecutive classes <em>n</em> you must attend is:
      </p>
      <p className="formula">Classes needed = ceil( (R × Held − 100 × Attended) ÷ (100 − R) )</p>
      <p>
        At 30 attended out of 45 held (66.7%) with a 75% requirement: (75 × 45 − 100 × 30) ÷ 25 = 15. You need the next <strong>15 classes without a single miss</strong> to reach 45 ÷ 60 = 75%. Recovery is slow because each class you attend only adds one to the numerator while the denominator keeps growing. Missing one more class during recovery adds roughly four more classes to the journey, which is why early-semester absences are so costly.
      </p>

      <h2 id="examples">Worked examples at 75%, 80% and 85%</h2>
      <h3>75% attendance examples</h3>
      <ul>
        <li>
          <strong>60 of 72 held (83.3%)</strong>: you can miss 8 more classes (60 ÷ 80 = 75%).
        </li>
        <li>
          <strong>36 of 50 held (72%)</strong>: attend the next 6 classes (42 ÷ 56 = 75%).
        </li>
        <li>
          <strong>75 of 100 held (75%)</strong>: exactly on the line. One miss puts you at 74.3%.
        </li>
      </ul>
      <h3>80% attendance examples</h3>
      <ul>
        <li>
          <strong>44 of 50 held (88%)</strong>: you can miss 5 (44 ÷ 55 = 80%).
        </li>
        <li>
          <strong>30 of 40 held (75%)</strong>: attend the next 10 classes (40 ÷ 50 = 80%).
        </li>
      </ul>
      <h3>85% attendance examples (VTU, many pharmacy and nursing programmes)</h3>
      <ul>
        <li>
          <strong>52 of 58 held (89.7%)</strong>: you can miss 3 (52 ÷ 61 = 85.2%).
        </li>
        <li>
          <strong>40 of 50 held (80%)</strong>: attend the next 17 classes without fail (57 ÷ 67 = 85.07%).
        </li>
      </ul>

      <h2 id="table">Ready reckoner: safe misses and classes needed</h2>
      <p>For a quick look without typing, this table shows the minimum classes you must attend out of a given total to meet each threshold, and therefore the most you can miss over the whole term.</p>
      <ReadyReckoner />

      <h2 id="rounding">Is 74.5% attendance rounded up to 75%?</h2>
      <p>
        Usually not. Most Indian universities and colleges treat the requirement as a hard floor: 74.99% is below 75%. A few institutions round to the nearest whole number in their software, but you should never plan on it. This calculator never rounds in your favour: if the exact value is below the requirement, it tells you so even when the two-decimal display would otherwise read 75.00%.
      </p>

      <h2 id="rules">The 75% rule in Indian colleges</h2>
      <p>
        Universities regulated by UGC and AICTE generally require a minimum of 75% attendance to sit for end-semester examinations. Many allow <strong>condonation</strong>, a one-time relaxation (often down to 65%) for documented medical reasons or representation in university events, sometimes with a fee. Below the condonable limit students are typically detained and must repeat the semester or the subject. Common variations:
      </p>
      <ul>
        <li>
          <strong>Per subject vs aggregate</strong>: many engineering universities apply the rule to each subject separately. You can have 80% overall and still be short in one lab course.
        </li>
        <li>
          <strong>Higher thresholds</strong>: VTU asks for 85%, and several pharmacy, nursing and medical programmes require 80% to 85%.
        </li>
        <li>
          <strong>Internal marks</strong>: some universities award a few internal marks by attendance band (for example 95% and above earns the full 5 marks), so attendance above the minimum still pays.
        </li>
        <li>
          <strong>Medical leave</strong>: a few colleges remove approved leave days from the classes-held count. If yours does, subtract those classes from “Classes held” before calculating.
        </li>
      </ul>
      <p>Check your own university regulations: the rule above is the common pattern, not a guarantee for your institution.</p>

      <h2 id="why-drops">Why does attendance drop so fast at the start of the semester?</h2>
      <p>
        Early on, the total number of classes is small, so each absence is a large share. Missing one of the first four classes puts you at 75% immediately; missing one of the first forty costs only 2.5 percentage points. The projections in the calculator make this visible: compare how far one miss moves you now against how far it would move you after another 20 classes.
      </p>

      <h2 id="faq">Common questions</h2>
      <h3>Does the calculator work for days instead of classes?</h3>
      <p>Yes. If your school tracks attendance by working days, enter days attended and days held. The maths is identical.</p>
      <h3>How do I calculate attendance for multiple subjects?</h3>
      <p>Run the calculator once per subject if your university applies the rule per subject. For an aggregate figure, add up attended and held across all subjects first.</p>
      <h3>What is a “bunk calculator”?</h3>
      <p>
        The same thing. “Safe bunks” is student slang for the number of classes you can skip while staying above the requirement, which is the “Can miss” figure above. If you want to plan around the classes still left this term, use the{" "}
        <Link href="/how-many-classes-can-i-miss/">How Many Classes Can I Miss</Link> planner.
      </p>
      <h3>Is my data stored?</h3>
      <p>No. Everything is calculated in your browser. The numbers only appear in the page address so you can bookmark or share a result.</p>
    </ToolPage>
  );
}
