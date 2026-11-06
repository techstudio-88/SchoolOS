import { NextResponse } from "next/server";
import { db, featureSettings } from "@/db";
import { FEATURE_MAP } from "@/lib/catalog";
import { getSession } from "@/lib/session";
import { PANEL_MAP } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { feature?: string; enabled?: boolean };
  if (!b.feature || !FEATURE_MAP[b.feature]) return NextResponse.json({ error: "unknown feature" }, { status: 400 });
  const feature = FEATURE_MAP[b.feature];
  if (!PANEL_MAP[session.role]?.modules.includes(feature.moduleId)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const enabled = b.enabled !== false;
  await db
    .insert(featureSettings)
    .values({ schoolId: session.schoolId, featureKey: b.feature, enabled })
    .onConflictDoUpdate({
      target: [featureSettings.schoolId, featureSettings.featureKey],
      set: { enabled },
    });
  return NextResponse.json({ ok: true, enabled });
}
