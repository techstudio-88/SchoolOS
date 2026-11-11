"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
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
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "due" | "amount" | "title">("newest");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [activeView, setActiveView] = useState<"overview" | "records" | "insights" | "calendar">("overview");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`/api/records?feature=${encodeURIComponent(feature.key)}`, { cache: "no-store" });
      if (!res.ok) throw new Error(res.status === 403 ? "You do not have access to this workspace." : "Could not load records. Please try again.");
      const j = await res.json();
      setRows(Array.isArray(j.records) ? j.records : []);
      setEnabled(Boolean(j.enabled));
      onChange(Array.isArray(j.records) ? j.records.length : 0, Boolean(j.enabled));
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not load records.");
    } finally {
      setLoading(false);
    }
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

  const insights = useMemo(() => {
    const metrics: { label: string; value: string; hint: string }[] = [];
    if (moduleId === "attendance") {
      const count = (value: string) => rows.filter((row) => String(row.payload?.attendance ?? "").toLowerCase() === value).length;
      metrics.push(
        { label: "Present", value: String(count("present")), hint: "Attendance entries marked present" },
        { label: "Absent", value: String(count("absent")), hint: "Entries needing follow-up" },
        { label: "Late", value: String(count("late")), hint: "Late arrivals recorded" },
      );
    } else if (moduleId === "fees") {
      const collected = rows.reduce((sum, row) => sum + row.amount, 0);
      const modes = new Set(rows.map((row) => String(row.payload?.paymentMode ?? "")).filter(Boolean)).size;
      metrics.push(
        { label: "Recorded collections", value: `₹${collected.toLocaleString("en-IN")}`, hint: "Sum of amounts entered in this workspace" },
        { label: "Payment methods", value: String(modes), hint: "Different payment methods used" },
        { label: "Payment entries", value: String(rows.length), hint: "Recorded fee transactions" },
      );
    } else if (moduleId === "exams" || moduleId === "grading") {
      const marked = rows.filter((row) => Number(row.payload?.maxMarks) > 0 && Number.isFinite(Number(row.payload?.marks)));
      const average = marked.length ? marked.reduce((sum, row) => sum + Number(row.payload?.marks) / Number(row.payload?.maxMarks) * 100, 0) / marked.length : 0;
      metrics.push(
        { label: "Assessments", value: String(rows.length), hint: "Exam and assessment records" },
        { label: "Marks entered", value: String(marked.length), hint: "Records with marks and maximum marks" },
        { label: "Average score", value: marked.length ? `${Math.round(average)}%` : "—", hint: "Average across records with marks" },
      );
    } else if (moduleId === "admissions") {
      const stage = (value: string) => rows.filter((row) => String(row.payload?.stage ?? row.status).toLowerCase() === value).length;
      metrics.push(
        { label: "Applications", value: String(rows.length), hint: "Admission records in this workspace" },
        { label: "Approved", value: String(stage("approved") + stage("admitted")), hint: "Applications marked approved or admitted" },
        { label: "Awaiting action", value: String(rows.filter((row) => !["done", "approved", "admitted", "rejected"].includes(String(row.payload?.stage ?? row.status).toLowerCase())).length), hint: "Applications that may need follow-up" },
      );
    } else if (moduleId === "homework") {
      const due = rows.filter((row) => row.dueDate || row.payload?.dueDate);
      const completed = rows.filter((row) => row.status === "done" || String(row.payload?.submissionStatus ?? "").toLowerCase() === "submitted").length;
      metrics.push(
        { label: "Assignments", value: String(rows.length), hint: "Homework and assignment records" },
        { label: "Completed", value: String(completed), hint: "Marked done or submitted" },
        { label: "With deadlines", value: String(due.length), hint: "Records with a due date" },
      );
    } else if (moduleId === "timetable") {
      const classes = new Set(rows.map((row) => String(row.payload?.class ?? "")).filter(Boolean));
      const teachers = new Set(rows.map((row) => String(row.payload?.teacher ?? "")).filter(Boolean));
      metrics.push(
        { label: "Scheduled lessons", value: String(rows.length), hint: "Timetable entries recorded" },
        { label: "Classes covered", value: String(classes.size), hint: "Distinct classes in the timetable" },
        { label: "Teachers assigned", value: String(teachers.size), hint: "Distinct teachers with entries" },
      );
    } else if (moduleId === "hr") {
      const departments = new Set(rows.map((row) => String(row.payload?.department ?? "")).filter(Boolean));
      const active = rows.filter((row) => !["done", "flagged"].includes(row.status)).length;
      metrics.push(
        { label: "Staff profiles", value: String(rows.length), hint: "Employee records in this workspace" },
        { label: "Departments", value: String(departments.size), hint: "Departments represented" },
        { label: "Active records", value: String(active), hint: "Profiles not marked complete or flagged" },
      );
    } else if (moduleId === "leave") {
      const pending = rows.filter((row) => !["done", "approved", "rejected"].includes(String(row.payload?.approval ?? row.status).toLowerCase())).length;
      const days = rows.reduce((sum, row) => sum + (Number(row.payload?.days) || 0), 0);
      metrics.push(
        { label: "Leave requests", value: String(rows.length), hint: "Requests recorded" },
        { label: "Awaiting review", value: String(pending), hint: "Requests not marked approved or rejected" },
        { label: "Days requested", value: String(days), hint: "Sum of days entered on requests" },
      );
    } else if (moduleId === "library") {
      const today = new Date().toISOString().slice(0, 10);
      const loans = rows.filter((row) => row.payload?.memberId || row.payload?.memberName);
      const overdue = loans.filter((row) => String(row.payload?.returnDate ?? "") && String(row.payload?.returnDate) < today && row.status !== "done");
      metrics.push(
        { label: "Catalogue / loan entries", value: String(rows.length), hint: "Books and circulation records" },
        { label: "Borrowed items", value: String(loans.length), hint: "Entries with a borrower recorded" },
        { label: "Past due", value: String(overdue.length), hint: "Borrowed entries past their return date" },
      );
    } else if (moduleId === "transport") {
      const vehicles = new Set(rows.map((row) => String(row.payload?.vehicleNo ?? "")).filter(Boolean));
      const routes = new Set(rows.map((row) => String(row.payload?.route ?? "")).filter(Boolean));
      metrics.push(
        { label: "Transport records", value: String(rows.length), hint: "Routes, stops and assignments" },
        { label: "Routes", value: String(routes.size), hint: "Distinct route names" },
        { label: "Vehicles", value: String(vehicles.size), hint: "Distinct vehicle registrations" },
      );
    } else if (moduleId === "hostel") {
      const rooms = new Set(rows.map((row) => String(row.payload?.room ?? "")).filter(Boolean));
      const occupants = rows.filter((row) => row.payload?.studentId || row.payload?.studentName).length;
      metrics.push(
        { label: "Hostel records", value: String(rows.length), hint: "Room and resident entries" },
        { label: "Residents recorded", value: String(occupants), hint: "Entries linked to a student" },
        { label: "Rooms represented", value: String(rooms.size), hint: "Distinct room numbers" },
      );
    } else if (moduleId === "payroll") {
      const paid = rows.filter((row) => String(row.payload?.paymentStatus ?? "").toLowerCase() === "paid");
      const net = rows.reduce((sum, row) => sum + (Number(row.payload?.netPay) || row.amount || 0), 0);
      metrics.push(
        { label: "Payroll entries", value: String(rows.length), hint: "Salary records in this workspace" },
        { label: "Marked paid", value: String(paid.length), hint: "Entries with paid status" },
        { label: "Net pay recorded", value: `₹${net.toLocaleString("en-IN")}`, hint: "Sum of net pay values or recorded amounts" },
      );
    } else if (moduleId === "students") {
      const classes = new Set(rows.map((row) => String(row.payload?.class ?? "")).filter(Boolean));
      metrics.push(
        { label: "Student records", value: String(rows.length), hint: "Profiles in this workspace" },
        { label: "Classes represented", value: String(classes.size), hint: "Distinct classes recorded" },
        { label: "Open follow-ups", value: String(rows.filter((row) => row.status !== "done").length), hint: "Profiles with work still open" },
      );
    }
    return metrics;
  }, [rows, moduleId]);

  const shown = rows.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      (!q || `${r.title} ${r.person} ${r.notes}`.toLowerCase().includes(q.toLowerCase())),
  ).sort((a, b) => {
    if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === "due") return (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31");
    if (sortBy === "amount") return b.amount - a.amount;
    if (sortBy === "title") return a.title.localeCompare(b.title);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return setErr("Please add a title.");
    const missing = fields.find((field) => field.required && !String(payload[field.key] ?? "").trim());
    if (missing) return setErr(`Please complete: ${missing.label}.`);
    setErr("");
    setSaving(true);
    try {
      const body = { ...form, amount: Number(form.amount) || 0, payload, feature: feature.key };
      const res = await fetch(editing ? `/api/records/${editing}` : "/api/records", {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.record) throw new Error(data.error ?? "Could not save this record. Please try again.");
      const next = editing ? rows.map((r) => (r.id === editing ? data.record : r)) : [data.record, ...rows];
      setRows(next);
      onChange(next.length, enabled);
      setForm(EMPTY);
      setPayload({});
      setEditing(null);
      setShowForm(false);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Could not save this record.");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(r: Rec, status: string) {
    setErr("");
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, status } : x)));
    try {
      const response = await fetch(`/api/records/${r.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
      if (!response.ok) throw new Error("Status could not be updated. Your list has been refreshed.");
    } catch (error) {
      setRows((rs) => rs.map((x) => (x.id === r.id ? r : x)));
      setErr(error instanceof Error ? error.message : "Status could not be updated.");
    }
  }

  async function remove(r: Rec) {
    if (!window.confirm(`Delete “${r.title}”? This cannot be undone.`)) return;
    const previous = rows;
    const next = rows.filter((x) => x.id !== r.id);
    setRows(next);
    onChange(next.length, enabled);
    setErr("");
    try {
      const response = await fetch(`/api/records/${r.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("This record could not be deleted.");
    } catch (error) {
      setRows(previous);
      onChange(previous.length, enabled);
      setErr(error instanceof Error ? error.message : "This record could not be deleted.");
    }
  }

  function toggleSelected(id: number, checked: boolean) {
    setSelectedIds((current) => checked ? (current.includes(id) ? current : [...current, id]) : current.filter((value) => value !== id));
  }

  async function bulkSetStatus(status: string) {
    if (!selectedIds.length) return;
    setBulkBusy(true);
    setErr("");
    try {
      const results = await Promise.all(selectedIds.map((id) => fetch(`/api/records/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      })));
      if (results.some((response) => !response.ok)) throw new Error("Some records could not be updated. The list has been refreshed.");
      setRows((current) => current.map((row) => selectedIds.includes(row.id) ? { ...row, status } : row));
      setSelectedIds([]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bulk update failed.";
      await load();
      setErr(message);
      setSelectedIds([]);
    } finally {
      setBulkBusy(false);
    }
  }

  async function bulkDelete() {
    if (!selectedIds.length || !window.confirm(`Delete ${selectedIds.length} selected records? This cannot be undone.`)) return;
    setBulkBusy(true);
    setErr("");
    try {
      const results = await Promise.all(selectedIds.map((id) => fetch(`/api/records/${id}`, { method: "DELETE" })));
      if (results.some((response) => !response.ok)) throw new Error("Some records could not be deleted. The list has been refreshed.");
      const next = rows.filter((row) => !selectedIds.includes(row.id));
      setRows(next);
      onChange(next.length, enabled);
      setSelectedIds([]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bulk delete failed.";
      await load();
      setErr(message);
      setSelectedIds([]);
    } finally {
      setBulkBusy(false);
    }
  }

  async function toggle() {
    const previous = enabled;
    const v = !enabled;
    setEnabled(v);
    onChange(rows.length, v);
    try {
      const response = await fetch("/api/features/toggle", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ feature: feature.key, enabled: v }) });
      if (!response.ok) throw new Error("Feature setting could not be saved.");
    } catch (error) {
      setEnabled(previous);
      onChange(rows.length, previous);
      setErr(error instanceof Error ? error.message : "Feature setting could not be saved.");
    }
  }

  async function sample() {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/records", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ feature: feature.key, sample: true }) });
      if (!res.ok) throw new Error("Sample records could not be loaded. Please try again.");
      await load();
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Sample records could not be loaded.");
    } finally {
      setSaving(false);
    }
  }

  function exportCsv() {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const payloadKeys = fields.map((field) => field.key).filter((key) => rows.some((row) => row.payload?.[key] !== undefined && row.payload?.[key] !== ""));
    const columns = ["Title", "Assigned person", "Amount (INR)", "Due date", "Status", "Notes", ...payloadKeys.map((key) => fields.find((field) => field.key === key)?.label ?? key)];
    const csv = [columns.map(esc).join(","), ...rows.map((r) => [
      r.title, r.person, r.amount, r.dueDate, r.status, r.notes, ...payloadKeys.map((key) => r.payload?.[key] ?? ""),
    ].map(esc).join(","))].join("\n");
    const blobUrl = URL.createObjectURL(new Blob(["\\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `${feature.key}.csv`;
    a.click();
    URL.revokeObjectURL(blobUrl);
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
        className={fullPage ? "schoolos-feature relative -mx-4 -my-4 flex min-h-[calc(100vh-72px)] w-[calc(100%+2rem)] max-w-none flex-col overflow-visible rounded-none border-0 bg-transparent shadow-none md:-mx-8 md:w-[calc(100%+4rem)]" : "schoolos-feature fixed inset-y-0 right-0 z-[61] flex w-full max-w-2xl flex-col border-l border-white/10 bg-[#080a18] shadow-[-30px_0_100px_rgba(0,0,0,0.6)]"}
        style={{ boxShadow: fullPage ? "none" : `-20px 0 100px -20px ${color}55` }}
      >
        <div className="border-b border-white/10 bg-[#0c1020] px-5 py-6 md:px-8">
          {!fullPage && <button onClick={onClose} className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Close"><X size={18} /></button>}
          <div className="flex items-center gap-3 text-xs" style={{ color }}>
            <Icon name={icon} size={16} /> {moduleTitle}
          </div>
          <h2 className="font-display mt-2 pr-10 text-2xl font-bold text-white">{feature.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{feature.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button onClick={toggle} className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200" aria-pressed={enabled}>
              <span className="relative h-5 w-9 rounded-full transition" style={{ background: enabled ? color : "#334155" }}>
                <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-0.5 h-4 w-4 rounded-full bg-white" style={{ left: enabled ? 18 : 2 }} />
              </span>
              {enabled ? "Feature on" : "Feature off"}
            </button>
            <button onClick={exportCsv} disabled={!rows.length} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10 disabled:opacity-40"><Download size={13} /> Export CSV</button>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-[#0a0e1c] px-5 py-2 md:px-8" aria-label="Workspace views">{([{id:"overview",label:"Overview"},{id:"records",label:"All records"},{id:"insights",label:"Insights"},...(moduleId === "events" ? [{id:"calendar" as const,label:"Calendar"}] : [])] as const).map((tab) => <button key={tab.id} onClick={() => setActiveView(tab.id)} className="rounded-lg px-4 py-2.5 text-xs font-medium transition" style={{background:activeView===tab.id?"rgba(255,255,255,.09)":"transparent",color:activeView===tab.id?"#fff":"#94a3b8"}}>{tab.label}</button>)}</nav>
        <div className="grid grid-cols-2 gap-3 border-b border-white/10 bg-[#0c1020] p-4 md:grid-cols-4 md:px-8">
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

        <div className="flex-1 space-y-5 overflow-y-auto bg-[#080b16] p-5 md:p-8">
          {err && !showForm && <div role="alert" className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</div>}
          {(activeView === "overview" || activeView === "records") && <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#0d1222] p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="text-sm font-semibold text-white">{activeView === "overview" ? "Your activity" : "All records"}</div><p className="mt-1 text-xs text-slate-500">Search, filter and manage work in this workspace.</p></div><div className="flex items-center gap-2">
            <input className="input !min-w-0 !py-2" placeholder="Search records…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search records" />
            <select aria-label="Sort records" className="input !w-auto !min-w-[132px] !py-2 text-xs" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="due">Due date</option>
              <option value="amount">Highest amount</option>
              <option value="title">Title A–Z</option>
            </select>
            <button
              onClick={() => { setShowForm((v) => !v); setEditing(null); setForm(EMPTY); setPayload({}); }}
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              style={{ background: color }}
            >
              <Plus size={16} /> Add new
            </button>
          </div></div>}

          {activeView === "calendar" && moduleId === "events" ? (() => {
            const year = calendarMonth.getFullYear();
            const month = calendarMonth.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const dayCount = new Date(year, month + 1, 0).getDate();
            const cells = [...Array(firstDay).fill(null), ...Array.from({ length: dayCount }, (_, index) => index + 1)];
            const dateKey = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const eventDate = (record: Rec) => String(record.payload?.eventDate ?? record.dueDate ?? "").slice(0, 10);
            const todayKey = new Date().toLocaleDateString("en-CA");
            return <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0d1222] p-4">
                <div><div className="text-xs text-slate-500">School events</div><h3 className="font-display text-xl font-bold text-white">{calendarMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</h3></div>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Previous month" onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} className="rounded-xl border border-white/10 p-2 text-slate-300 hover:bg-white/10"><ChevronLeft size={17}/></button>
                  <button type="button" onClick={() => setCalendarMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/10">Today</button>
                  <button type="button" aria-label="Next month" onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} className="rounded-xl border border-white/10 p-2 text-slate-300 hover:bg-white/10"><ChevronRight size={17}/></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => <div key={day} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">{day}</div>)}
                {cells.map((day, index) => {
                  if (!day) return <div key={`blank-${index}`} className="min-h-24 rounded-xl bg-white/[0.015] sm:min-h-28" />;
                  const key = dateKey(day);
                  const dayEvents = rows.filter((record) => eventDate(record) === key);
                  return <div key={key} className={`min-h-24 overflow-hidden rounded-xl border p-1.5 sm:min-h-28 sm:p-2 ${key === todayKey ? "border-violet-400/50 bg-violet-500/10" : "border-white/[0.07] bg-white/[0.025]"}`}>
                    <div className={`mb-1 text-xs font-semibold ${key === todayKey ? "text-violet-200" : "text-slate-400"}`}>{day}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((record) => <button key={record.id} type="button" onClick={() => { startEdit(record); setActiveView("overview"); }} title={record.title} className="block w-full truncate rounded-md px-1.5 py-1 text-left text-[10px] font-medium text-white" style={{ background: `${color}45` }}>{record.title}</button>)}
                      {dayEvents.length > 3 && <div className="px-1 text-[9px] text-slate-500">+{dayEvents.length - 3} more</div>}
                    </div>
                  </div>;
                })}
              </div>
              {rows.filter((record) => !eventDate(record)).length > 0 && <p className="text-xs text-slate-500">{rows.filter((record) => !eventDate(record)).length} event records have no date and are not placed on the calendar.</p>}
            </section>;
          })() : null}

          {activeView === "insights" ? <div className="space-y-4">
            {insights.length > 0 && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{insights.map((metric) => <div key={metric.label} className="rounded-2xl border border-white/10 bg-[#0d1222] p-5"><div className="text-xs text-slate-500">{metric.label}</div><div className="mt-2 break-words text-3xl font-bold text-white">{metric.value}</div><p className="mt-2 text-xs text-slate-500">{metric.hint}</p></div>)}</div>}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-5"><div className="text-xs text-slate-500">Completion rate</div><div className="mt-2 text-3xl font-bold text-white">{stats.total ? Math.round(stats.done / stats.total * 100) : 0}%</div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full" style={{width: (stats.total ? stats.done / stats.total * 100 : 0) + "%",background:color}} /></div><p className="mt-3 text-xs text-slate-500">{stats.done} completed of {stats.total} total records</p></div>
              <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-5"><div className="text-xs text-slate-500">Open work</div><div className="mt-2 text-3xl font-bold text-white">{stats.open}</div><p className="mt-3 text-xs text-slate-500">Items that still need attention</p></div>
            </div>
          </div> : null}

          {selectedIds.length > 0 && <div className="flex flex-wrap items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-500/10 p-3">
            <span className="mr-auto text-xs font-semibold text-violet-100">{selectedIds.length} selected</span>
            <select aria-label="Set status for selected records" className="input !w-auto !py-2 text-xs" defaultValue="" disabled={bulkBusy} onChange={(event) => { if (event.target.value) void bulkSetStatus(event.target.value); event.target.value = ""; }}>
              <option value="">Change status…</option>{STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
            </select>
            <button type="button" disabled={bulkBusy} onClick={() => void bulkDelete()} className="rounded-lg border border-rose-400/25 px-3 py-2 text-xs text-rose-200 hover:bg-rose-500/10 disabled:opacity-50">{bulkBusy ? "Working…" : "Delete selected"}</button>
            <button type="button" disabled={bulkBusy} onClick={() => setSelectedIds([])} className="rounded-lg px-2 py-2 text-xs text-slate-400 hover:text-white">Clear</button>
          </div>}
          {(activeView === "overview" || activeView === "records") && <div className="flex flex-wrap gap-1.5">
            {[{ id: "all", label: "All", color }, ...STATUSES].map((s) => (
              <button key={s.id} onClick={() => setFilter(s.id)} className="rounded-full px-3 py-1 text-xs transition" style={{ background: filter === s.id ? `${s.color}33` : "rgba(255,255,255,0.05)", color: filter === s.id ? s.color : "#94a3b8", boxShadow: filter === s.id ? `0 0 14px ${s.color}44` : undefined }}>
                {s.label}
              </button>
            ))}
          </div>}

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

          {(activeView === "overview" || activeView === "records") && (loading ? (
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
                  const payloadEntries = Object.entries(r.payload ?? {}).filter(([, value]) => value !== "" && value !== null && value !== undefined);
                  const expanded = expandedIds.includes(r.id);
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
                        <input type="checkbox" aria-label={`Select ${r.title}`} checked={selectedIds.includes(r.id)} onChange={(event) => toggleSelected(r.id, event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-violet-400" />
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
                          {payloadEntries.length > 0 && <>
                            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-white/[0.06] pt-2">{(expanded ? payloadEntries : payloadEntries.slice(0, 8)).map(([k, v]) => <div key={k} className="min-w-0"><dt className="truncate text-[9px] uppercase tracking-wider text-slate-600">{fields.find((field) => field.key === k)?.label ?? k.replace(/([A-Z])/g, " $1")}</dt><dd className="truncate text-xs text-slate-300">{String(v)}</dd></div>)}</dl>
                            {payloadEntries.length > 8 && <button type="button" onClick={() => setExpandedIds((ids) => expanded ? ids.filter((id) => id !== r.id) : [...ids, r.id])} className="mt-2 text-[11px] font-medium text-violet-300 hover:text-violet-200">{expanded ? "Show less" : `Show all ${payloadEntries.length} fields`}</button>}
                          </>}
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
          ))}
        </div>
      </motion.aside>
    </>
  );
}
