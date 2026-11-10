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
    <motion.div variants={container} initial="hidden" animate="show" className="schoolos-overview mx-auto max-w-7xl space-y-6">
      <div className="schoolos-overview-main space-y-6">
      {/* Hero */}
      <motion.div variants={item} className="schoolos-hero relative overflow-hidden rounded-[2rem] p-8 md:p-10" style={{ background: `linear-gradient(120deg, ${panel.color}38, #0a0c1c 55%, #22d3ee22)`, border: `1px solid ${panel.color}55`, boxShadow: `0 20px 80px -30px ${panel.color}` }}>
        <Particles count={18} />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-dashed border-white/15" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
              <Icon name={panel.icon} size={14} style={{ color: panel.color }} /> {panel.title} panel
            </div>
            <h1 className="font-display text-3xl font-bold text-white md:text-5xl">
              {greet}, <span className="text-[#5367d9]">{userName}</span>
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
            <div className="font-display text-6xl font-bold" style={{ color: panel.color }}>
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
            <GlowCard glow={k.color} className="schoolos-stat rounded-2xl p-4">
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
          <GlowCard glow={panel.color} className="schoolos-panel rounded-3xl p-6">
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
          <GlowCard glow="#22d3ee" className="schoolos-panel h-full rounded-3xl p-6">
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

      {/* Role-specific workspace layout */}
      <WorkspaceDeck panelId={panel.id} panelColor={panel.color} modules={modules} />
      
      {/* Recent */}
      <motion.div variants={item}>
        <GlowCard glow="#ec4899" className="schoolos-panel rounded-3xl p-6">
          <h3 className="font-display mb-4 text-lg font-bold text-white">Recent activity</h3>
          {data.recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Nothing yet. Open any workspace and add your first record — or load demo data above.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {data.recent.map((r, i) => {
                const st = STATUSES.find((s) => s.id === r.status) ?? STATUSES[0];
                return (
                  <motion.li key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.06 }}>
                    <Link href={`/app/${panel.id}/${r.moduleId}/${encodeURIComponent(r.featureKey)}`} className="flex items-center gap-3 py-3 transition hover:translate-x-1">
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
      </div>
      <aside className="schoolos-overview-rail space-y-4">
        <section className="schoolos-panel rounded-[26px] p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-100 to-sky-100 text-lg font-bold text-indigo-600">{userName.slice(0,1).toUpperCase()}</div>
            <div className="min-w-0"><div className="truncate text-sm font-semibold text-slate-800">{userName}</div><div className="text-xs text-slate-500">{panel.title}</div></div>
          </div>
          <div className="my-4 h-px bg-slate-100" />
          <div className="text-xs font-semibold text-slate-700">Your school at a glance</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-indigo-50 p-3"><div className="text-xl font-bold text-indigo-700">{total.toLocaleString("en-IN")}</div><div className="text-[10px] text-indigo-500">Records</div></div>
            <div className="rounded-2xl bg-sky-50 p-3"><div className="text-xl font-bold text-sky-700">{featureCount.toLocaleString("en-IN")}</div><div className="text-[10px] text-sky-600">Tools</div></div>
          </div>
        </section>
        <section className="schoolos-panel rounded-[26px] p-5">
          <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-800">Quick access</h3><Sparkles size={15} className="text-indigo-400" /></div>
          <div className="space-y-1">
            {modules.slice(0,5).map((m) => <Link key={m.id} href={`/app/${panel.id}/${m.id}`} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-indigo-50"><span className="grid h-8 w-8 place-items-center rounded-xl" style={{background:`${m.color}18`,color:m.color}}><Icon name={m.icon} size={16}/></span><span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700">{m.title}</span><ArrowUpRight size={13} className="text-slate-400"/></Link>)}
          </div>
        </section>
        <section className="schoolos-panel rounded-[26px] p-5">
          <div className="mb-2 text-sm font-semibold text-slate-800">A little guidance</div>
          <p className="text-xs leading-5 text-slate-500">Keep your school organised by reviewing attendance, fee follow-ups and upcoming academic work regularly.</p>
          <div className="mt-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 p-4 text-white"><div className="text-xs font-semibold">SchoolOS workspace</div><div className="mt-1 text-[11px] text-white/80">One place for your school operations.</div></div>
        </section>
      </aside>
    </motion.div>
  );
}


type WorkspaceModule = { id: string; title: string; icon: string; color: string; blurb: string; features: number; count: number };

const DECK_LAYOUT: Record<string, string> = {
  owner: "ledger", principal: "command", "vice-principal": "agenda", manager: "ops-board",
  teacher: "lesson-plan", "exam-controller": "exam-register", accountant: "cashbook", hr: "directory",
  admissions: "admission-pipeline", receptionist: "frontdesk", librarian: "catalogue", transport: "route-board",
  warden: "residence", nurse: "care", storekeeper: "stockroom", "it-admin": "systems",
  student: "learning-path", parent: "family-feed",
};

function WorkspaceDeck({ panelId, panelColor, modules }: { panelId: string; panelColor: string; modules: WorkspaceModule[] }) {
  const mode = DECK_LAYOUT[panelId] ?? "command";
  const link = (m: WorkspaceModule, index: number) => (
    <Link key={m.id} href={`/app/${panelId}/${m.id}`} className="group block transition hover:-translate-y-0.5">
      <div className="flex items-center gap-3 border-b border-white/[0.07] py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${m.color}20`, color: m.color }}><Icon name={m.icon} size={17} /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-100 group-hover:text-white">{m.title}</span>
          <span className="block truncate text-xs text-slate-500">{m.blurb}</span>
        </span>
        <span className="text-right"><b className="block text-sm text-white">{m.count}</b><span className="text-[9px] uppercase tracking-wider text-slate-500">records</span></span>
        <ArrowUpRight size={15} className="text-slate-600 group-hover:text-white" />
      </div>
    </Link>
  );
  const title = mode === "ledger" || mode === "cashbook" || mode === "stockroom" || mode === "systems" || mode === "exam-register"
    ? "Registers & controls" : mode === "agenda" || mode === "frontdesk" || mode === "care" || mode === "family-feed"
      ? "Today's work queue" : "Your workspaces";
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between border-b border-white/10 pb-3">
        <div><div className="text-[10px] font-semibold uppercase tracking-[.2em]" style={{ color: panelColor }}>{mode.replaceAll("-", " ")}</div><h2 className="font-display text-xl font-bold text-white">{title}</h2></div>
        <span className="text-xs text-slate-500">{modules.length} areas · select to open</span>
      </div>
      {["ledger", "cashbook", "stockroom", "systems", "exam-register"].includes(mode) ? (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#090c19]/65">
          <div className="grid grid-cols-[minmax(0,1fr)_90px_100px] bg-white/[0.04] px-4 py-2 text-[10px] uppercase tracking-widest text-slate-500"><span>Workspace</span><span className="text-right">Tools</span><span className="text-right">Records</span></div>
          {modules.map((m) => <Link key={m.id} href={`/app/${panelId}/${m.id}`} className="grid grid-cols-[minmax(0,1fr)_90px_100px] items-center gap-2 border-t border-white/[0.06] px-4 py-3 hover:bg-white/[0.04]">
            <span className="flex min-w-0 items-center gap-3"><Icon name={m.icon} size={17} style={{ color: m.color }} /><span className="truncate text-sm font-medium text-slate-200">{m.title}</span></span><span className="text-right text-xs text-slate-400">{m.features}</span><b className="text-right text-sm text-white">{m.count}</b>
          </Link>)}
        </div>
      ) : ["ops-board", "admission-pipeline", "route-board", "residence"].includes(mode) ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {["Plan", "Run", "Review"].map((col, ci) => <div key={col} className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
            <div className="mb-2 flex items-center justify-between px-1"><h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{col}</h3><span className="text-xs text-slate-600">{modules.filter((_,i)=>i%3===ci).length}</span></div>
            {modules.filter((_,i)=>i%3===ci).map((m,i)=><Link key={m.id} href={`/app/${panelId}/${m.id}`} className="mb-2 block rounded-xl border border-white/[0.07] bg-[#0b1020] p-3 hover:border-white/20"><div className="flex items-center gap-2"><Icon name={m.icon} size={16} style={{color:m.color}}/><b className="min-w-0 flex-1 truncate text-sm text-white">{m.title}</b><ArrowUpRight size={13} className="text-slate-600"/></div><div className="mt-3 flex items-end justify-between"><span className="text-[10px] text-slate-500">{m.features} tools</span><b className="text-lg text-white">{m.count}</b></div></Link>)}
          </div>)}
        </div>
      ) : ["agenda", "frontdesk", "care", "family-feed"].includes(mode) ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(220px,.6fr)]">
          <div className="border-l-2 pl-4" style={{borderColor:panelColor}}>{modules.map((m,i)=><div key={m.id} className="relative"><span className="absolute -left-[22px] top-5 h-2 w-2 rounded-full" style={{background:m.color}}/>{link(m,i)}</div>)}</div>
          <aside className="h-fit rounded-2xl border border-white/10 p-5"><div className="text-[10px] uppercase tracking-widest text-slate-500">Panel summary</div><div className="mt-3 font-display text-4xl font-bold text-white">{modules.reduce((a,m)=>a+m.count,0)}</div><p className="mt-1 text-xs text-slate-500">records across assigned workspaces</p><div className="mt-5 space-y-2">{modules.slice(0,4).map(m=><div key={m.id} className="flex justify-between text-xs"><span className="text-slate-400">{m.title}</span><b className="text-slate-200">{m.count}</b></div>)}</div></aside>
        </div>
      ) : mode === "directory" || mode === "catalogue" ? (
        <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">{modules.map((m,i)=><Link key={m.id} href={`/app/${panelId}/${m.id}`} className="grid grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-3 py-4 hover:bg-white/[0.025]"><span className="font-mono text-xs text-slate-600">{String(i+1).padStart(2,"0")}</span><span className="min-w-0"><b className="block text-sm text-white">{m.title}</b><span className="text-xs text-slate-500">{m.blurb}</span></span><span className="text-sm font-semibold" style={{color:m.color}}>{m.count}</span></Link>)}</div>
      ) : (
        <div className={`grid gap-3 ${mode === "learning-path" ? "md:grid-cols-2" : mode === "lesson-plan" ? "md:grid-cols-2 xl:grid-cols-4" : mode === "command" ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-3"}`}>
          {modules.map((m,i)=><Link key={m.id} href={`/app/${panelId}/${m.id}`} className="group relative overflow-hidden border border-white/10 bg-white/[0.025] p-4 transition hover:border-white/20 hover:bg-white/[0.05]" style={{borderRadius:mode==="learning-path"?"22px":mode==="lesson-plan"?"10px":mode==="command"?"18px":"14px"}}>
            <div className="mb-4 flex items-center justify-between"><span className="text-[10px] font-mono" style={{color:m.color}}>{String(i+1).padStart(2,"0")}</span><Icon name={m.icon} size={18} style={{color:m.color}}/></div><b className="block text-sm text-white">{m.title}</b><p className="mt-1 line-clamp-2 text-xs text-slate-500">{m.blurb}</p><div className="mt-4 flex items-end justify-between"><span className="text-[10px] text-slate-500">{m.features} workflows</span><span className="font-display text-2xl font-bold text-white">{m.count}</span></div><div className="mt-3 h-1 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full" style={{width:`${Math.min(100,m.count*5)}%`,background:m.color}}/></div>
          </Link>)}
        </div>
      )}
    </section>
  );
}
