import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db, records } from "@/db";
import { getSession } from "@/lib/session";
import { PANEL_MAP } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const modules = PANEL_MAP[session.role]?.modules ?? [];
  if (!modules.length) return NextResponse.json({ notifications: [] });
  const rows = await db.select().from(records)
    .where(and(eq(records.schoolId, session.schoolId), inArray(records.moduleId, modules)))
    .orderBy(desc(records.createdAt)).limit(100);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const soon = new Date(today);
  soon.setDate(soon.getDate() + 3);
  const notifications = rows.flatMap((row) => {
    if (!row.dueDate || row.status === "done") return [];
    const due = new Date(row.dueDate + "T00:00:00");
    if (Number.isNaN(due.getTime())) return [];
    if (due < today) return [{ id: "overdue-" + row.id, title: "Overdue: " + row.title, body: "Due " + row.dueDate + " · " + row.moduleId, kind: "overdue" }];
    if (due <= soon) return [{ id: "due-" + row.id, title: "Due soon: " + row.title, body: "Due " + row.dueDate + " · " + row.moduleId, kind: "due" }];
    return [];
  }).slice(0, 20);
  return NextResponse.json({ notifications });
}
