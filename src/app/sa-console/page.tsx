import type { Metadata } from "next";
import { desc, sql } from "drizzle-orm";
import { auditLog, db, platformNotices, records, schools } from "@/db";
import { isSuperAdmin } from "@/lib/session";
import { TOTAL_FEATURES, MODULES, PANELS } from "@/lib/catalog";
import { AdminConsole, AdminGate } from "./AdminConsole";

export const dynamic = "force-dynamic";

// Never indexed, never linked from anywhere in the product.
export const metadata: Metadata = {
  title: "Console",
  robots: { index: false, follow: false, nocache: true },
};

export default async function SuperAdminPage() {
  if (!(await isSuperAdmin())) {
    return <AdminGate configured={Boolean(process.env.SUPER_ADMIN_KEY)} />;
  }
  const [allSchools, counts, notices, audit, totalRecords] = await Promise.all([
    db.select().from(schools).orderBy(desc(schools.id)),
    db.select({ schoolId: records.schoolId, n: sql<number>`count(*)::int` }).from(records).groupBy(records.schoolId),
    db.select().from(platformNotices).orderBy(desc(platformNotices.id)).limit(20),
    db.select().from(auditLog).orderBy(desc(auditLog.id)).limit(40),
    db.select({ n: sql<number>`count(*)::int` }).from(records),
  ]);
  const countMap = new Map(counts.map((c) => [c.schoolId, c.n]));
  return (
    <AdminConsole
      schools={allSchools.map((s) => ({
        id: s.id,
        name: s.name,
        ownerName: s.ownerName,
        ownerEmail: s.ownerEmail,
        city: s.city,
        plan: s.plan,
        status: s.status,
        students: s.studentsCount,
        isDemo: s.isDemo,
        records: countMap.get(s.id) ?? 0,
        createdAt: s.createdAt.toISOString(),
      }))}
      notices={notices.map((n) => ({ id: n.id, title: n.title, body: n.body, createdAt: n.createdAt.toISOString() }))}
      audit={audit.map((a) => ({ id: a.id, action: a.action, detail: a.detail, createdAt: a.createdAt.toISOString() }))}
      totals={{ records: totalRecords[0]?.n ?? 0, features: TOTAL_FEATURES, modules: MODULES.length, panels: PANELS.length }}
    />
  );
}
