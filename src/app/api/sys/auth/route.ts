import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminToken, checkAdminKey } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { key } = (await req.json().catch(() => ({}))) as { key?: string };
  if (!adminToken()) {
    return NextResponse.json({ error: "SUPER_ADMIN_KEY is not configured on the server." }, { status: 503 });
  }
  if (!checkAdminKey(String(key ?? ""))) {
    await new Promise((r) => setTimeout(r, 700)); // slow down brute force
    return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
