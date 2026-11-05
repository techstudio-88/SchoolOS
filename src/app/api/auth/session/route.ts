import { NextResponse } from "next/server";
import { PANEL_MAP } from "@/lib/catalog";
import { SESSION_COOKIE, encodeSession, ensureDemoSchool } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { role?: string; name?: string };
    const role = body.role && PANEL_MAP[body.role] ? body.role : "principal";
    const schoolId = await ensureDemoSchool();
    if (!schoolId) {
      return NextResponse.json(
        { error: "Demo workspace is not available yet. Please try again shortly." },
        { status: 503 },
      );
    }

    const res = NextResponse.json({ ok: true, role });
    res.cookies.set(
      SESSION_COOKIE,
      encodeSession({
        role,
        schoolId,
        demo: true,
        name: body.name?.slice(0, 60) || PANEL_MAP[role].title,
      }),
      {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        secure: process.env.NODE_ENV === "production",
      },
    );
    return res;
  } catch (error) {
    console.error("SchoolOS demo session creation failed:", error);
    return NextResponse.json(
      { error: "Could not connect to the demo workspace. Please check the database connection and try again." },
      { status: 503 },
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
