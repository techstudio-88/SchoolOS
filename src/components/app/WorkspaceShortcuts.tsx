"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock3, Star } from "lucide-react";
import { MODULE_MAP } from "@/lib/catalog";

export function WorkspaceShortcuts({ panelId, base, pathname }: { panelId: string; base: string; pathname: string }) {
  const [pinned, setPinned] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    try {
      setPinned(JSON.parse(localStorage.getItem("schoolos:pinned:" + panelId) || "[]"));
      setRecent(JSON.parse(localStorage.getItem("schoolos:recent:" + panelId) || "[]"));
    } catch { setPinned([]); setRecent([]); }
  }, [panelId]);
  useEffect(() => {
    if (!pathname.startsWith(base)) return;
    setRecent((old) => {
      const next = [pathname, ...old.filter((p) => p !== pathname)].slice(0, 6);
      localStorage.setItem("schoolos:recent:" + panelId, JSON.stringify(next));
      return next;
    });
  }, [pathname, base, panelId]);
  const current = pathname.split("/").slice(4).join("/");
  const toggle = () => setPinned((old) => {
    const next = old.includes(pathname) ? old.filter((p) => p !== pathname) : [pathname, ...old].slice(0, 12);
    localStorage.setItem("schoolos:pinned:" + panelId, JSON.stringify(next));
    return next;
  });
  const label = (path: string) => {
    const parts = path.split("/");
    const moduleId = parts[3];
    const key = decodeURIComponent(parts[4] || "");
    const feature = MODULE_MAP[moduleId]?.features.find((f) => f.key === key);
    return feature?.name || MODULE_MAP[moduleId]?.title || "Overview";
  };
  const pinnedPaths = pinned.filter((p) => p.startsWith(base));
  const recentPaths = recent.filter((p) => p !== pathname && p.startsWith(base));
  return <div className="space-y-3 px-2 pb-3 pt-2">
    {current && <button onClick={toggle} className="flex w-full items-center gap-2 rounded-lg border border-white/[0.07] px-2.5 py-2 text-left text-[11px] text-slate-400 hover:bg-white/[0.05]">
      <Star size={12} className={pinned.includes(pathname) ? "fill-amber-300 text-amber-300" : ""} />
      {pinned.includes(pathname) ? "Remove from pinned" : "Pin current feature"}
    </button>}
    {pinnedPaths.length > 0 && <div>
      <div className="mb-1 flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-500"><Star size={11}/> Pinned</div>
      {pinnedPaths.map((p) => <Link key={p} href={p} className="block truncate rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 hover:bg-white/[.05]">{label(p)}</Link>)}
    </div>}
    {recentPaths.length > 0 && <div>
      <div className="mb-1 flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-500"><Clock3 size={11}/> Recent</div>
      {recentPaths.slice(0, 4).map((p) => <Link key={p} href={p} className="block truncate rounded-lg px-2.5 py-1.5 text-[11px] text-slate-400 hover:bg-white/[.05] hover:text-white">{label(p)}</Link>)}
    </div>}
  </div>;
}
