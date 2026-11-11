import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db, automationRules } from "@/db";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const TRIGGERS = ["attendance_absent", "fee_due", "event_soon", "leave_pending"] as const;

type OwnerAuth =
  | { ok: true; session: NonNullable<Awaited<ReturnType<typeof getSession>>> }
  | { ok: false; response: NextResponse };

async function ownerSession(): Promise<OwnerAuth> {
  const session = await getSession();
  if (!session) return { ok: false, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  if (session.role !== "owner") return { ok: false, response: NextResponse.json({ error: "Only the school owner can manage automations." }, { status: 403 }) };
  return { ok: true, session };
}

export async function GET() {
  const auth = await ownerSession();
  if (!auth.ok) return auth.response;
  const rows = await db.select().from(automationRules)
    .where(eq(automationRules.schoolId, auth.session.schoolId))
    .orderBy(desc(automationRules.createdAt));
  return NextResponse.json({ rules: rows });
}

export async function POST(req: Request) {
  const auth = await ownerSession();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const name = String(body.name ?? "").trim().slice(0, 80);
  const trigger = String(body.trigger ?? "");
  if (name.length < 3) return NextResponse.json({ error: "Give this automation a name (at least 3 characters)." }, { status: 400 });
  if (!TRIGGERS.includes(trigger as typeof TRIGGERS[number])) return NextResponse.json({ error: "Choose a supported automation trigger." }, { status: 400 });
  const [rule] = await db.insert(automationRules).values({
    schoolId: auth.session.schoolId,
    name,
    trigger,
    action: "in_app_alert",
    enabled: true,
  }).returning();
  return NextResponse.json({ rule }, { status: 201 });
}

export async function PATCH(req: Request) {
  const auth = await ownerSession();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 1 || typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "A valid rule ID and enabled value are required." }, { status: 400 });
  }
  const [rule] = await db.update(automationRules)
    .set({ enabled: body.enabled })
    .where(and(eq(automationRules.id, id), eq(automationRules.schoolId, auth.session.schoolId)))
    .returning();
  if (!rule) return NextResponse.json({ error: "Automation not found." }, { status: 404 });
  return NextResponse.json({ rule });
}

export async function DELETE(req: Request) {
  const auth = await ownerSession();
  if (!auth.ok) return auth.response;
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "A valid rule ID is required." }, { status: 400 });
  const [rule] = await db.delete(automationRules)
    .where(and(eq(automationRules.id, id), eq(automationRules.schoolId, auth.session.schoolId)))
    .returning({ id: automationRules.id });
  if (!rule) return NextResponse.json({ error: "Automation not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
