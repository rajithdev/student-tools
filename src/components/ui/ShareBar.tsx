"use client";

import { useState } from "react";
import { Button } from "./Field";
import { track } from "@/lib/analytics";

/** Copy link / copy text / native share. Works on the current URL (which carries the calculator state). */
export function ShareBar({ text, onReset }: { text: string; onReset?: () => void }) {
  const [msg, setMsg] = useState<string | null>(null);

  function flash(m: string) {
    setMsg(m);
    window.setTimeout(() => setMsg(null), 1800);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flash("Link copied");
      track("share", { method: "copy_link" });
    } catch {
      flash("Copy failed");
    }
  }
  async function copyText() {
    try {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      flash("Result copied");
      track("share", { method: "copy_text" });
    } catch {
      flash("Copy failed");
    }
  }
  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ text, url: window.location.href });
        track("share", { method: "native" });
      } catch {}
    } else copyLink();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={share}>Share</Button>
      <Button onClick={copyLink}>Copy link</Button>
      <Button onClick={copyText} variant="ghost">
        Copy result
      </Button>
      {onReset ? (
        <Button onClick={onReset} variant="ghost">
          Reset
        </Button>
      ) : null}
      <span role="status" aria-live="polite" className="text-sm text-fg-muted">
        {msg}
      </span>
    </div>
  );
}
