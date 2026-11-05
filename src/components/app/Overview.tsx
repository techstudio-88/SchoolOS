"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowUpRight, Database, Megaphone, Sparkles } from "lucide-react";
import { AreaChart, Donut, Sparkline } from "@/components/charts";
import { Counter, GlowCard, Particles } from "@/components/fx";
import { Icon } from "@/components/icons";
import { STATUSES } from "@/lib/catalog";

type Data = {
  byStatus: Record<string, number>;
  byModule: Record<string, number>;
  series: { label: string; value: number }[];
  recent: { id: number; title: string; person: string; status: string; moduleId: string; featureKey: string; createdAt: string }[];
  notices: { id: number; title: string; body: string }[];
  totalAmount: number;
};

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

function ago(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function Overview({
  panel,
  userName,
  featureCount,
  modules,
  data,
}: {
  panel: { id: string; title: string; tagline: string; color: string; icon: string };
  userName: string;
  featureCount: number;
  modules: { id: string; title: string; icon: string; color: string; blurb: string; features: number; count: number }[];
  data: Data;
}) {
  const router = useRouter();
  const [greet, setGreet] = useState("Welcome");
  const [seeding, setSeeding] = useState(false);
  useEffect(() => {
    const h = new Date().getHours();
    setGreet(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const total = Object.values(data.byStatus).reduce((a, b) => a + b, 0);
  const spark = data.series.map((s) => s.value);

  async function seed() {
    setSeeding(true);
    await fetch("/api/seed", { method: "POST" });
    router.refresh();
    setSeeding(false);
  }

  const kpis = [
    { label: "Total records", value: total, color: panel.color },
    ...STATUSES.map((s) => ({ label: s.label, value: data.byStatus[s.id] ?? 0, color: s.color })),
    { label: "Value tracked", value: data.totalAmount, color: "#f59e0b", prefix: "₹" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-7xl space-y-6">
      {/* Hero */}
      <motion.div variants={item} className="relative overflow-hidden rounded-[2rem] p-8 md:p-10" style={{ background: `linear-gradient(120deg, ${panel.color}38, #0a0c1c 55%, #22d3ee22)`, border: `1px solid ${panel.color}55`, boxShadow: `0 20px 80px -30px ${panel.color}` }}>
        <Particles count={18} />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-dashed border-white/15" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
              <Icon name={panel.icon} size={14} style={{ color: panel.color }} /> {panel.title} panel
            </div>
            <h1 className="font-display text-3xl font-bold text-white md:text-5xl">
              {greet}, <span className="text-gradient">{userName}</span>
            </h1>
            <p className="mt-3 max-w-xl text-slate-300">{panel.tagline}. Everything below is live from your school&apos;s database.</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {total === 0 && (
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={seed} disabled={seeding} className="btn-glow inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm">
                  <Database size={16} /> {seeding ? "Loading demo data…" : "Load demo data"}
                </motion.button>
              )}
              <span className="text-xs text-slate-400">Tip: press <kbd className="rounded bg-white/10 px-1.5 py-0.5">⌘K</kbd> to jump anywhere</span>
            </div>
          </div>
          <div className="glass rounded-3xl px-8 py-6 text-center">
            <div className="font-display text-6xl font-bold" style={{ color: panel.color, textShadow: `0 0 40px ${panel.color}` }}>
              <Counter to={featureCount} />
            </div>
            <div className="mt-1 text-xs uppercase tracking-widest text-slate-400">capabilities in your panel</div>
          </div>
        </div>
      </motion.div>

      {data.notices.length > 0 && (
        <motion.div variants={item} className="flex items-start gap-3 rounded-2xl border border-pink-400/30 bg-pink-500/10 p-4">
          <Megaphone size={18} className="mt-0.5 shrink-0 text-pink-300" />
          <div>
            <div className="text-sm font-semibold text-white">{data.notices[0].title}</div>
            {data.notices[0].body && <div className="text-sm text-slate-300">{data.notices[0].body}</div>}
          </div>
        </motion.div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <motion.div key={k.label} variants={item}>
            <GlowCard glow={k.color} className="rounded-2xl p-4">
              <div className="text-xs text-slate-400">{k.label}</div>
              <div className="font-display mt-1 text-3xl font-bold" style={{ color: k.color, textShadow: `0 0 24px ${k.color}88` }}>
                <Counter to={k.value} prefix={k.prefix ?? ""} duration={1.6} />
              </div>
              <Sparkline values={spark} color={k.color} />
            </GlowCard>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <motion.div variants={item}>
          <GlowCard glow={panel.color} className="rounded-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-white">Activity — last 14 days</h3>
                <p className="text-xs text-slate-500">New records created across your workspaces</p>
              </div>
              <Sparkles size={18} style={{ color: panel.color }} />
            </div>
            <AreaChart data={data.series} color={panel.color} height={210} />
          </GlowCard>
        </motion.div>
        <motion.div variants={item}>
          <GlowCard glow="#22d3ee" className="h-full rounded-3xl p-6">
            <h3 className="font-display text-lg font-bold text-white">Work status</h3>
            <p className="mb-4 text-xs text-slate-500">Where everything stands right now</p>
            <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col xl:flex-row">
              <Donut parts={STATUSES.map((s) => ({ label: s.label, value: data.byStatus[s.id] ?? 0, color: s.color }))} />
              <div className="w-full space-y-2.5">
                {STATUSES.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}` }} />
                    <span className="flex-1 text-slate-300">{s.label}</span>
                    <b className="text-white">{data.byStatus[s.id] ?? 0}</b>
                  </div>
                ))}
              </div>
            </div>
          </GlowCard>
        </motion.div>
      </div>

      {/* Workspaces */}
      <div>
        <motion.h2 variants={item} className="font-display mb-4 text-xl font-bold text-white">Your workspaces</motion.h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((m) => (
            <motion.div key={m.id} variants={item} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Link href={`/app/${panel.id}/${m.id}`}>
                <GlowCard glow={m.color} className="group relative overflow-hidden rounded-3xl p-5">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl transition group-hover:opacity-50" style={{ background: m.color }} />
                  <div className="relative flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition group-hover:scale-110 group-hover:rotate-6" style={{ background: `${m.color}2a`, boxShadow: `0 0 26px ${m.color}55` }}>
                      <Icon name={m.icon} size={22} style={{ color: m.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate font-display font-bold text-white">{m.title}</h3>
                        <ArrowUpRight size={16} className="shrink-0 text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                      </div>
                      <p className="mt-1 line-clamp-1 text-sm text-slate-400">{m.blurb}</p>
                      <div className="mt-3 flex items-center gap-3 text-xs">
                        <span className="rounded-full bg-white/5 px-2.5 py-1 text-slate-300">{m.features} features</span>
                        <span className="rounded-full px-2.5 py-1 font-semibold" style={{ background: `${m.color}22`, color: m.color }}>{m.count} records</span>
                      </div>
                    </div>
                  </div>
                </GlowCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent */}
      <motion.div variants={item}>
        <GlowCard glow="#ec4899" className="rounded-3xl p-6">
          <h3 className="font-display mb-4 text-lg font-bold text-white">Recent activity</h3>
          {data.recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Nothing yet. Open any workspace and add your first record — or load demo data above.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {data.recent.map((r, i) => {
                const st = STATUSES.find((s) => s.id === r.status) ?? STATUSES[0];
                return (
                  <motion.li key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.06 }}>
                    <Link href={`/app/${panel.id}/${r.moduleId}?feature=${encodeURIComponent(r.featureKey)}`} className="flex items-center gap-3 py-3 transition hover:translate-x-1">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: st.color, boxShadow: `0 0 10px ${st.color}` }} />
                      <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{r.title}</span>
                      <span className="hidden text-xs text-slate-500 sm:block">{r.person}</span>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${st.color}22`, color: st.color }}>{st.label}</span>
                      <span className="w-14 text-right text-xs text-slate-500">{ago(r.createdAt)}</span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </GlowCard>
      </motion.div>
    </motion.div>
  );
}
