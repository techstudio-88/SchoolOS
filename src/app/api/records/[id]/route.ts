import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db, records } from "@/db";
import { getSession } from "@/lib/session";
import { PANEL_MAP } from "@/lib/catalog";

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
  if (typeof b.title === "string" && b.title.trim()) patch.title = b.title.trim().slice(0, 160);
  if (typeof b.person === "string") patch.person = b.person.slice(0, 80);
  if (typeof b.notes === "string") patch.notes = b.notes.slice(0, 1000);
  if (typeof b.dueDate === "string") patch.dueDate = b.dueDate.slice(0, 10);
  if (b.amount !== undefined) patch.amount = Math.max(0, Math.min(2_000_000_000, Number(b.amount) || 0));
  if (typeof b.status === "string" && STATUS.includes(b.status)) patch.status = b.status;
  if (b.payload && typeof b.payload === "object" && !Array.isArray(b.payload)) patch.payload = b.payload as Record<string, string | number | boolean | null>;
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
