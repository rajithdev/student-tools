/** Site-wide configuration. The production origin comes from env so no fake domain is hard-coded. */

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
const rawBase = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/+$/, "") ?? "";

export const site = {
  name: "Student Tools",
  shortName: "StudentTools",
  tagline: "Fast, accurate calculators for students",
  description:
    "Free student calculators: attendance, classes you can miss, CGPA, GPA, CGPA to percentage, marks percentage, grade, final grade needed, study time and exam countdown.",
  /** Absolute origin without trailing slash. Falls back to localhost in development. */
  url: rawUrl || "http://localhost:3000",
  basePath: rawBase,
  locale: "en",
  twitter: "",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  isProductionUrl: Boolean(rawUrl),
} as const;

/** Absolute URL for a site path (path must start with "/"). Honors basePath and trailing-slash output. */
export function absoluteUrl(path: string): string {
  const p = path === "/" ? "/" : path.endsWith("/") ? path : `${path}/`;
  return `${site.url}${site.basePath}${p}`;
}
