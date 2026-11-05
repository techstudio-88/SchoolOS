import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db, featureSettings, records } from "@/db";
import { FEATURE_MAP, SAMPLE_PEOPLE } from "@/lib/catalog";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const STATUS = ["open", "in_progress", "done", "flagged"];

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const key = new URL(req.url).searchParams.get("feature") ?? "";
  if (!FEATURE_MAP[key]) return NextResponse.json({ error: "unknown feature" }, { status: 400 });
  const [rows, setting] = await Promise.all([
    db
      .select()
      .from(records)
      .where(and(eq(records.schoolId, session.schoolId), eq(records.featureKey, key)))
      .orderBy(desc(records.id))
      .limit(200),
    db
      .select()
      .from(featureSettings)
      .where(and(eq(featureSettings.schoolId, session.schoolId), eq(featureSettings.featureKey, key)))
      .limit(1),
  ]);
  return NextResponse.json({ records: rows, enabled: setting[0]?.enabled ?? true });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const key = String(b.feature ?? "");
  const feature = FEATURE_MAP[key];
  if (!feature) return NextResponse.json({ error: "unknown feature" }, { status: 400 });

  // Bulk sample data
  if (b.sample) {
    const rows = Array.from({ length: 5 }, (_, i) => ({
      schoolId: session.schoolId,
      moduleId: feature.moduleId,
      featureKey: key,
      title: `${feature.name} — item ${i + 1}`,
      person: SAMPLE_PEOPLE[(i * 3 + feature.index) % SAMPLE_PEOPLE.length],
      amount: ((feature.index + 1) * (i + 2) * 137) % 9000,
      dueDate: new Date(Date.now() + (i - 1) * 86400000 * 3).toISOString().slice(0, 10),
      status: STATUS[(i + feature.index) % STATUS.length],
      notes: "Sample entry — edit or delete me.",
    }));
    const created = await db.insert(records).values(rows).returning();
    return NextResponse.json({ records: created });
  }

  const title = String(b.title ?? "").trim().slice(0, 160);
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  const [row] = await db
    .insert(records)
    .values({
      schoolId: session.schoolId,
      moduleId: feature.moduleId,
      featureKey: key,
      title,
      person: String(b.person ?? "").slice(0, 80),
      amount: Math.max(0, Math.min(2_000_000_000, Number(b.amount) || 0)),
      dueDate: String(b.dueDate ?? "").slice(0, 10),
      status: STATUS.includes(String(b.status)) ? String(b.status) : "open",
      notes: String(b.notes ?? "").slice(0, 1000),
      payload: (b.payload && typeof b.payload === "object" && !Array.isArray(b.payload)) ? b.payload : {},
    })
    .returning();
  return NextResponse.json({ record: row });
}
