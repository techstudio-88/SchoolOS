import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db, featureSettings, platformNotices, records } from "@/db";

export async function overviewData(schoolId: number, moduleIds: string[]) {
  const base = and(eq(records.schoolId, schoolId), inArray(records.moduleId, moduleIds));
  const since = new Date(Date.now() - 13 * 86400000);
  since.setHours(0, 0, 0, 0);
  const day = sql<string>`to_char(${records.createdAt}, 'YYYY-MM-DD')`;

  const [byStatus, byModule, byDay, recent, notices, totalAmount] = await Promise.all([
    db.select({ status: records.status, n: sql<number>`count(*)::int` }).from(records).where(base).groupBy(records.status),
    db.select({ moduleId: records.moduleId, n: sql<number>`count(*)::int` }).from(records).where(base).groupBy(records.moduleId),
    db
      .select({ day, n: sql<number>`count(*)::int` })
      .from(records)
      .where(and(base, gte(records.createdAt, since)))
      .groupBy(day),
    db.select().from(records).where(base).orderBy(desc(records.id)).limit(8),
    db.select().from(platformNotices).orderBy(desc(platformNotices.id)).limit(3),
    db.select({ sum: sql<number>`coalesce(sum(${records.amount}),0)::bigint` }).from(records).where(base),
  ]);

  const dayMap = new Map(byDay.map((d) => [d.day, d.n]));
  const series = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since.getTime() + i * 86400000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { label: d.toLocaleDateString("en", { day: "numeric", month: "short" }), value: dayMap.get(key) ?? 0 };
  });

  return {
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s.n])) as Record<string, number>,
    byModule: Object.fromEntries(byModule.map((s) => [s.moduleId, s.n])) as Record<string, number>,
    series,
    recent: recent.map((r) => ({
      id: r.id,
      title: r.title,
      person: r.person,
      status: r.status,
      moduleId: r.moduleId,
      featureKey: r.featureKey,
      createdAt: r.createdAt.toISOString(),
    })),
    notices: notices.map((n) => ({ id: n.id, title: n.title, body: n.body })),
    totalAmount: Number(totalAmount[0]?.sum ?? 0),
  };
}

export async function moduleData(schoolId: number, moduleId: string) {
  const [counts, settings] = await Promise.all([
    db
      .select({ key: records.featureKey, n: sql<number>`count(*)::int` })
      .from(records)
      .where(and(eq(records.schoolId, schoolId), eq(records.moduleId, moduleId)))
      .groupBy(records.featureKey),
    db.select().from(featureSettings).where(eq(featureSettings.schoolId, schoolId)),
  ]);
  return {
    counts: Object.fromEntries(counts.map((c) => [c.key, c.n])) as Record<string, number>,
    disabled: settings.filter((s) => !s.enabled).map((s) => s.featureKey),
  };
}

export async function sidebarCounts(schoolId: number, moduleIds: string[]) {
  const rows = await db
    .select({ moduleId: records.moduleId, n: sql<number>`count(*)::int` })
    .from(records)
    .where(and(eq(records.schoolId, schoolId), inArray(records.moduleId, moduleIds)))
    .groupBy(records.moduleId);
  return Object.fromEntries(rows.map((r) => [r.moduleId, r.n])) as Record<string, number>;
}
