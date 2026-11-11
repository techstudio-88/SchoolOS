"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, BellRing, CheckCircle2, Loader2, Plus, Power, Trash2, Zap } from "lucide-react";

type Trigger = "attendance_absent" | "fee_due" | "event_soon" | "leave_pending";
type Rule = { id: number; name: string; trigger: Trigger; action: string; enabled: boolean; createdAt: string };

const TRIGGERS: { id: Trigger; label: string; description: string }[] = [
  { id: "attendance_absent", label: "Student marked absent", description: "When today's attendance entry is marked absent" },
  { id: "fee_due", label: "Fee payment due", description: "When a fee record has a due date and is not completed" },
  { id: "event_soon", label: "School event coming up", description: "When an event is scheduled within the next 7 days" },
  { id: "leave_pending", label: "Leave request awaiting review", description: "When a staff leave request is not approved or rejected" },
];

export function AutomationsCenter() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<Trigger>("attendance_absent");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/automations", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Could not load automations.");
      setRules(Array.isArray(data.rules) ? data.rules : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load automations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function addRule(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 3) return setError("Enter a name with at least 3 characters.");
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/automations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, trigger }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.rule) throw new Error(data.error ?? "Could not create this automation.");
      setRules((current) => [data.rule, ...current]);
      setName("");
      setMessage("Automation created. New matching events will appear in the SchoolOS notification centre.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create this automation.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleRule(rule: Rule) {
    setBusyId(rule.id);
    setError("");
    try {
      const response = await fetch("/api/automations", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: rule.id, enabled: !rule.enabled }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.rule) throw new Error(data.error ?? "Could not update this automation.");
      setRules((current) => current.map((item) => item.id === rule.id ? data.rule : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update this automation.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteRule(rule: Rule) {
    if (!window.confirm(`Delete “${rule.name}”? This cannot be undone.`)) return;
    setBusyId(rule.id);
    setError("");
    try {
      const response = await fetch(`/api/automations?id=${rule.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Could not delete this automation.");
      setRules((current) => current.filter((item) => item.id !== rule.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this automation.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-[28px] border border-violet-200/70 bg-gradient-to-br from-white via-violet-50 to-sky-50 p-6 shadow-[0_18px_55px_rgba(88,105,160,.10)] md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700"><Zap size={14}/> SchoolOS automation studio</div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Let routine work run itself.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">Create school-wide rules that watch operational records and raise an in-app alert when a matching event is found.</p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm"><BellRing size={25}/></div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white bg-white/80 p-4"><div className="text-xs text-slate-500">Rules created</div><div className="mt-1 text-2xl font-bold text-slate-900">{rules.length}</div></div>
          <div className="rounded-2xl border border-white bg-white/80 p-4"><div className="text-xs text-slate-500">Currently active</div><div className="mt-1 text-2xl font-bold text-emerald-700">{rules.filter((rule) => rule.enabled).length}</div></div>
          <div className="rounded-2xl border border-white bg-white/80 p-4"><div className="text-xs text-slate-500">Delivery</div><div className="mt-1 text-sm font-semibold text-slate-900">SchoolOS in-app alerts</div></div>
        </div>
      </header>

      {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle size={16}/>{error}</div>}
      {message && <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><CheckCircle2 size={16}/>{message}</div>}

      <section className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <form onSubmit={addRule} className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(60,80,120,.06)] md:p-6">
          <div className="mb-5"><div className="text-xs font-semibold uppercase tracking-widest text-violet-600">New rule</div><h2 className="mt-1 text-xl font-bold text-slate-900">Create automation</h2><p className="mt-1 text-xs leading-5 text-slate-500">Choose an event to watch. You can pause or remove the rule at any time.</p></div>
          <label className="mb-4 block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Automation name</span><input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required minLength={3} placeholder="e.g. Alert owner about absences" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"/></label>
          <label className="mb-5 block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">When this happens</span><select value={trigger} onChange={(event) => setTrigger(event.target.value as Trigger)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100">{TRIGGERS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><span className="mt-2 block text-xs text-slate-500">{TRIGGERS.find((item) => item.id === trigger)?.description}</span></label>
          <div className="mb-5 rounded-xl bg-sky-50 p-3 text-xs leading-5 text-sky-800">Then: create a notification in the SchoolOS notification centre for users whose role has access to the relevant workspace.</div>
          <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 disabled:opacity-60">{saving ? <Loader2 size={16} className="animate-spin"/> : <Plus size={16}/>}Create automation</button>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(60,80,120,.06)] md:p-6">
          <div className="mb-4 flex items-center justify-between"><div><div className="text-xs font-semibold uppercase tracking-widest text-slate-500">Your rules</div><h2 className="mt-1 text-xl font-bold text-slate-900">Automation list</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{rules.length} total</span></div>
          {loading ? <div className="grid place-items-center py-16 text-slate-400"><Loader2 className="animate-spin"/></div> : rules.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center"><Zap className="mx-auto text-violet-400" size={26}/><p className="mt-3 text-sm font-semibold text-slate-800">No automations yet</p><p className="mt-1 text-xs text-slate-500">Create your first rule to start receiving operational alerts.</p></div> : <div className="space-y-3">
            <AnimatePresence initial={false}>{rules.map((rule) => <motion.article key={rule.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600"><Zap size={18}/></div><div className="min-w-0 flex-1"><div className="font-semibold text-slate-900">{rule.name}</div><div className="mt-1 text-xs text-slate-500">{TRIGGERS.find((item) => item.id === rule.trigger)?.label ?? rule.trigger}</div><div className="mt-2 flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${rule.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{rule.enabled ? "Active" : "Paused"}</span><span className="text-[10px] text-slate-400">In-app notification</span></div></div><div className="flex shrink-0 gap-1"><button type="button" title={rule.enabled ? "Pause rule" : "Enable rule"} onClick={() => void toggleRule(rule)} disabled={busyId === rule.id} className="rounded-lg p-2 text-slate-500 transition hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50"><Power size={16}/></button><button type="button" title="Delete rule" onClick={() => void deleteRule(rule)} disabled={busyId === rule.id} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"><Trash2 size={16}/></button></div></div>
            </motion.article>)}</AnimatePresence>
          </div>}
        </div>
      </section>
      <p className="text-xs leading-5 text-slate-500">Current version supports in-app alerts only. WhatsApp, SMS, email and background push delivery require provider credentials and a configured delivery service; they are not represented as active here.</p>
    </div>
  );
}
