/** Registry of every tool page: single source of truth for navigation, sitemap, internal links and metadata. */

export type ToolCategory = "attendance" | "grades" | "gpa" | "planning";

export interface ToolDef {
  slug: string; // route path without slashes
  name: string; // display name used in nav and links
  title: string; // <title>, ≤ 60 chars
  description: string; // meta description, ≤ 160 chars
  h1: string;
  short: string; // one-line summary for cards
  category: ToolCategory;
  related: string[]; // slugs
  datePublished: string;
  dateModified: string;
}

export const CATEGORY_LABEL: Record<ToolCategory, string> = {
  attendance: "Attendance",
  grades: "Marks & grades",
  gpa: "GPA & CGPA",
  planning: "Exam planning",
};

export const tools: ToolDef[] = [
  {
    slug: "attendance-calculator",
    name: "Attendance Calculator",
    title: "Attendance Calculator – 75% Rule, Classes You Can Miss",
    description:
      "Free attendance percentage calculator for students. Enter classes attended and held to see your attendance %, how many classes you can miss, and how many you must attend to reach 75%, 80% or 85%.",
    h1: "Attendance Calculator",
    short: "Your attendance %, how many classes you can miss, and how many you need to attend.",
    category: "attendance",
    related: ["how-many-classes-can-i-miss", "study-time-calculator", "exam-countdown"],
    datePublished: "2026-10-07",
    dateModified: "2026-10-07",
  },
  {
    slug: "how-many-classes-can-i-miss",
    name: "How Many Classes Can I Miss?",
    title: "How Many Classes Can I Miss? 75% Attendance Planner",
    description:
      "Find out exactly how many classes you can skip, or how many you must attend in a row, to stay at or above 75% (or any target) attendance. Includes a remaining-classes planner and recovery check.",
    h1: "How Many Classes Can I Miss?",
    short: "Safe-to-skip count, classes needed to recover, and whether recovery is still possible.",
    category: "attendance",
    related: ["attendance-calculator", "exam-countdown"],
    datePublished: "2026-10-07",
    dateModified: "2026-10-07",
  },
  {
    slug: "cgpa-calculator",
    name: "CGPA Calculator",
    title: "SGPA & CGPA Calculator – 10-Point, Credit-Weighted",
    description:
      "Calculate SGPA from subject grades and credits, then CGPA across semesters with the UGC credit-weighted formula. Letter or numeric grades, editable scale, instant result.",
    h1: "SGPA & CGPA Calculator",
    short: "Subject grades and credits, or semester SGPAs, into an accurate CGPA.",
    category: "gpa",
    related: ["cgpa-to-percentage", "gpa-calculator", "marks-percentage-calculator"],
    datePublished: "2026-10-07",
    dateModified: "2026-10-07",
  },
  {
    slug: "gpa-calculator",
    name: "GPA Calculator",
    title: "GPA Calculator – Semester & Cumulative GPA on a 4.0 Scale",
    description:
      "Calculate your semester GPA from letter grades and credit hours, then combine semesters into a cumulative GPA. Supports plus/minus grading on the 4.0 scale.",
    h1: "GPA Calculator",
    short: "Letter grades and credit hours into semester and cumulative GPA.",
    category: "gpa",
    related: ["cgpa-calculator", "grade-calculator", "final-grade-calculator"],
    datePublished: "2026-10-07",
    dateModified: "2026-10-07",
  },
  {
    slug: "cgpa-to-percentage",
    name: "CGPA to Percentage Converter",
    title: "CGPA to Percentage Calculator – CBSE, VTU, Anna, Mumbai",
    description:
      "Convert CGPA or SGPA to percentage, and percentage back to CGPA, using the formula your board or university actually uses: 9.5×, 10×, (CGPA − 0.75) × 10, 7.1 × CGPI + 11 or your own.",
    h1: "CGPA to Percentage Calculator (and Percentage to CGPA)",
    short: "Both directions, with CBSE, VTU, Anna, Mumbai and custom formulas.",
    category: "gpa",
    related: ["cgpa-calculator", "cgpa-to-gpa", "marks-percentage-calculator"],
    datePublished: "2026-10-07",
    dateModified: "2026-10-07",
  },
  {
    slug: "cgpa-to-gpa",
    name: "CGPA to GPA Converter",
    title: "CGPA to GPA Converter – 10-Point CGPA to 4.0 Scale",
    description:
      "Estimate your 4.0-scale GPA from a 10-point CGPA or a percentage, see the band table, and learn how evaluators like WES actually convert Indian transcripts course by course.",
    h1: "CGPA to GPA (4.0 Scale) Converter",
    short: "10-point CGPA to a 4.0 GPA estimate, with the caveats evaluators apply.",
    category: "gpa",
    related: ["cgpa-to-percentage", "gpa-calculator", "cgpa-calculator"],
    datePublished: "2026-10-07",
    dateModified: "2026-10-07",
  },
  {
    slug: "marks-percentage-calculator",
    name: "Marks Percentage Calculator",
    title: "Marks Percentage Calculator – Marks to Percentage (500, 600)",
    description:
      "Calculate your percentage from marks obtained and total marks, subject by subject. Best-of-5 option, presets for 500, 600 and 1000 marks, plus the formula and worked examples.",
    h1: "Marks Percentage Calculator",
    short: "Subject-wise marks to an overall percentage, with best-of-5.",
    category: "grades",
    related: ["cgpa-to-percentage", "grade-calculator", "final-grade-calculator"],
    datePublished: "2026-10-07",
    dateModified: "2026-10-07",
  },
  {
    slug: "grade-calculator",
    name: "Grade Calculator",
    title: "Grade Calculator – Weighted Grade & Test Score Calculator",
    description:
      "Enter assignment, test and exam scores with their weights to get your current weighted grade and letter grade. Also converts a single test score to a percentage and letter.",
    h1: "Grade Calculator",
    short: "Weighted course grade and letter grade from your scores so far.",
    category: "grades",
    related: ["final-grade-calculator", "gpa-calculator", "marks-percentage-calculator"],
    datePublished: "2026-10-07",
    dateModified: "2026-10-07",
  },
  {
    slug: "final-grade-calculator",
    name: "Final Grade Calculator",
    title: "Final Grade Calculator – What Do I Need on My Final?",
    description:
      "Find the exact score you need on your final exam to reach your target grade. Enter your current grade, the final's weight and your goal, and see whether it is achievable.",
    h1: "Final Grade Calculator: What Do I Need on My Final?",
    short: "The score you need on the final to hit your target grade.",
    category: "grades",
    related: ["grade-calculator", "study-time-calculator", "gpa-calculator"],
    datePublished: "2026-10-07",
    dateModified: "2026-10-07",
  },
  {
    slug: "study-time-calculator",
    name: "Study Time Calculator",
    title: "Study Time Calculator – Hours per Day Until Your Exam",
    description:
      "Work out how many hours a day you need to study before your exam from the material left and days available, with rest days and Pomodoro sessions built in.",
    h1: "Study Time Calculator",
    short: "Hours per day to finish your syllabus before exam day.",
    category: "planning",
    related: ["exam-countdown", "final-grade-calculator", "attendance-calculator"],
    datePublished: "2026-10-07",
    dateModified: "2026-10-07",
  },
  {
    slug: "exam-countdown",
    name: "Exam Countdown",
    title: "Exam Countdown – Days Until My Exam",
    description:
      "Count down the days, hours and minutes to your exam, see how many study days you have left after rest days, and share the countdown link.",
    h1: "Exam Countdown",
    short: "Days, hours and study days left until your exam.",
    category: "planning",
    related: ["study-time-calculator", "attendance-calculator"],
    datePublished: "2026-10-07",
    dateModified: "2026-10-07",
  },
];

export function getTool(slug: string): ToolDef {
  const t = tools.find((x) => x.slug === slug);
  if (!t) throw new Error(`Unknown tool: ${slug}`);
  return t;
}

export function relatedTools(slug: string): ToolDef[] {
  return getTool(slug).related.map(getTool);
}

export const staticPages = [
  { slug: "about", title: "About" },
  { slug: "contact", title: "Contact" },
  { slug: "privacy", title: "Privacy Policy" },
  { slug: "terms", title: "Terms of Use" },
];
