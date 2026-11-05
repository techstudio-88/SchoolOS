import { NextResponse } from "next/server";
import { db, records } from "@/db";
import { MODULE_MAP, PANEL_MAP, SAMPLE_PEOPLE } from "@/lib/catalog";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const STATUS = ["open", "in_progress", "done", "flagged", "done", "open"];

/** Fills the current panel's modules with realistic demo records so dashboards come alive. */
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const panel = PANEL_MAP[session.role];
  const rows: (typeof records.$inferInsert)[] = [];
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (const mid of panel.modules) {
    const mod = MODULE_MAP[mid];
    if (!mod) continue;
    const picks = [0, 3, 7, 11, 15].map((i) => mod.features[i % mod.features.length]);
    for (const f of picks) {
      for (let k = 0; k < 4; k++) {
        const created = new Date(Date.now() - Math.floor(rnd() * 13) * 86400000 - Math.floor(rnd() * 80000000));
        rows.push({
          schoolId: session.schoolId,
          moduleId: mid,
          featureKey: f.key,
          title: `${f.name} #${k + 1}`,
          person: SAMPLE_PEOPLE[Math.floor(rnd() * SAMPLE_PEOPLE.length)],
          amount: Math.floor(rnd() * 9000),
          dueDate: new Date(Date.now() + Math.floor(rnd() * 20 - 5) * 86400000).toISOString().slice(0, 10),
          status: STATUS[Math.floor(rnd() * STATUS.length)],
          notes: "Demo data",
          createdAt: created,
        });
      }
    }
  }
  if (rows.length) await db.insert(records).values(rows);
  return NextResponse.json({ ok: true, inserted: rows.length });
}
