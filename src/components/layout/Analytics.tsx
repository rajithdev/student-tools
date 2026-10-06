import Script from "next/script";

/** Loads whichever analytics provider is configured. Renders nothing when none is. */
export function Analytics() {
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SRC;
  return (
    <>
      {ga ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="lazyOnload" />
          <Script id="ga-init" strategy="lazyOnload">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}
      {plausible ? <Script defer data-domain={plausible} src="https://plausible.io/js/script.outbound-links.js" strategy="lazyOnload" /> : null}
      {umamiId && umamiSrc ? <Script defer data-website-id={umamiId} src={umamiSrc} strategy="lazyOnload" /> : null}
    </>
  );
}
