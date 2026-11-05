"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

/** Skips login: creates a demo session for the given panel and jumps straight into the app. */
export function DemoButton({
  role = "principal",
  className = "",
  children,
}: {
  role?: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      className={className}
      onClick={async () => {
        setBusy(true);
        try {
          const res = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ role }),
          });
          if (!res.ok) throw new Error("failed");
          router.push(`/app/${role}`);
        } catch {
          setBusy(false);
        }
      }}
    >
      {busy ? "Entering…" : children}
    </button>
  );
}
