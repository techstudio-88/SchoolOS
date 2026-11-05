"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  Activity, Building2, Eye, KeyRound, Lock, LogOut, Megaphone, Pause, Play, Plus, Search, ShieldAlert, Trash2, Users, X,
} from "lucide-react";
import { Counter, GlowCard, Particles } from "@/components/fx";

type S = {
  id: number; name: string; ownerName: string; ownerEmail: string; city: string; plan: string;
  status: string; students: number; isDemo: boolean; records: number; createdAt: string;
};
type N = { id: number; title: string; body: string; createdAt: string };
type A = { id: number; action: string; detail: string; createdAt: string };

const PRICE: Record<string, number> = { trial: 0, starter: 4999, pro: 14999, enterprise: 49999 };
const PLAN_COLOR: Record<string, string> = { trial: "#94a3b8", starter: "#22d3ee", pro: "#8b5cf6", enterprise: "#ec4899" };
const STATUS_COLOR: Record<string, string> = { active: "#10b981", trial: "#f59e0b", suspended: "#f43f5e" };

export function AdminGate({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden p-6">
      <div className="aurora absolute inset-0 opacity-60" />
      <Particles count={24} />
      <motion.form
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr("");
          const res = await fetch("/api/sys/auth", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key }) });
          if (res.ok) router.refresh();
          else setErr((await res.json().catch(() => ({}))).error ?? "Denied");
          setBusy(false);
        }}
        className="spin-border w-full max-w-sm"
      >
        <div className="spin-inner p-8 text-center">
          <motion.div animate={{ boxShadow: ["0 0 20px #f43f5e55", "0 0 50px #f43f5e99", "0 0 20px #f43f5e55"] }} transition={{ duration: 2.5, repeat: Infinity }} className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-500/15 text-rose-300">
            <Lock size={28} />
          </motion.div>
          <h1 className="font-display mt-5 text-xl font-bold text-white">Restricted</h1>
          <p className="mt-1 text-sm text-slate-500">Platform owner access only.</p>
          <div className="relative mt-6">
            <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input autoFocus type="password" className="input !pl-10" placeholder="Master key" value={key} onChange={(e) => setKey(e.target.value)} />
          </div>
          {!configured && <p className="mt-3 text-xs text-amber-400">SUPER_ADMIN_KEY is not set on this server.</p>}
          {err && <p className="mt-3 text-sm text-rose-400">{err}</p>}
          <button disabled={busy || !key} className="btn-glow mt-5 w-full rounded-xl py-3 text-sm disabled:opacity-50">{busy ? "Verifying…" : "Unlock"}</button>
        </div>
      </motion.form>
    </main>
  );
}

export function AdminConsole({ schools, notices, audit, totals }: { schools: S[]; notices: N[]; audit: A[]; totals: { records: number; features: number; modules: number; panels: number } }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [nTitle, setNTitle] = useState("");
  const [nBody, setNBody] = useState("");
  const [busy, setBusy] = useState<number | string | null>(null);
  const [tab, setTab] = useState<"schools" | "broadcast" | "audit">("schools");
  const [form, setForm] = useState({ name: "", ownerName: "", ownerEmail: "", city: "", plan: "trial", studentsCount: "" });

  const list = useMemo(() => schools.filter((s) => `${s.name} ${s.ownerName} ${s.city}`.toLowerCase().includes(q.toLowerCase())), [schools, q]);
  const mrr = schools.filter((s) => s.status !== "suspended").reduce((a, s) => a + (PRICE[s.plan] ?? 0), 0);
  const students = schools.reduce((a, s) => a + s.students, 0);
  const call = async (url: string, method: string, body?: unknown, key?: number | string) => {
    setBusy(key ?? url);
    await fetch(url, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    setBusy(null);
    router.refresh();
  };

  const stats = [
    { l: "Schools", v: schools.length, c: "#8b5cf6", i: Building2 },
    { l: "Active", v: schools.filter((s) => s.status === "active").length, c: "#10b981", i: Activity },
    { l: "Students", v: students, c: "#22d3ee", i: Users },
    { l: "Est. MRR ₹", v: mrr, c: "#f59e0b", i: Megaphone },
    { l: "Records", v: totals.records, c: "#ec4899", i: ShieldAlert },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden p-4 md:p-8">
      <div className="aurora absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl space-y-6">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 shadow-[0_0_30px_rgba(244,63,94,0.6)]"><ShieldAlert className="text-white" /></div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-white md:text-3xl">Platform Console</h1>
            <p className="text-sm text-slate-400">Invisible to every school. {totals.panels} panels · {totals.modules} modules · {totals.features} features live.</p>
          </div>
          <button onClick={async () => { await fetch("/api/sys/auth", { method: "DELETE" }); router.refresh(); }} className="glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10"><LogOut size={15} /> Lock</button>
        </motion.header>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {stats.map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <GlowCard glow={s.c} className="rounded-2xl p-4">
                <s.i size={18} style={{ color: s.c }} />
                <div className="font-display mt-2 text-3xl font-bold" style={{ color: s.c, textShadow: `0 0 24px ${s.c}88` }}><Counter to={s.v} duration={1.4} /></div>
                <div className="text-xs text-slate-400">{s.l}</div>
              </GlowCard>
            </motion.div>
          ))}
        </div>

        <div className="glass inline-flex rounded-xl p-1">
          {(["schools", "broadcast", "audit"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className="relative rounded-lg px-5 py-2 text-sm capitalize text-slate-300">
              {tab === t && <motion.span layoutId="sa-tab" className="absolute inset-0 rounded-lg bg-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.4)]" />}
              <span className={`relative ${tab === t ? "font-semibold text-white" : ""}`}>{t === "audit" ? "Audit log" : t}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "schools" && (
            <motion.section key="s" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input className="input !pl-10" placeholder="Search schools, owners, cities…" value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
                <button onClick={() => setModal(true)} className="btn-glow flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm"><Plus size={16} /> Add school</button>
              </div>
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {list.map((s) => (
                    <motion.div key={s.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 80 }}>
                      <GlowCard glow={PLAN_COLOR[s.plan]} className="rounded-2xl p-4 md:p-5">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-display font-bold text-white">{s.name}</h3>
                              {s.isDemo && <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-300">DEMO</span>}
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: `${STATUS_COLOR[s.status]}22`, color: STATUS_COLOR[s.status] }}>{s.status}</span>
                            </div>
                            <div className="mt-1 text-xs text-slate-500">{s.ownerName} · {s.ownerEmail || "no email"} · {s.city || "—"} · {s.students} students · {s.records} records</div>
                          </div>
                          <select value={s.plan} onChange={(e) => call("/api/sys/schools", "PATCH", { id: s.id, plan: e.target.value }, s.id)} className="input !w-auto !py-2 capitalize" style={{ color: PLAN_COLOR[s.plan] }}>
                            {Object.keys(PRICE).map((p) => <option key={p} value={p}>{p}</option>)}
                          </select>
                          <div className="flex gap-1.5">
                            <button title="Open as owner" onClick={async () => { await fetch("/api/sys/impersonate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ schoolId: s.id }) }); window.open("/app/owner", "_blank"); }} className="rounded-xl bg-white/5 p-2.5 text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300"><Eye size={16} /></button>
                            <button title={s.status === "suspended" ? "Reactivate" : "Suspend"} onClick={() => call("/api/sys/schools", "PATCH", { id: s.id, status: s.status === "suspended" ? "active" : "suspended" }, s.id)} className="rounded-xl bg-white/5 p-2.5 text-slate-300 hover:bg-amber-500/20 hover:text-amber-300">{busy === s.id ? "…" : s.status === "suspended" ? <Play size={16} /> : <Pause size={16} />}</button>
                            <button title="Delete school" onClick={() => { if (confirm(`Delete ${s.name} and ALL its data? This cannot be undone.`)) call(`/api/sys/schools?id=${s.id}`, "DELETE", undefined, s.id); }} className="rounded-xl bg-white/5 p-2.5 text-slate-300 hover:bg-rose-500/20 hover:text-rose-300"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </GlowCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {list.length === 0 && <p className="py-12 text-center text-slate-500">No schools found.</p>}
              </div>
            </motion.section>
          )}

          {tab === "broadcast" && (
            <motion.section key="b" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid gap-5 lg:grid-cols-2">
              <GlowCard className="rounded-3xl p-6">
                <h3 className="font-display mb-1 text-lg font-bold text-white">Broadcast a notice</h3>
                <p className="mb-4 text-xs text-slate-500">Appears in every school&apos;s notification bell and dashboard.</p>
                <div className="space-y-3">
                  <input className="input" placeholder="Title" value={nTitle} onChange={(e) => setNTitle(e.target.value)} />
                  <textarea className="input min-h-[100px]" placeholder="Message (optional)" value={nBody} onChange={(e) => setNBody(e.target.value)} />
                  <button disabled={!nTitle.trim()} onClick={async () => { await call("/api/sys/notices", "POST", { title: nTitle, body: nBody }); setNTitle(""); setNBody(""); }} className="btn-glow rounded-xl px-5 py-2.5 text-sm disabled:opacity-50">Send to all schools</button>
                </div>
              </GlowCard>
              <div className="space-y-3">
                {notices.length === 0 && <p className="py-10 text-center text-slate-500">No notices sent yet.</p>}
                {notices.map((n) => (
                  <motion.div key={n.id} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="glass flex items-start gap-3 rounded-2xl p-4">
                    <div className="flex-1">
                      <div className="font-semibold text-white">{n.title}</div>
                      {n.body && <div className="mt-1 text-sm text-slate-400">{n.body}</div>}
                      <div className="mt-2 text-[11px] text-slate-600">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    <button onClick={() => call(`/api/sys/notices?id=${n.id}`, "DELETE")} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/20 hover:text-rose-300"><Trash2 size={15} /></button>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {tab === "audit" && (
            <motion.section key="a" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass rounded-3xl p-2">
              {audit.length === 0 && <p className="py-12 text-center text-slate-500">No admin actions recorded yet.</p>}
              {audit.map((a) => (
                <div key={a.id} className="flex items-center gap-4 rounded-xl px-4 py-3 text-sm hover:bg-white/5">
                  <span className="rounded-md bg-violet-500/15 px-2 py-0.5 font-mono text-xs text-violet-300">{a.action}</span>
                  <span className="flex-1 truncate text-slate-300">{a.detail}</span>
                  <span className="text-xs text-slate-600">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setModal(false)}>
            <motion.form
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={async (e) => {
                e.preventDefault();
                await call("/api/sys/schools", "POST", { ...form, studentsCount: Number(form.studentsCount) || 0 });
                setForm({ name: "", ownerName: "", ownerEmail: "", city: "", plan: "trial", studentsCount: "" });
                setModal(false);
              }}
              className="spin-border w-full max-w-md"
            >
              <div className="spin-inner space-y-3 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-white">Add a school</h3>
                  <button type="button" onClick={() => setModal(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
                </div>
                <input required autoFocus className="input" placeholder="School name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input className="input" placeholder="Owner name" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
                  <input className="input" type="email" placeholder="Owner email" value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} />
                  <input className="input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  <input className="input" type="number" min={0} placeholder="Students" value={form.studentsCount} onChange={(e) => setForm({ ...form, studentsCount: e.target.value })} />
                </div>
                <select className="input capitalize" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                  {Object.keys(PRICE).map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <button className="btn-glow w-full rounded-xl py-3 text-sm">Create school</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
