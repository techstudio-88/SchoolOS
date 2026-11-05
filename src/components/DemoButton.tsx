"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

export function DemoButton({ role = "principal", className = "", children }: { role?: string; className?: string; children: ReactNode }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function enterDemo() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role }),
        cache: "no-store",
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Demo could not start. Please try again.");
      router.replace(`/app/${role}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo could not start. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button type="button" disabled={busy} className={className} onClick={enterDemo}>
        {busy ? "Entering demo…" : children}
      </button>
      {error ? <p role="alert" className="max-w-xs text-center text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
