import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata("/contact", "Contact", `How to reach ${site.name} with corrections, formula sources, bug reports and suggestions.`);

export default function Page() {
  const email = site.contactEmail;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">Contact</h1>
      <article className="prose-tool mt-6">
        <p>We read every message. The most useful ones include:</p>
        <ul>
          <li>a link to the official regulation or marks card showing a formula or threshold we should add or fix;</li>
          <li>the exact numbers you entered and the result you expected, if you think a calculation is wrong;</li>
          <li>the device and browser, if something looks broken.</li>
        </ul>
        {email ? (
          <p>
            Email: <a href={`mailto:${email}`}>{email}</a>
          </p>
        ) : (
          <p>
            Email: <span className="font-medium">hello@[this site’s domain]</span> (the address will be published together with the production domain).
          </p>
        )}
        <p>We do not offer academic advice about individual cases, and we cannot change attendance or grade records at any institution.</p>
      </article>
    </div>
  );
}
