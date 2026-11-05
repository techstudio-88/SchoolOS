import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auditLog, db, schools } from "@/db";
import { SESSION_COOKIE, encodeSession, isSuperAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Super-admin only: open any school's owner panel to help with support. */
export async function POST(req: Request) {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: "not found" }, { status: 404 });
  const { schoolId } = (await req.json().catch(() => ({}))) as { schoolId?: number };
  const [school] = await db.select().from(schools).where(eq(schools.id, Number(schoolId))).limit(1);
  if (!school) return NextResponse.json({ error: "not found" }, { status: 404 });
  await db.insert(auditLog).values({ action: "school.impersonate", detail: `${school.name} (#${school.id})` });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, encodeSession({ role: "owner", schoolId: school.id, demo: false, name: `Support @ ${school.name}`.slice(0, 60) }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
