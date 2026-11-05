"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Suspense, useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { Counter, GlowCard } from "@/components/fx";
import { Icon } from "@/components/icons";
import { FeatureDrawer } from "./FeatureDrawer";

type Mod = {
  id: string;
  title: string;
  icon: string;
  color: string;
  blurb: string;
  features: { key: string; name: string; description: string }[];
};

export function ModuleView(props: { module: Mod; counts: Record<string, number>; disabled: string[] }) {
  return (
    <Suspense fallback={null}>
      <Inner {...props} />
    </Suspense>
  );
}

function Inner({ module: m, counts: initialCounts, disabled: initialDisabled }: { module: Mod; counts: Record<string, number>; disabled: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const selectedKey = params.get("feature");
  const selected = m.features.find((f) => f.key === selectedKey) ?? null;

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "used" | "off">("all");
  const [counts, setCounts] = useState(initialCounts);
  const [disabled, setDisabled] = useState(new Set(initialDisabled));

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

  const open = (key: string | null) => {
    const sp = new URLSearchParams(params.toString());
    if (key) sp.set("feature", key);
    else sp.delete("feature");
    router.replace(`${pathname}${sp.size ? `?${sp}` : ""}`, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] p-8 md:p-10"
        style={{ background: `linear-gradient(120deg, ${m.color}33, #0a0c1c 60%)`, border: `1px solid ${m.color}55`, boxShadow: `0 20px 80px -30px ${m.color}` }}
      >
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-30 blur-3xl" style={{ background: m.color }} />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
            className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl"
            style={{ background: `${m.color}2e`, boxShadow: `0 0 50px ${m.color}77` }}
          >
            <Icon name={m.icon} size={36} style={{ color: m.color }} />
          </motion.div>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold text-white md:text-4xl">{m.title}</h1>
            <p className="mt-1 text-slate-300">{m.blurb}</p>
          </div>
          <div className="flex gap-3">
            {[
              ["Features", m.features.length],
              ["In use", activeFeatures],
              ["Records", totalRecords],
            ].map(([l, v]) => (
              <div key={String(l)} className="glass min-w-[84px] rounded-2xl px-4 py-3 text-center">
                <div className="font-display text-2xl font-bold" style={{ color: m.color }}><Counter to={Number(v)} duration={1.2} /></div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input !pl-10" placeholder={`Search ${m.features.length} features in ${m.title}…`} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="glass flex rounded-xl p-1">
          {(["all", "used", "off"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className="relative rounded-lg px-4 py-2 text-sm capitalize text-slate-300 transition hover:text-white">
              {filter === f && <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-lg" style={{ background: `${m.color}33`, boxShadow: `0 0 20px ${m.color}44` }} />}
              <span className={`relative ${filter === f ? "font-semibold text-white" : ""}`}>{f === "used" ? "In use" : f === "off" ? "Switched off" : "All"}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((f, i) => {
            const n = counts[f.key] ?? 0;
            const off = disabled.has(f.key);
            return (
              <motion.div
                key={f.key}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: Math.min(i, 12) * 0.035, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -5 }}
              >
                <button onClick={() => open(f.key)} className="block w-full text-left">
                  <GlowCard glow={m.color} className={`group relative h-full overflow-hidden rounded-2xl p-5 ${off ? "opacity-50" : ""}`}>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-display text-xs font-bold tabular-nums" style={{ color: m.color }}>{String(m.features.indexOf(f) + 1).padStart(2, "0")}</span>
                      <span className="flex items-center gap-2 text-[11px]">
                        {n > 0 && <span className="rounded-full px-2 py-0.5 font-semibold" style={{ background: `${m.color}22`, color: m.color }}>{n}</span>}
                        <span className={`h-2 w-2 rounded-full ${off ? "bg-slate-600" : "bg-emerald-400 shadow-[0_0_10px_#34d399]"}`} />
                      </span>
                    </div>
                    <h3 className="font-display font-bold leading-snug text-white">{f.name}</h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">{f.description}</p>
                    <div className="mt-4 flex items-center text-xs font-medium opacity-0 transition group-hover:opacity-100" style={{ color: m.color }}>
                      Open workspace <ChevronRight size={14} className="transition group-hover:translate-x-1" />
                    </div>
                  </GlowCard>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="py-16 text-center text-slate-500">No features match your search.</p>}

      <AnimatePresence>
        {selected && (
          <FeatureDrawer
            key={selected.key}
            feature={selected}
            moduleTitle={m.title}
            color={m.color}
            icon={m.icon}
            onClose={() => open(null)}
            onChange={(count, enabled) => {
              setCounts((c) => ({ ...c, [selected.key]: count }));
              setDisabled((d) => {
                const n = new Set(d);
                if (enabled) n.delete(selected.key);
                else n.add(selected.key);
                return n;
              });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
