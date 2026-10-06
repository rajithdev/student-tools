import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata("/privacy", "Privacy Policy", `How ${site.name} handles data: calculations stay in your browser; optional, privacy-conscious analytics; advertising disclosure.`);

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-fg-faint">Last updated 7 October 2026</p>
      <article className="prose-tool mt-6">
        <h2>What we collect</h2>
        <p>
          <strong>Your calculator inputs are not sent to us.</strong> Every calculation runs in your browser. Inputs appear in the page address (URL) so that you can bookmark or share a result; if you share that link, the recipient can see those numbers.
        </p>
        <p>
          Some tools let you save items, such as exam countdowns, in your browser’s local storage. That data stays on your device and can be cleared from your browser settings.
        </p>
        <h2>Analytics</h2>
        <p>
          We may use a web analytics service to understand which pages and tools are used, on what kind of device, and from which country. Analytics events record that a tool was used and a coarse outcome (for example “below requirement”), never the figures you typed. Where Google Analytics is used, IP anonymisation is enabled and the data is subject to{" "}
          <a href="https://policies.google.com/privacy" rel="noopener noreferrer">Google’s privacy policy</a>. You can block analytics with a content blocker or your browser’s tracking protection without affecting the calculators.
        </p>
        <h2>Advertising</h2>
        <p>
          We may display advertising through Google AdSense in future. Google and its partners may use cookies or similar technologies to serve ads based on prior visits to this or other websites. You can opt out of personalised advertising at{" "}
          <a href="https://www.google.com/settings/ads" rel="noopener noreferrer">Google Ads Settings</a> and learn more at{" "}
          <a href="https://policies.google.com/technologies/ads" rel="noopener noreferrer">How Google uses information from sites that use its services</a>. If advertising is enabled, this page will be updated and a consent mechanism will be shown where the law requires it.
        </p>
        <h2>Cookies</h2>
        <p>The site itself sets no cookies. It stores your light/dark theme preference and any saved countdowns in local storage on your device. Analytics or advertising providers, if enabled, may set their own cookies as described above.</p>
        <h2>Hosting and logs</h2>
        <p>Our hosting provider may keep standard server logs (IP address, user agent, requested URL, timestamp) for security and operations. We do not combine these with any other data.</p>
        <h2>Children</h2>
        <p>The site is intended for students of all ages and collects no personal information. We do not knowingly collect data from children.</p>
        <h2>Changes and contact</h2>
        <p>
          We will update this page when our practices change. Questions can be sent via the <a href="/contact/">contact page</a>.
        </p>
      </article>
    </div>
  );
}
