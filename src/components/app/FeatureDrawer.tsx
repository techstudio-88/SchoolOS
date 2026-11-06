"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Loader2, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import { Icon } from "@/components/icons";
import { STATUSES } from "@/lib/catalog";
import { getWorkflowFields } from "@/lib/workflow-fields";

type Rec = {
  id: number;
  title: string;
  person: string;
  amount: number;
  dueDate: string;
  status: string;
  notes: string;
  createdAt: string;
  payload?: Record<string, string | number | boolean | null>;
};

const EMPTY = { title: "", person: "", amount: "", dueDate: "", status: "open", notes: "" };

export function FeatureDrawer({
  feature,
  moduleTitle,
  moduleId,
  color,
  icon,
  onClose = () => {},
  onChange = () => {},
  fullPage = false,
}: {
  feature: { key: string; name: string; description: string };
  moduleTitle: string;
  moduleId: string;
  color: string;
  icon: string;
  onClose?: () => void;
  onChange?: (count: number, enabled: boolean) => void;
  fullPage?: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Rec[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [payload, setPayload] = useState<Record<string, string | number | boolean | null>>({});
  const fields = useMemo(() => getWorkflowFields(moduleId), [moduleId]);
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/records?feature=${encodeURIComponent(feature.key)}`, { cache: "no-store" });
    if (res.ok) {
      const j = await res.json();
      setRows(j.records);
      setEnabled(j.enabled);
      onChange(j.records.length, j.enabled);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feature.key]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (fullPage) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, fullPage]);

  const today = new Date().toISOString().slice(0, 10);
  const stats = useMemo(() => {
    const by = (s: string) => rows.filter((r) => r.status === s).length;
    return {
      total: rows.length,
      open: by("open") + by("in_progress"),
      done: by("done"),
      amount: rows.reduce((a, r) => a + r.amount, 0),
    };
  }, [rows]);

  const shown = rows.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      (!q || `${r.title} ${r.person} ${r.notes}`.toLowerCase().includes(q.toLowerCase())),
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return setErr("Please add a title.");
    setErr("");
    setSaving(true);
    const body = { ...form, amount: Number(form.amount) || 0, payload, feature: feature.key };
    const res = await fetch(editing ? `/api/records/${editing}` : "/api/records", {
      method: editing ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const { record } = await res.json();
      const next = editing ? rows.map((r) => (r.id === editing ? record : r)) : [record, ...rows];
      setRows(next);
      onChange(next.length, enabled);
      setForm(EMPTY);
      setEditing(null);
      setShowForm(false);
    } else setErr("Could not save. Try again.");
    setSaving(false);
  }

  async function setStatus(r: Rec, status: string) {
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, status } : x)));
    await fetch(`/api/records/${r.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
  }

  async function remove(r: Rec) {
    const next = rows.filter((x) => x.id !== r.id);
    setRows(next);
    onChange(next.length, enabled);
    await fetch(`/api/records/${r.id}`, { method: "DELETE" });
  }

  async function toggle() {
    const v = !enabled;
    setEnabled(v);
    onChange(rows.length, v);
    await fetch("/api/features/toggle", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ feature: feature.key, enabled: v }) });
  }

  async function sample() {
    setSaving(true);
    const res = await fetch("/api/records", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ feature: feature.key, sample: true }) });
    if (res.ok) await load();
    setSaving(false);
  }

  function exportCsv() {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [["Title", "Person", "Amount", "Due", "Status", "Notes"].join(","), ...rows.map((r) => [r.title, r.person, r.amount, r.dueDate, r.status, r.notes].map(esc).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `${feature.key}.csv`;
    a.click();
  }

  function startEdit(r: Rec) {
    setEditing(r.id);
    setForm({ title: r.title, person: r.person, amount: r.amount ? String(r.amount) : "", dueDate: r.dueDate, status: r.status, notes: r.notes });
    setPayload(r.payload ?? {});
    setShowForm(true);
  }

  return (
    <>
      {!fullPage && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" />}
      <motion.aside
        initial={fullPage ? { opacity: 0, y: 12 } : { x: "100%" }}
        animate={fullPage ? { opacity: 1, y: 0 } : { x: 0 }}
        exit={fullPage ? { opacity: 0 } : { x: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 32 }}
        className={fullPage ? "relative -mx-4 -my-4 flex min-h-[calc(100vh-72px)] w-[calc(100%+2rem)] max-w-none flex-col overflow-visible rounded-none border-0 bg-transparent shadow-none md:-mx-8 md:w-[calc(100%+4rem)]" : "fixed inset-y-0 right-0 z-[61] flex w-full max-w-2xl flex-col border-l border-white/10 bg-[#080a18] shadow-[-30px_0_100px_rgba(0,0,0,0.6)]"}
        style={{ boxShadow: fullPage ? "none" : `-20px 0 100px -20px ${color}55` }}
      >
        <div className="relative overflow-hidden border-b border-white/10 p-6" style={{ background: `linear-gradient(120deg, ${color}2e, transparent)` }}>
          {!fullPage && <button onClick={onClose} className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Close"><X size={18} /></button>}
          <div className="flex items-center gap-3 text-xs" style={{ color }}>
            <Icon name={icon} size={16} /> {moduleTitle}
          </div>
          <h2 className="font-display mt-2 pr-10 text-2xl font-bold text-white">{feature.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{feature.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button onClick={toggle} className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200" aria-pressed={enabled}>
              <span className="relative h-5 w-9 rounded-full transition" style={{ background: enabled ? color : "#334155" }}>
                <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-0.5 h-4 w-4 rounded-full bg-white" style={{ left: enabled ? 18 : 2 }} />
              </span>
              {enabled ? "Feature on" : "Feature off"}
            </button>
            <button onClick={exportCsv} disabled={!rows.length} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10 disabled:opacity-40"><Download size={13} /> Export CSV</button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 border-b border-white/10 p-4">
          {[
            ["Total", stats.total],
            ["Pending", stats.open],
            ["Done", stats.done],
            ["Value ₹", stats.amount],
          ].map(([l, v]) => (
            <div key={String(l)} className="rounded-xl bg-white/[0.04] p-3 text-center">
              <motion.div key={String(v)} initial={{ scale: 1.3, color }} animate={{ scale: 1, color: "#fff" }} className="font-display text-xl font-bold">{Number(v).toLocaleString()}</motion.div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">{l}</div>
            </div>
          ))}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="flex items-center gap-2">
            <input className="input !py-2" placeholder="Filter records…" value={q} onChange={(e) => setQ(e.target.value)} />
            <button
              onClick={() => { setShowForm((v) => !v); setEditing(null); setForm(EMPTY); setPayload({}); }}
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              style={{ background: `linear-gradient(110deg, ${color}, #6366f1)`, boxShadow: `0 0 24px ${color}66` }}
            >
              <motion.span animate={{ rotate: showForm ? 45 : 0 }}><Plus size={16} /></motion.span> New
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[{ id: "all", label: "All", color }, ...STATUSES].map((s) => (
              <button key={s.id} onClick={() => setFilter(s.id)} className="rounded-full px-3 py-1 text-xs transition" style={{ background: filter === s.id ? `${s.color}33` : "rgba(255,255,255,0.05)", color: filter === s.id ? s.color : "#94a3b8", boxShadow: filter === s.id ? `0 0 14px ${s.color}44` : undefined }}>
                {s.label}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.form
                onSubmit={submit}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 rounded-2xl border p-4" style={{ borderColor: `${color}55`, background: `${color}0d` }}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block sm:col-span-2"><span className="mb-1.5 block text-xs font-medium text-slate-300">Record name *</span><input className="input" autoFocus placeholder={feature.name} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
                    {fields.map((field) => <label key={field.key} className={`block ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>
                      <span className="mb-1.5 block text-xs font-medium text-slate-300">{field.label}{field.required ? " *" : ""}</span>
                      {field.type === "textarea" ? <textarea className="input min-h-[76px]" value={String(payload[field.key] ?? "")} onChange={(e) => setPayload({ ...payload, [field.key]: e.target.value })} /> :
                       field.type === "select" ? <select className="input" value={String(payload[field.key] ?? "")} onChange={(e) => setPayload({ ...payload, [field.key]: e.target.value })}><option value="">Choose…</option>{(field.options ?? []).map((v) => <option key={v} value={v}>{v}</option>)}</select> :
                       <input className="input" type={field.type ?? "text"} value={String(payload[field.key] ?? "")} onChange={(e) => setPayload({ ...payload, [field.key]: field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value })} />}
                    </label>)}
                    <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-300">Assigned person / owner</span><input className="input" placeholder="Name" value={form.person} onChange={(e) => setForm({ ...form, person: e.target.value })} /></label>
                    <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-300">Amount (₹), if relevant</span><input className="input" type="number" min={0} placeholder="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label>
                    <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-300">Due date</span><input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label>
                    <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-300">Workflow status</span><select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>
                    <label className="block sm:col-span-2"><span className="mb-1.5 block text-xs font-medium text-slate-300">Internal notes</span><textarea className="input min-h-[70px]" placeholder="Notes…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
                  </div>
                  {err && <p className="text-xs text-rose-400">{err}</p>}
                  <div className="flex gap-2">
                    <button disabled={saving} className="btn-glow rounded-xl px-5 py-2.5 text-sm">{saving ? "Saving…" : editing ? "Save changes" : "Add record"}</button>
                    <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY); setPayload({}); }} className="rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:text-white">Cancel</button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="grid place-items-center py-16 text-slate-500"><Loader2 className="animate-spin" /></div>
          ) : rows.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-dashed border-white/15 p-10 text-center">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl" style={{ background: `${color}22`, boxShadow: `0 0 40px ${color}55` }}>
                <Icon name={icon} size={28} style={{ color }} />
              </motion.div>
              <h3 className="font-display text-lg font-bold text-white">Nothing here yet</h3>
              <p className="mx-auto mt-1 max-w-xs text-sm text-slate-400">Add your first record, or drop in a few sample rows to see how it works.</p>
              <button onClick={sample} disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-white transition hover:bg-white/10"><Sparkles size={15} style={{ color }} /> Load sample data</button>
            </motion.div>
          ) : (
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {shown.map((r) => {
                  const st = STATUSES.find((s) => s.id === r.status) ?? STATUSES[0];
                  const overdue = r.dueDate && r.dueDate < today && r.status !== "done";
                  return (
                    <motion.li
                      key={r.id}
                      layout
                      initial={{ opacity: 0, y: 14, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 60, scale: 0.95 }}
                      transition={{ duration: 0.35 }}
                      className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5 transition hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => setStatus(r, STATUSES[(STATUSES.findIndex((s) => s.id === r.status) + 1) % STATUSES.length].id)}
                          title="Click to change status"
                          className="mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition hover:scale-105"
                          style={{ background: `${st.color}22`, color: st.color, boxShadow: `0 0 12px ${st.color}33` }}
                        >
                          {st.label}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-medium ${r.status === "done" ? "text-slate-500 line-through" : "text-white"}`}>{r.title}</div>
                          {r.payload && Object.entries(r.payload).filter(([, v]) => v !== "" && v !== null && v !== undefined).length > 0 && <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-white/[0.06] pt-2">{Object.entries(r.payload).filter(([, v]) => v !== "" && v !== null && v !== undefined).slice(0, 8).map(([k, v]) => <div key={k} className="min-w-0"><dt className="truncate text-[9px] uppercase tracking-wider text-slate-600">{k.replace(/([A-Z])/g, " $1")}</dt><dd className="truncate text-xs text-slate-300">{String(v)}</dd></div>)}</dl>}
                          <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-500">
                            {r.person && <span>👤 {r.person}</span>}
                            {r.dueDate && <span className={overdue ? "font-semibold text-rose-400" : ""}>📅 {r.dueDate}{overdue ? " · overdue" : ""}</span>}
                            {r.amount > 0 && <span>₹{r.amount.toLocaleString()}</span>}
                          </div>
                          {r.notes && <p className="mt-1.5 line-clamp-2 text-xs text-slate-400">{r.notes}</p>}
                        </div>
                        <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                          <button onClick={() => startEdit(r)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Edit"><Pencil size={14} /></button>
                          <button onClick={() => remove(r)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300" aria-label="Delete"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
              {shown.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No records match.</p>}
            </ul>
          )}
        </div>
      </motion.aside>
    </>
  );
}
