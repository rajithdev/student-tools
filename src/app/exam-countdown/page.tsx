import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/ToolPage";
import { ExamCountdown } from "@/components/calculators/ExamCountdown";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const metadata: Metadata = toolMetadata(getTool("exam-countdown"));

export default function Page() {
  return (
    <ToolPage
      slug="exam-countdown"
      intro="Enter your exam date and time to see exactly how many days, hours and minutes are left, how many study days remain after your rest days, and a link to plan your hours. Save up to three exams in your browser and share the countdown with a link."
      calculator={<ExamCountdown />}
    >
      <h2 id="how">How the countdown is calculated</h2>
      <p>
        The big number is whole calendar days from today to the exam date, so an exam on the 20th viewed on the 7th shows 13 days regardless of the time of day. The hours and minutes beneath count down to the exact exam time you enter (9:00 by default). Study days exclude the exam day and any weekdays you mark as rest days.
      </p>

      <h2 id="study-days">Days until the exam vs study days</h2>
      <p>
        If your exam is 21 days away and you rest on Sundays, you have 18 study days, not 21. Planning with the calendar number is the most common reason study schedules run out of time. The countdown shows both figures, and the “Plan your study hours” link carries your date and rest days into the <Link href="/study-time-calculator/">study time calculator</Link>.
      </p>

      <h2 id="use">Using the countdown well</h2>
      <ul>
        <li>
          <strong>Set the real start time.</strong> A 9 a.m. exam on the 20th leaves no study time on the 20th; the hours figure makes that obvious.
        </li>
        <li>
          <strong>Save several exams.</strong> During an exam series, add each paper so you can see the gaps between them.
        </li>
        <li>
          <strong>Add it to your calendar.</strong> The “Add to calendar” link downloads an event file that works with Google Calendar, Apple Calendar and Outlook.
        </li>
        <li>
          <strong>Bookmark the link.</strong> Your exam name, date and time are in the page address, so the countdown survives a browser restart even without saving.
        </li>
      </ul>

      <h2 id="faq">Common questions</h2>
      <h3>Does the countdown keep running when the page is closed?</h3>
      <p>The countdown is recalculated from the exam date every time you open the page, so it is always correct. Nothing runs in the background and no notifications are sent.</p>
      <h3>Can I count down to exams like NEET, JEE, GCSEs or the SAT?</h3>
      <p>Yes. Enter the official date published by the exam board. We do not pre-fill dates because official schedules change and a wrong date is worse than no date.</p>
      <h3>Is my exam data stored anywhere?</h3>
      <p>Saved countdowns live in your browser’s local storage on your device. Clearing site data removes them.</p>
    </ToolPage>
  );
}
