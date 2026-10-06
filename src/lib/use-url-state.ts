"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Primitive = string | number | boolean | undefined;
type State = Record<string, Primitive>;

/**
 * Keeps calculator state in the URL query string so results are bookmarkable and shareable.
 * - Reads once on mount (static export has no server-side search params).
 * - Writes with history.replaceState (debounced) so the back button is not polluted.
 * - Only keys that differ from `defaults` are written, keeping URLs short.
 */
export function useUrlState<T extends State>(defaults: T, parse: (params: URLSearchParams) => Partial<T>) {
  const [state, setState] = useState<T>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  // Hydrate from the query string once after mount. The static HTML cannot know the URL, so one
  // extra render on mount is unavoidable and intended.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if ([...params.keys()].length) {
        const parsed = Object.fromEntries(Object.entries(parse(params)).filter(([, v]) => v !== undefined)) as Partial<T>;
        setState((s) => ({ ...s, ...parsed }));
      }
    } catch {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(state)) {
        if (v === undefined || v === "" || v === defaults[k]) continue;
        params.set(k, String(v));
      }
      const qs = params.toString();
      const url = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
      if (url !== window.location.pathname + window.location.search + window.location.hash) {
        window.history.replaceState(null, "", url);
      }
    }, 250);
    return () => window.clearTimeout(timer.current);
  }, [state, hydrated, defaults]);

  const update = useCallback((patch: Partial<T>) => setState((s) => ({ ...s, ...patch })), []);
  const reset = useCallback(() => setState(defaults), [defaults]);

  return { state, update, reset, hydrated } as const;
}

export function num(params: URLSearchParams, key: string): string | undefined {
  const v = params.get(key);
  if (v === null) return undefined;
  return /^-?\d*\.?\d*$/.test(v) && v !== "" ? v : undefined;
}
