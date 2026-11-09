"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bell, ChevronsLeft, ChevronsRight, CornerDownLeft, LayoutDashboard, LogOut, Menu, Repeat, Search, X,
} from "lucide-react";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/landing/Hero";
import { MODULE_MAP, PANELS, TOTAL_FEATURES } from "@/lib/catalog";
import { WorkspaceShortcuts } from "@/components/app/WorkspaceShortcuts";

type PanelLite = { id: string; title: string; tagline: string; icon: string; color: string };
type ModLite = { id: string; title: string; icon: string; color: string; count: number; features: number };
type Notice = { id: number | string; title: string; body: string; kind?: string };

export function AppShell({
  panel,
  modules,
  userName,
  notices,
  schoolName,
  children,
}: {
  panel: PanelLite;
  modules: ModLite[];
  userName: string;
  notices: Notice[];
  schoolName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [palette, setPalette] = useState(false);
  const [menu, setMenu] = useState<null | "panels" | "bell" | "user">(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [sidebarQuery, setSidebarQuery] = useState("");
  const [activityNotices, setActivityNotices] = useState<Notice[]>([]);
  const allNotices = [...activityNotices, ...notices];
  const base = `/app/${panel.id}`;

  useEffect(() => setMobile(false), [pathname]);
  useEffect(() => {
    let active = true;
    fetch("/api/notifications", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((data) => {
      if (active && data?.notifications) setActivityNotices(data.notifications);
    }).catch(() => {});
    return () => { active = false; };
  }, [pathname]);
  useEffect(() => {
    const activeModule = pathname.split("/")[3];
    setExpandedModule(activeModule && MODULE_MAP[activeModule] ? activeModule : null);
  }, [pathname]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      }
      if (e.key === "Escape") {
        setPalette(false);
        setMenu(null);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const switchPanel = useCallback(
    async (role: string) => {
      setMenu(null);
      await fetch("/api/auth/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ role, name: userName }) });
      router.push(`/app/${role}`);
      router.refresh();
    },
    [router, userName],
  );

  const logout = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/");
  };

  const w = collapsed ? 84 : 288;
  const crumb = pathname.split("/")[3];
  const crumbTitle = crumb ? MODULE_MAP[crumb]?.title : "Overview";

  const Sidebar = (
    <LayoutGroup id="nav">
      <div className="flex h-full flex-col">
        <div className="flex h-[72px] shrink-0 items-center justify-between px-5">
          <Link href="/">{collapsed ? <Logo size={36} /> : <Logo />}</Link>
        </div>
        <div className="px-3">
          <div
            className="relative overflow-hidden rounded-2xl p-3"
            style={{ background: `linear-gradient(135deg, ${panel.color}33, ${panel.color}08)`, border: `1px solid ${panel.color}55`, boxShadow: `0 0 30px ${panel.color}22` }}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${panel.color}33`, boxShadow: `0 0 20px ${panel.color}66` }}>
                <Icon name={panel.icon} size={20} style={{ color: panel.color }} />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <div className="truncate font-display text-sm font-bold text-white">{panel.title} Panel</div>
                  <div className="truncate text-[11px] text-slate-400">{schoolName}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-6">
          {[{ href: base, id: "", title: "Overview", icon: "LayoutDashboard", color: panel.color, count: 0, features: TOTAL_FEATURES }].map((item) => {
            const active = pathname === base;
            return (
              <Link key={item.href} href={item.href} className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5">
                {active && <motion.span layoutId="active-pill" className="absolute inset-0 rounded-xl" style={{ background: `linear-gradient(90deg, ${panel.color}40, transparent)`, boxShadow: `inset 2px 0 0 ${panel.color}` }} transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <LayoutDashboard size={18} className="relative shrink-0" style={{ color: active ? panel.color : "#94a3b8" }} />
                {!collapsed && <span className={`relative ${active ? "font-semibold text-white" : "text-slate-300"}`}>Overview</span>}
              </Link>
            );
          })}
          {!collapsed && <WorkspaceShortcuts panelId={panel.id} base={base} pathname={pathname} />}
          {!collapsed && (
            <div className="px-2 pb-2 pt-4">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Workspaces</span>
                <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] text-slate-400">{modules.reduce((n, m) => n + (MODULE_MAP[m.id]?.features.length ?? 0), 0)}</span>
              </div>
              <div className="relative">
                <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={sidebarQuery} onChange={(e) => setSidebarQuery(e.target.value)} placeholder="Search features…" className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] py-2 pl-8 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-violet-400/40" />
              </div>
            </div>
          )}
          {modules.filter((m) => {
            const q = sidebarQuery.trim().toLowerCase();
            const fs = MODULE_MAP[m.id]?.features ?? [];
            return !q || m.title.toLowerCase().includes(q) || fs.some((f) => f.name.toLowerCase().includes(q));
          }).map((m, i) => {
            const href = `${base}/${m.id}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const featureList = MODULE_MAP[m.id]?.features ?? [];
            const q = sidebarQuery.trim().toLowerCase();
            const visibleFeatures = q ? featureList.filter((f) => f.name.toLowerCase().includes(q)) : featureList;
            const expanded = !collapsed && (q ? visibleFeatures.length > 0 : expandedModule === m.id);
            return (
              <motion.div key={m.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.025 * i, duration: 0.35 }}>
                <div className="group relative flex items-center rounded-xl transition hover:bg-white/5">
                  <Link href={href} title={m.title} className="relative flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-sm">
                    {active && <motion.span layoutId="active-pill" className="absolute inset-0 rounded-xl" style={{ background: `linear-gradient(90deg, ${m.color}30, transparent)`, boxShadow: `inset 2px 0 0 ${m.color}` }} transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                    <Icon name={m.icon} size={18} className="relative shrink-0 transition group-hover:scale-110" style={{ color: active ? m.color : "#94a3b8" }} />
                    {!collapsed && <span className={`relative min-w-0 flex-1 truncate ${active ? "font-semibold text-white" : "text-slate-300"}`}>{m.title}</span>}
                  </Link>
                  {!collapsed && (
                    <button type="button" aria-label={`Show ${m.title} features`} aria-expanded={expanded} onClick={() => setExpandedModule(expandedModule === m.id ? null : m.id)} className="relative mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/10 hover:text-white">
                      <span className="text-[10px] tabular-nums">{featureList.length}</span>
                      <motion.span animate={{ rotate: expanded ? 90 : 0 }} className="absolute -right-0.5 top-0.5"><ChevronsRight size={11} /></motion.span>
                    </button>
                  )}
                </div>
                {!collapsed && expanded && (
                  <div className="mb-2 ml-[21px] border-l border-white/[0.09] pl-3">
                    {visibleFeatures.map((feature) => (
                      <Link key={feature.key} href={`${href}/${encodeURIComponent(feature.key)}`} title={feature.description} className="my-0.5 flex items-start gap-2 rounded-lg px-2.5 py-2 text-[11px] leading-snug text-slate-400 transition hover:bg-white/[0.05] hover:text-slate-200">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{ background: m.color }} />
                        <span>{feature.name}</span>
                      </Link>
                    ))}
                    {visibleFeatures.length === 0 && <div className="px-2 py-2 text-[11px] text-slate-600">No matching features</div>}
                  </div>
                )}
              </motion.div>
            );
          })}
        </nav>
      </div>
    </LayoutGroup>
  );

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="aurora absolute inset-0 opacity-40" />
        <motion.div animate={{ backgroundColor: panel.color }} transition={{ duration: 1.2 }} className="animate-blob absolute -right-40 -top-40 h-[34rem] w-[34rem] opacity-[0.12] blur-[130px]" />
      </div>

      {/* Desktop sidebar */}
      <aside style={{ width: w }} className="fixed inset-y-0 left-0 z-40 hidden border-r border-white/[0.07] bg-[#070916]/80 backdrop-blur-xl transition-[width] duration-300 ease-out lg:block">
        {Sidebar}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobile && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobile(false)} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" />
            <motion.aside initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: "spring", stiffness: 300, damping: 32 }} className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-[#070916] lg:hidden">
              <button onClick={() => setMobile(false)} className="absolute right-3 top-5 z-10 text-slate-400"><X size={20} /></button>
              {Sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10 min-w-0">
        <div className={`min-h-screen transition-[margin] duration-300 ease-out ${collapsed ? "lg:ml-[84px]" : "lg:ml-72"}`}>
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-white/[0.07] bg-[#05060f]/70 px-4 backdrop-blur-xl md:px-8">
            <button onClick={() => setMobile(true)} className="rounded-xl p-2 text-slate-300 hover:bg-white/5 lg:hidden" aria-label="Open menu"><Menu size={20} /></button>
            <button onClick={() => setCollapsed((v) => !v)} className="hidden rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:block" aria-label="Collapse sidebar">
              {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            </button>
            <div className="hidden min-w-0 sm:block">
              <div className="text-[11px] uppercase tracking-widest text-slate-500">{panel.title}</div>
              <div className="truncate font-display text-lg font-bold text-white">{crumbTitle}</div>
            </div>
            <button onClick={() => setPalette(true)} className="glass ml-auto flex w-full max-w-sm items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-slate-400 transition hover:border-violet-400/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.25)] sm:ml-6 sm:flex-1">
              <Search size={16} />
              <span className="flex-1 text-left">Search {TOTAL_FEATURES}+ capabilities…</span>
              <kbd className="hidden rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] md:block">⌘K</kbd>
            </button>

            <div className="relative">
              <button onClick={() => setMenu(menu === "panels" ? null : "panels")} className="glass flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition hover:bg-white/10" title="Switch panel (demo)">
                <Repeat size={16} style={{ color: panel.color }} /> <span className="hidden md:block">Switch panel</span>
              </button>
              <Dropdown open={menu === "panels"} close={() => setMenu(null)} className="w-72 p-2">
                <div className="max-h-[60vh] overflow-y-auto">
                  {PANELS.map((p) => (
                    <button key={p.id} onClick={() => switchPanel(p.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white/5">
                      <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${p.color}2a` }}><Icon name={p.icon} size={16} style={{ color: p.color }} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-white">{p.title}</span>
                        <span className="block truncate text-[11px] text-slate-500">{p.tagline}</span>
                      </span>
                      {p.id === panel.id && <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />}
                    </button>
                  ))}
                </div>
              </Dropdown>
            </div>

            <div className="relative">
              <button onClick={() => setMenu(menu === "bell" ? null : "bell")} className="glass relative rounded-xl p-2.5 text-slate-300 hover:bg-white/10" aria-label="Notifications">
                <Bell size={18} />
                {allNotices.length > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-pink-500 shadow-[0_0_10px_#ec4899]" />}
              </button>
              <Dropdown open={menu === "bell"} close={() => setMenu(null)} className="w-80 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Platform notices</div>
                {allNotices.length === 0 && <p className="p-3 text-sm text-slate-500">You&apos;re all caught up ✨</p>}
                {allNotices.map((n) => (
                  <div key={n.id} className="mb-2 rounded-xl bg-white/5 p-3">
                    <div className="text-sm font-medium text-white">{n.title}</div>
                    {n.body && <div className="mt-1 text-xs text-slate-400">{n.body}</div>}
                  </div>
                ))}
              </Dropdown>
            </div>

            <div className="relative">
              <button onClick={() => setMenu(menu === "user" ? null : "user")} className="grid h-10 w-10 place-items-center rounded-xl font-display text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${panel.color}, #0ea5e9)`, boxShadow: `0 0 22px ${panel.color}77` }}>
                {userName.slice(0, 1).toUpperCase()}
              </button>
              <Dropdown open={menu === "user"} close={() => setMenu(null)} className="w-60 p-2">
                <div className="px-3 py-2">
                  <div className="text-sm font-semibold text-white">{userName}</div>
                  <div className="text-xs text-slate-500">{panel.title} · demo session</div>
                </div>
                <Link href="/" className="block rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/5">Back to website</Link>
                <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-500/10"><LogOut size={15} /> Sign out</button>
              </Dropdown>
            </div>
          </header>

          <main className="p-4 pb-24 md:p-8 md:pb-8">
            <PageTransition k={pathname}>{children}</PageTransition>
          </main>
        </div>
      </div>

      {/* Native-app style quick navigation on phones */}
      <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#080b16]/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur-2xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
          <Link href={base} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] ${pathname === base ? "text-white" : "text-slate-500"}`}>
            <LayoutDashboard size={19} style={{ color: pathname === base ? panel.color : undefined }} />
            <span>Home</span>
          </Link>
          {modules.slice(0, 2).map((m) => {
            const active = pathname.startsWith(`${base}/${m.id}`);
            return <Link key={m.id} href={`${base}/${m.id}`} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] ${active ? "text-white" : "text-slate-500"}`}>
              <Icon name={m.icon} size={19} style={{ color: active ? m.color : undefined }} />
              <span className="max-w-full truncate">{m.title.split(/[& ]/)[0]}</span>
            </Link>;
          })}
          <button onClick={() => setMobile(true)} className="flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] text-slate-500">
            <Menu size={19} />
            <span>All tools</span>
          </button>
        </div>
      </nav>

      <CommandPalette open={palette} onClose={() => setPalette(false)} panel={panel} modules={modules} onSwitch={switchPanel} />
    </div>
  );
}

function PageTransition({ k, children }: { k: string; children: ReactNode }) {
  return (
    <motion.div key={k} initial={{ opacity: 0, y: 24, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

function Dropdown({ open, close, className = "", children }: { open: boolean; close: () => void; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.parentElement?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, close]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div ref={ref} initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2 }} className={`glass absolute right-0 top-14 z-50 rounded-2xl bg-[#0a0c1c]/95 shadow-2xl ${className}`}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CommandPalette({ open, onClose, panel, modules, onSwitch }: { open: boolean; onClose: () => void; panel: PanelLite; modules: ModLite[]; onSwitch: (id: string) => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  type Item = { id: string; label: string; hint: string; icon: string; color: string; run: () => void };
  const all = useMemo<Item[]>(() => {
    const items: Item[] = [];
    for (const m of modules) {
      const mod = MODULE_MAP[m.id];
      items.push({ id: `m-${m.id}`, label: m.title, hint: "Workspace", icon: m.icon, color: m.color, run: () => router.push(`/app/${panel.id}/${m.id}`) });
      for (const f of mod.features) {
        items.push({ id: f.key, label: f.name, hint: m.title, icon: m.icon, color: m.color, run: () => router.push(`/app/${panel.id}/${m.id}/${encodeURIComponent(f.key)}`) });
      }
    }
    for (const p of PANELS) items.push({ id: `p-${p.id}`, label: `Switch to ${p.title} panel`, hint: "Panel", icon: p.icon, color: p.color, run: () => onSwitch(p.id) });
    return items;
  }, [modules, panel.id, router, onSwitch]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return all.filter((i) => i.id.startsWith("m-")).slice(0, 8).concat(all.filter((i) => i.id.startsWith("p-")).slice(0, 3));
    return all.filter((i) => i.label.toLowerCase().includes(s) || i.hint.toLowerCase().includes(s)).slice(0, 40);
  }, [q, all]);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);
  useEffect(() => setIdx(0), [q]);

  const go = (i: Item | undefined) => {
    if (!i) return;
    onClose();
    i.run();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-md" onClick={onClose}>
          <motion.div initial={{ opacity: 0, y: -30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -30, scale: 0.95 }} transition={{ type: "spring", stiffness: 380, damping: 30 }} onClick={(e) => e.stopPropagation()} className="spin-border w-full max-w-2xl">
            <div className="spin-inner overflow-hidden">
              <div className="flex items-center gap-3 border-b border-white/10 px-5">
                <Search size={18} className="text-violet-300" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((v) => Math.min(results.length - 1, v + 1)); }
                    if (e.key === "ArrowUp") { e.preventDefault(); setIdx((v) => Math.max(0, v - 1)); }
                    if (e.key === "Enter") go(results[idx]);
                  }}
                  placeholder="Search workspaces, features, panels…"
                  className="w-full bg-transparent py-4 text-base text-white outline-none placeholder:text-slate-500"
                />
                <kbd className="rounded-md bg-white/10 px-2 py-1 text-[10px] text-slate-400">ESC</kbd>
              </div>
              <div className="max-h-[50vh] overflow-y-auto p-2">
                {results.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Nothing found for “{q}”.</p>}
                {results.map((r, i) => (
                  <button key={r.id} onMouseEnter={() => setIdx(i)} onClick={() => go(r)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${i === idx ? "bg-white/[0.08]" : ""}`}>
                    <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${r.color}2a` }}><Icon name={r.icon} size={16} style={{ color: r.color }} /></span>
                    <span className="flex-1 text-sm text-white">{r.label}</span>
                    <span className="text-xs text-slate-500">{r.hint}</span>
                    {i === idx && <CornerDownLeft size={14} className="text-slate-400" />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
