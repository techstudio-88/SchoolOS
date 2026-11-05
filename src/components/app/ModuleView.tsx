"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Suspense, useMemo, useState } from "react";
import { ChevronRight, Search, ArrowUpRight, ListFilter } from "lucide-react";
import { Counter } from "@/components/fx";
import { Icon } from "@/components/icons";

type Mod = {
  id: string; title: string; icon: string; color: string; blurb: string;
  features: { key: string; name: string; description: string }[];
};

const PANEL_LAYOUT: Record<string, string> = {
  owner: "ledger", principal: "command", "vice-principal": "agenda", manager: "operations",
  teacher: "planner", "exam-controller": "exam", accountant: "finance", hr: "people",
  admissions: "pipeline", receptionist: "queue", librarian: "catalogue", transport: "routes",
  warden: "occupancy", nurse: "wellbeing", storekeeper: "stock", "it-admin": "systems",
  student: "learning", parent: "family",
};

const LAYOUT_LABEL: Record<string, string> = {
  ledger: "Control register", command: "Academic command", agenda: "Daily agenda", operations: "Operations board",
  planner: "Teaching planner", exam: "Assessment register", finance: "Finance register", people: "People directory",
  pipeline: "Admissions pipeline", queue: "Front desk queue", catalogue: "Library catalogue", routes: "Route index",
  occupancy: "Boarding overview", wellbeing: "Care register", stock: "Stock register", systems: "Systems console",
  learning: "Learning workspace", family: "Family view",
};

export function ModuleView(props: { module: Mod; counts: Record<string, number>; disabled: string[]; panelId: string }) {
  return <Suspense fallback={null}><Inner {...props} /></Suspense>;
}

function Inner({ module: m, counts: initialCounts, disabled: initialDisabled, panelId }: {
  module: Mod; counts: Record<string, number>; disabled: string[]; panelId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "used" | "off">("all");
  const [counts, setCounts] = useState(initialCounts);
  const [disabled, setDisabled] = useState(new Set(initialDisabled));
  const layout = PANEL_LAYOUT[panelId] ?? "command";
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return m.features.filter((f) => {
      if (s && !f.name.toLowerCase().includes(s)) return false;
      if (filter === "used") return (counts[f.key] ?? 0) > 0;
      if (filter === "off") return disabled.has(f.key);
      return true;
    });
  }, [m.features, q, filter, counts, disabled]);
  const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);
  const activeFeatures = Object.values(counts).filter((n) => n > 0).length;
  const open = (key: string) => {
    router.push(`${pathname}/${encodeURIComponent(key)}`);
  };

  const featureButton = (f: Mod["features"][number], i: number, variant: "row" | "tile" | "number" = "row") => {
    const n = counts[f.key] ?? 0;
    const off = disabled.has(f.key);
    return (
      <motion.button key={f.key} layout onClick={() => open(f.key)}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(i, 10) * 0.025 }}
        className={`group w-full text-left transition hover:bg-white/[0.055] ${variant === "tile" ? "rounded-2xl border border-white/[0.08] p-4" : "border-b border-white/[0.07] px-3 py-3"} ${off ? "opacity-50" : ""}`}>
        <div className="flex items-center gap-3">
          {variant === "number" ? <span className="w-8 shrink-0 font-mono text-xs" style={{ color: m.color }}>{String(i + 1).padStart(2, "0")}</span> :
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${m.color}20`, color: m.color }}><Icon name={m.icon} size={15} /></span>}
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-slate-100">{f.name}</span>
            {variant !== "row" && <span className="mt-1 block text-xs leading-relaxed text-slate-500">{f.description}</span>}
          </span>
          <span className="flex shrink-0 items-center gap-2 text-xs">
            {n > 0 && <b style={{ color: m.color }}>{n} records</b>}
            <span className={`h-2 w-2 rounded-full ${off ? "bg-slate-600" : "bg-emerald-400"}`} />
            <ChevronRight size={15} className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-white" />
          </span>
        </div>
        {variant === "row" && <p className="ml-11 mt-1 line-clamp-1 text-xs text-slate-500">{f.description}</p>}
      </motion.button>
    );
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl" style={{ background: `${m.color}20`, border: `1px solid ${m.color}55`, color: m.color }}>
            <Icon name={m.icon} size={27} />
          </div>
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[.22em]" style={{ color: m.color }}>{LAYOUT_LABEL[layout]} · {m.features.length} tools</div>
            <h1 className="font-display text-2xl font-bold text-white md:text-3xl">{m.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">{m.blurb}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-5 border-l border-white/10 pl-5">
          <div><div className="font-display text-2xl font-bold text-white"><Counter to={activeFeatures} /></div><div className="text-[10px] uppercase tracking-wider text-slate-500">In use</div></div>
          <div><div className="font-display text-2xl font-bold text-white"><Counter to={totalRecords} /></div><div className="text-[10px] uppercase tracking-wider text-slate-500">Records</div></div>
          <div><div className="font-display text-2xl font-bold" style={{ color: m.color }}><Counter to={m.features.length} /></div><div className="text-[10px] uppercase tracking-wider text-slate-500">Available</div></div>
        </div>
      </motion.header>

      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input !pl-10" placeholder={`Search ${m.title}…`} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          <ListFilter size={15} className="mx-2 text-slate-500" />
          {(["all", "used", "off"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className="rounded-lg px-3 py-2 text-xs capitalize transition"
              style={{ background: filter === f ? `${m.color}26` : "transparent", color: filter === f ? m.color : "#94a3b8" }}>
              {f === "used" ? "In use" : f === "off" ? "Disabled" : "All tools"}
            </button>
          ))}
        </div>
      </div>

      {layout === "ledger" || layout === "exam" || layout === "finance" || layout === "stock" || layout === "systems" ? (
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#090c19]/70">
          <div className="grid grid-cols-[42px_minmax(0,1fr)_120px] gap-3 border-b border-white/10 bg-white/[0.035] px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            <span>No.</span><span>Workflow / capability</span><span className="text-right">Activity</span>
          </div>
          {list.map((f, i) => <div key={f.key} className="grid grid-cols-[42px_minmax(0,1fr)_120px] items-center gap-3">
            <span className="pl-4 font-mono text-xs" style={{ color: m.color }}>{String(i + 1).padStart(2, "0")}</span>
            <div className="min-w-0">{featureButton(f, i, "row")}</div>
            <span className="pr-4 text-right text-xs text-slate-500">{counts[f.key] ?? 0} records</span>
          </div>)}
        </section>
      ) : layout === "pipeline" || layout === "operations" || layout === "routes" || layout === "occupancy" ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {["Core workflows", "Daily operations", "Monitoring & review"].map((group, gi) => {
            const chunk = list.filter((_, i) => i % 3 === gi);
            return <div key={group} className="min-h-48 rounded-2xl border border-white/10 bg-white/[0.025]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h2 className="text-sm font-semibold text-white">{group}</h2><span className="text-xs text-slate-500">{chunk.length}</span>
              </div>
              {chunk.map((f) => featureButton(f, m.features.indexOf(f), "row"))}
            </div>;
          })}
        </section>
      ) : layout === "agenda" || layout === "queue" || layout === "wellbeing" || layout === "family" ? (
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,.7fr)]">
          <div className="rounded-2xl border border-white/10 bg-[#090c19]/60 p-2">
            <div className="flex items-center justify-between px-3 py-3"><h2 className="font-semibold text-white">Work queue</h2><span className="text-xs text-slate-500">Select an item to open its workspace</span></div>
            {list.map((f, i) => featureButton(f, i, "row"))}
          </div>
          <aside className="h-fit border-l border-white/10 pl-5">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">At a glance</div>
            <div className="mt-4 space-y-4">
              <div><div className="font-display text-3xl font-bold text-white">{list.length}</div><div className="text-xs text-slate-500">Matching workflows</div></div>
              <div><div className="font-display text-3xl font-bold" style={{ color: m.color }}>{activeFeatures}</div><div className="text-xs text-slate-500">Workflows with activity</div></div>
              <div className="text-sm leading-relaxed text-slate-400">Use search and status filters to narrow the list. Open any workflow to add, review, update or export its records.</div>
            </div>
          </aside>
        </section>
      ) : layout === "people" || layout === "catalogue" || layout === "learning" ? (
        <section className="grid gap-x-8 md:grid-cols-2">
          {list.map((f, i) => featureButton(f, i, "number"))}
        </section>
      ) : layout === "planner" || layout === "command" ? (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {list.map((f, i) => featureButton(f, i, "tile"))}
        </section>
      ) : (
        <section className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.6fr)]">
          <div className="border-l-2 pl-4" style={{ borderColor: m.color }}>
            {list.map((f, i) => featureButton(f, i, "row"))}
          </div>
          <aside className="hidden border-l border-white/10 pl-6 lg:block">
            <div className="sticky top-24"><div className="text-xs uppercase tracking-widest text-slate-500">Module guide</div>
              <p className="mt-3 text-lg font-semibold text-white">{m.title}</p><p className="mt-2 text-sm leading-relaxed text-slate-400">{m.blurb}</p>
              <div className="mt-6 text-4xl font-bold" style={{ color: m.color }}>{list.length}</div><div className="text-xs text-slate-500">available workflows</div>
              <div className="mt-6 flex items-center gap-2 text-xs" style={{ color: m.color }}>Choose a workflow <ArrowUpRight size={14} /></div>
            </div>
          </aside>
        </section>
      )}

      {list.length === 0 && <p className="py-16 text-center text-sm text-slate-500">No workflows match those filters.</p>}
    </div>
  );
}
