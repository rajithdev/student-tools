import Link from "next/link";
import { site } from "@/lib/site";
import { LogoMark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const primary = [
  { href: "/attendance-calculator/", label: "Attendance" },
  { href: "/cgpa-calculator/", label: "CGPA" },
  { href: "/gpa-calculator/", label: "GPA" },
  { href: "/grade-calculator/", label: "Grades" },
  { href: "/#tools", label: "All tools" },
];

export function Header() {
  return (
    <header className="border-b border-line bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/75">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-mark focus:px-3 focus:py-2 focus:text-mark-ink"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-fg" aria-label={`${site.name} home`}>
          <LogoMark />
          <span className="text-[1.05rem]">{site.name}</span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {primary.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-md px-3 py-2 text-sm font-medium text-fg-muted hover:bg-bg-sunken hover:text-fg">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/#tools" className="rounded-md px-3 py-2 text-sm font-medium text-fg-muted hover:bg-bg-sunken hover:text-fg md:hidden">
            All tools
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
