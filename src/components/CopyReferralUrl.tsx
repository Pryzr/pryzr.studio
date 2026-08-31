"use client";

import { useState } from "react";

export function CopyReferralUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Could not copy referral URL.", error);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <code className="min-w-0 flex-1 truncate border border-line bg-background px-3 py-3 text-sm text-foreground">
        {url}
      </code>
      <button
        className="border border-accent px-4 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-background"
        onClick={copyUrl}
        type="button"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
