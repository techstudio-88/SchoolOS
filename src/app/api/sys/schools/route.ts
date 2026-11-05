import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auditLog, db, records, featureSettings, schools } from "@/db";
import { isSuperAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

const PLANS = ["trial", "starter", "pro", "enterprise"];
const STATUSES = ["active", "trial", "suspended"];

async function guard() {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: "not found" }, { status: 404 });
  return null;
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(b.name ?? "").trim().slice(0, 120);
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "school";
  const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  const [row] = await db
    .insert(schools)
    .values({
      name,
      slug,
      ownerName: String(b.ownerName ?? "School Owner").slice(0, 80),
      ownerEmail: String(b.ownerEmail ?? "").slice(0, 120),
      city: String(b.city ?? "").slice(0, 80),
      plan: PLANS.includes(String(b.plan)) ? String(b.plan) : "trial",
      status: "trial",
      studentsCount: Math.max(0, Number(b.studentsCount) || 0),
    })
    .returning();
  await db.insert(auditLog).values({ action: "school.create", detail: `${name} (#${row.id})` });
  return NextResponse.json({ school: row });
}

export async function PATCH(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(b.id);
  const patch: Partial<typeof schools.$inferInsert> = {};
  if (PLANS.includes(String(b.plan))) patch.plan = String(b.plan);
  if (STATUSES.includes(String(b.status))) patch.status = String(b.status);
  if (!id || !Object.keys(patch).length) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const [row] = await db.update(schools).set(patch).where(eq(schools.id, id)).returning();
  await db.insert(auditLog).values({ action: "school.update", detail: `#${id} ${JSON.stringify(patch)}` });
  return NextResponse.json({ school: row });
}

export async function DELETE(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "bad request" }, { status: 400 });
  await db.delete(records).where(eq(records.schoolId, id));
  await db.delete(featureSettings).where(eq(featureSettings.schoolId, id));
  await db.delete(schools).where(eq(schools.id, id));
  await db.insert(auditLog).values({ action: "school.delete", detail: `#${id}` });
  return NextResponse.json({ ok: true });
}
