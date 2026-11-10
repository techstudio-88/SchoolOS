import { NextResponse } from "next/server";
import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { db, records } from "@/db";
import { getSession } from "@/lib/session";
import { MODULE_MAP, PANEL_MAP } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const query = new URL(req.url).searchParams.get("q")?.trim().slice(0, 100) ?? "";
  if (query.length < 2) return NextResponse.json({ results: [] });
  const modules = PANEL_MAP[session.role]?.modules ?? [];
  if (!modules.length) return NextResponse.json({ results: [] });
  const pattern = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
  const rows = await db.select({
    id: records.id, title: records.title, person: records.person,
    status: records.status, dueDate: records.dueDate, moduleId: records.moduleId,
    featureKey: records.featureKey, createdAt: records.createdAt,
  }).from(records)
    .where(and(
      eqSchool(session.schoolId),
      inArray(records.moduleId, modules),
      or(ilike(records.title, pattern), ilike(records.person, pattern), ilike(records.notes, pattern)),
    ))
    .orderBy(desc(records.createdAt)).limit(12);
  return NextResponse.json({ results: rows.map((row) => ({
    ...row,
    moduleTitle: MODULE_MAP[row.moduleId]?.title ?? row.moduleId,
    href: `/app/${session.role}/${row.moduleId}/${encodeURIComponent(row.featureKey)}`,
  })) });
}

function eqSchool(schoolId: number) {
  return eq(records.schoolId, schoolId);
}
