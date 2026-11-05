import { NextResponse } from "next/server";
import { PANEL_MAP } from "@/lib/catalog";
import { SESSION_COOKIE, encodeSession, ensureDemoSchool } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Skippable login: any role can be entered in demo mode. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { role?: string; name?: string };
  const role = body.role && PANEL_MAP[body.role] ? body.role : "principal";
  const schoolId = await ensureDemoSchool();
  const res = NextResponse.json({ ok: true, role });
  res.cookies.set(
    SESSION_COOKIE,
    encodeSession({ role, schoolId, demo: true, name: body.name?.slice(0, 60) || PANEL_MAP[role].title }),
    { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30, secure: process.env.NODE_ENV === "production" },
  );
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
