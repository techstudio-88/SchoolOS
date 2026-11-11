import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db, records } from "@/db";
import { getSession } from "@/lib/session";
import { MODULE_MAP, PANEL_MAP } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const modules = PANEL_MAP[session.role]?.modules ?? [];
  if (!modules.length) return NextResponse.json({ notifications: [] });

  const rows = await db.select({
    id: records.id,
    title: records.title,
    person: records.person,
    amount: records.amount,
    dueDate: records.dueDate,
    status: records.status,
    moduleId: records.moduleId,
    featureKey: records.featureKey,
    payload: records.payload,
    createdAt: records.createdAt,
  }).from(records)
    .where(and(eq(records.schoolId, session.schoolId), inArray(records.moduleId, modules)))
    .orderBy(desc(records.createdAt))
    .limit(400);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const soon = new Date(today);
  soon.setDate(soon.getDate() + 7);
  const soonKey = `${soon.getFullYear()}-${String(soon.getMonth() + 1).padStart(2, "0")}-${String(soon.getDate()).padStart(2, "0")}`;

  const notifications = rows.flatMap((row) => {
    const href = `/app/${session.role}/${row.moduleId}/${encodeURIComponent(row.featureKey)}`;
    const moduleTitle = MODULE_MAP[row.moduleId]?.title ?? row.moduleId;
    const payload = row.payload ?? {};
    const items: Array<{ id: string; title: string; body: string; kind: string; moduleTitle: string; href: string }> = [];

    if (row.dueDate && row.status !== "done") {
      const due = new Date(row.dueDate + "T00:00:00");
      if (!Number.isNaN(due.getTime())) {
        const kind = due < today ? "overdue" : due <= soon ? "due" : "";
        if (kind) items.push({
          id: `${kind}-${row.id}`,
          title: `${kind === "overdue" ? "Overdue" : "Due soon"}: ${row.title}`,
          body: `Due ${row.dueDate}`,
          kind,
          moduleTitle,
          href,
        });
      }
    }

    if (row.moduleId === "attendance" && String(payload.attendance ?? "").toLowerCase() === "absent") {
      const attendanceDate = String(payload.date ?? row.createdAt.toISOString().slice(0, 10));
      if (attendanceDate === todayKey) items.push({
        id: `absent-${row.id}`,
        title: `Absence recorded: ${row.person || row.title}`,
        body: `Attendance marked absent today · ${attendanceDate}`,
        kind: "attendance",
        moduleTitle,
        href,
      });
    }

    if (row.moduleId === "fees" && !["paid", "done", "completed"].includes(String(payload.paymentStatus ?? "").toLowerCase()) && row.amount > 0 && !row.dueDate) {
      items.push({
        id: `fee-pending-${row.id}`,
        title: `Fee payment needs review: ${row.title}`,
        body: `₹${row.amount.toLocaleString("en-IN")} · ${row.person || String(payload.studentName ?? "Student")}`,
        kind: "due",
        moduleTitle,
        href,
      });
    }

    if (row.moduleId === "events") {
      const eventDate = String(payload.eventDate ?? row.dueDate ?? "").slice(0, 10);
      if (eventDate >= todayKey && eventDate <= soonKey) items.push({
        id: `event-${row.id}`,
        title: `Upcoming event: ${row.title}`,
        body: `Scheduled for ${eventDate}`,
        kind: "event",
        moduleTitle,
        href,
      });
    }

    if (row.moduleId === "library" && row.status !== "done") {
      const returnDate = String(payload.returnDate ?? "").slice(0, 10);
      if (returnDate && returnDate < todayKey) items.push({
        id: `library-overdue-${row.id}`,
        title: `Library item overdue: ${row.title}`,
        body: `Return date was ${returnDate}`,
        kind: "overdue",
        moduleTitle,
        href,
      });
    }

    if (row.moduleId === "leave" && !["done", "approved", "rejected"].includes(String(payload.approval ?? row.status).toLowerCase())) {
      items.push({
        id: `leave-review-${row.id}`,
        title: `Leave request awaiting review: ${row.title}`,
        body: String(payload.employeeName ?? row.person ?? "Staff request"),
        kind: "action",
        moduleTitle,
        href,
      });
    }

    return items;
  }).slice(0, 40);

  return NextResponse.json({ notifications });
}
