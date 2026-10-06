import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/ToolPage";
import { StudyTimeCalculator } from "@/components/calculators/StudyTimeCalculator";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const metadata: Metadata = toolMetadata(getTool("study-time-calculator"));

export default function Page() {
  return (
    <ToolPage
      slug="study-time-calculator"
      intro="Enter your exam date (or the number of days you have), how much material is left and how many hours a day you can realistically study. You get the hours per day you need, whether your plan fits, a Pomodoro session count, and a day-by-day schedule."
      calculator={<StudyTimeCalculator />}
    >
      <h2 id="formula">How study hours per day are calculated</h2>
      <p className="formula">Hours per day = Total hours of material ÷ Study days available</p>
      <p>
        Study days are calendar days until the exam minus your rest days and the exam day itself. With 45 hours of material, 16 days to go and Sundays off, you have 14 study days and need 45 ÷ 14 ≈ <strong>3.2 hours a day</strong>. If you can only manage 2.5 hours, you are 10 hours short and need to cut topics, add days or drop a rest day; the calculator says so plainly instead of pretending the plan works.
      </p>

      <h2 id="estimate">Estimating total hours from topics</h2>
      <p>
        If you do not know the total, count the chapters or topics left and estimate hours per topic. A chapter you have already studied once usually needs 1 to 2 hours of revision; a new chapter typically takes 3 to 5 hours including practice questions. Multiply, then add 10 to 20% for mock tests and review, which the schedule leaves at the end.
      </p>

      <h2 id="pomodoro">Pomodoro sessions</h2>
      <p>
        A Pomodoro is a focused 25-minute session followed by a 5-minute break; after four sessions you take a longer break. 3.2 hours of study is about eight sessions and takes roughly 3 hours 35 minutes of wall-clock time once breaks are included. The calculator shows both numbers so your timetable is realistic, and lets you change the session and break lengths.
      </p>

      <h2 id="how-much">How many hours a day should I study for an exam?</h2>
      <p>
        There is no universal number; it depends on the hours of material and days left, which is what the calculator computes. As a sanity check, most students sustain 3 to 5 focused hours a day alongside classes and 6 to 8 during a dedicated study leave. Plans above 8 hours a day for more than a few days tend to fail, so if the required figure is that high, start earlier or prioritise topics by marks weight.
      </p>

      <h2 id="when-to-start">When should I start studying?</h2>
      <p>
        Work backwards: divide the total hours by the daily hours you can sustain to get the study days you need, then add rest days and a buffer of two or three days for revision. Enter the exam date in the <Link href="/exam-countdown/">exam countdown</Link> to see how many study days you actually have left.
      </p>

      <h2 id="mistakes">Common mistakes</h2>
      <ul>
        <li>
          <strong>Counting the exam day as a study day.</strong> The calculator excludes it.
        </li>
        <li>
          <strong>Planning zero rest days.</strong> Schedules without rest days rarely survive the first week.
        </li>
        <li>
          <strong>Spreading hours evenly across topics</strong> regardless of marks weight. Give heavier chapters more time.
        </li>
      </ul>

      <h2 id="faq">Common questions</h2>
      <h3>Is 2 hours a day enough?</h3>
      <p>It depends on the material and days left. 2 hours a day across 30 study days is 60 hours, which covers a typical semester course’s revision; it will not cover a full syllabus from scratch in two weeks. Enter your figures and the calculator tells you.</p>
      <h3>How many Pomodoros are in 3 hours?</h3>
      <p>Eight sessions of 25 minutes make 200 minutes of study; seven make 175. Three hours is between the two, so plan eight sessions with breaks, about 3 hours 35 minutes in total.</p>
      <h3>Can I save or share the plan?</h3>
      <p>The page address contains your inputs; copy it to reopen the same plan or send it to a study partner. Nothing is uploaded.</p>
    </ToolPage>
  );
}
