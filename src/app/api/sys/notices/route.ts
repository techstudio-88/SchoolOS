import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auditLog, db, platformNotices } from "@/db";
import { isSuperAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: "not found" }, { status: 404 });
  const b = (await req.json().catch(() => ({}))) as { title?: string; body?: string };
  const title = String(b.title ?? "").trim().slice(0, 140);
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  const [row] = await db
    .insert(platformNotices)
    .values({ title, body: String(b.body ?? "").slice(0, 600) })
    .returning();
  await db.insert(auditLog).values({ action: "notice.create", detail: title });
  return NextResponse.json({ notice: row });
}

export async function DELETE(req: Request) {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: "not found" }, { status: 404 });
  const id = Number(new URL(req.url).searchParams.get("id"));
  await db.delete(platformNotices).where(eq(platformNotices.id, id));
  await db.insert(auditLog).values({ action: "notice.delete", detail: `#${id}` });
  return NextResponse.json({ ok: true });
}
