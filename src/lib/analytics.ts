/**
 * Minimal, provider-agnostic event tracking. Nothing is sent unless a provider is configured via env.
 * Events never include the numbers a user typed — only which tool was used and coarse outcomes.
 */

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, opts?: { props?: Props }) => void;
    umami?: { track: (event: string, data?: Props) => void };
  }
}

export function track(event: string, props: Props = {}): void {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, props);
    window.plausible?.(event, { props });
    window.umami?.track(event, props);
  } catch {
    /* analytics must never break the page */
  }
}

/** Debounced "calculator used" tracker: fires once per tool per page view. */
const fired = new Set<string>();
export function trackCalculatorUse(tool: string, props: Props = {}): void {
  if (fired.has(tool)) return;
  fired.add(tool);
  track("calculator_use", { tool, ...props });
}
