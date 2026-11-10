import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db, records } from "@/db";
import { getSession } from "@/lib/session";
import { FEATURE_MAP, MODULE_MAP, PANEL_MAP } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const modules = PANEL_MAP[session.role]?.modules ?? [];
  if (!modules.length) return NextResponse.json({ notifications: [] });

  const rows = await db.select({
    id: records.id,
    title: records.title,
    dueDate: records.dueDate,
    status: records.status,
    moduleId: records.moduleId,
    featureKey: records.featureKey,
  }).from(records)
    .where(and(eq(records.schoolId, session.schoolId), inArray(records.moduleId, modules)))
    .orderBy(desc(records.createdAt))
    .limit(250);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const soon = new Date(today);
  soon.setDate(soon.getDate() + 3);

  const notifications = rows.flatMap((row) => {
    if (!row.dueDate || row.status === "done") return [];
    const due = new Date(row.dueDate + "T00:00:00");
    if (Number.isNaN(due.getTime())) return [];
    const kind = due < today ? "overdue" : due <= soon ? "due" : "";
    if (!kind) return [];
    return [{
      id: `${kind}-${row.id}`,
      title: `${kind === "overdue" ? "Overdue" : "Due soon"}: ${row.title}`,
      body: `Due ${row.dueDate}`,
      kind,
      moduleTitle: MODULE_MAP[row.moduleId]?.title ?? row.moduleId,
      href: `/app/${session.role}/${row.moduleId}/${encodeURIComponent(row.featureKey)}`,
      featureName: FEATURE_MAP[row.featureKey]?.name ?? row.featureKey,
    }];
  }).slice(0, 30);

  return NextResponse.json({ notifications });
}
