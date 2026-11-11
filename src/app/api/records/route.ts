import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db, featureSettings, records } from "@/db";
import { FEATURE_MAP, SAMPLE_PEOPLE } from "@/lib/catalog";
import { getSession } from "@/lib/session";
import { PANEL_MAP } from "@/lib/catalog";
import { findTimetableConflict } from "@/lib/timetable";
import { getWorkflowFields } from "@/lib/workflow-fields";

export const dynamic = "force-dynamic";

const STATUS = ["open", "in_progress", "done", "flagged"];

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const key = new URL(req.url).searchParams.get("feature") ?? "";
  const feature = FEATURE_MAP[key];
  if (!feature) return NextResponse.json({ error: "unknown feature" }, { status: 400 });
  if (!PANEL_MAP[session.role]?.modules.includes(feature.moduleId)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
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
  if (!PANEL_MAP[session.role]?.modules.includes(feature.moduleId)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

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
  const payload = (b.payload && typeof b.payload === "object" && !Array.isArray(b.payload)) ? b.payload as Record<string, string | number | boolean | null> : {};
  const missing = getWorkflowFields(feature.moduleId).find((field) => field.required && !String(payload[field.key] ?? "").trim());
  if (missing) return NextResponse.json({ error: `${missing.label} is required.`, field: missing.key }, { status: 400 });
  const invalidValue = Object.entries(payload).find(([key, value]) =>
    key.length > 80 || (value !== null && !["string", "number", "boolean"].includes(typeof value)) ||
    (typeof value === "string" && value.length > 4000) ||
    (typeof value === "number" && !Number.isFinite(value))
  );
  if (invalidValue) return NextResponse.json({ error: "One of the form fields has an invalid or oversized value.", field: invalidValue[0] }, { status: 400 });
  if (feature.moduleId === "timetable") {
    const existing = await db.select({ id: records.id, payload: records.payload }).from(records)
      .where(and(eq(records.schoolId, session.schoolId), eq(records.moduleId, "timetable")));
    const conflict = findTimetableConflict(payload, existing);
    if (conflict) return NextResponse.json({ error: conflict.message, conflict: conflict.type }, { status: 409 });
  }
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
      payload,
    })
    .returning();
  return NextResponse.json({ record: row });
}
