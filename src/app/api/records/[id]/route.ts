import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db, records } from "@/db";
import { getSession } from "@/lib/session";
import { PANEL_MAP } from "@/lib/catalog";
import { findTimetableConflict } from "@/lib/timetable";
import { findTimetableConflict } from "@/lib/timetable";

export const dynamic = "force-dynamic";

const STATUS = ["open", "in_progress", "done", "flagged"];

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = Number((await ctx.params).id);
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const allowedModules = PANEL_MAP[session.role]?.modules ?? [];
  if (!allowedModules.length) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const patch: Partial<typeof records.$inferInsert> = {};
  if (b.payload && typeof b.payload === "object" && !Array.isArray(b.payload)) {
    const [current] = await db.select({ moduleId: records.moduleId }).from(records)
      .where(and(eq(records.id, id), eq(records.schoolId, session.schoolId), inArray(records.moduleId, allowedModules))).limit(1);
    if (!current) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (current.moduleId === "timetable") {
      const existing = await db.select({ id: records.id, payload: records.payload }).from(records)
        .where(and(eq(records.schoolId, session.schoolId), eq(records.moduleId, "timetable")));
      const conflict = findTimetableConflict(b.payload as Record<string, unknown>, existing, id);
      if (conflict) return NextResponse.json({ error: conflict.message, conflict: conflict.type }, { status: 409 });
    }
  }
  if (typeof b.title === "string" && b.title.trim()) patch.title = b.title.trim().slice(0, 160);
  if (typeof b.person === "string") patch.person = b.person.slice(0, 80);
  if (typeof b.notes === "string") patch.notes = b.notes.slice(0, 1000);
  if (typeof b.dueDate === "string") patch.dueDate = b.dueDate.slice(0, 10);
  if (b.amount !== undefined) patch.amount = Math.max(0, Math.min(2_000_000_000, Number(b.amount) || 0));
  if (typeof b.status === "string" && STATUS.includes(b.status)) patch.status = b.status;
  if (b.payload && typeof b.payload === "object" && !Array.isArray(b.payload)) patch.payload = b.payload as Record<string, string | number | boolean | null>;
  if (patch.payload && typeof patch.payload === "object") {
    const current = await db.select({ id: records.id, moduleId: records.moduleId }).from(records)
      .where(and(eq(records.id, id), eq(records.schoolId, session.schoolId), inArray(records.moduleId, allowedModules))).limit(1);
    if (!current[0]) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (current[0].moduleId === "timetable") {
      const existing = await db.select({ id: records.id, payload: records.payload }).from(records)
        .where(and(eq(records.schoolId, session.schoolId), eq(records.moduleId, "timetable")));
      const conflict = findTimetableConflict(patch.payload, existing, id);
      if (conflict) return NextResponse.json({ error: conflict.message, conflict: conflict.type }, { status: 409 });
    }
  }
  if (!Object.keys(patch).length) return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  const [row] = await db
    .update(records)
    .set(patch)
    .where(and(eq(records.id, id), eq(records.schoolId, session.schoolId), inArray(records.moduleId, allowedModules)))
    .returning();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ record: row });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = Number((await ctx.params).id);
  const allowedModules = PANEL_MAP[session.role]?.modules ?? [];
  if (!allowedModules.length) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await db.delete(records).where(and(eq(records.id, id), eq(records.schoolId, session.schoolId), inArray(records.moduleId, allowedModules)));
  return NextResponse.json({ ok: true });
}
