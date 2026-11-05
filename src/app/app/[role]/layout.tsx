import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { desc, eq } from "drizzle-orm";
import { db, platformNotices, schools } from "@/db";
import { AppShell } from "@/components/app/AppShell";
import { MODULE_MAP, PANEL_MAP } from "@/lib/catalog";
import { getSession } from "@/lib/session";
import { sidebarCounts } from "@/lib/queries";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RoleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  const panel = PANEL_MAP[role];
  if (!panel) notFound();
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== role) redirect(`/app/${session.role}`);

  const [school] = await db.select().from(schools).where(eq(schools.id, session.schoolId)).limit(1);
  if (!school) redirect("/login");

  if (school.status === "suspended") {
    return (
      <main className="grid min-h-screen place-items-center p-6 text-center">
        <div className="glass max-w-md rounded-3xl p-10">
          <div className="mb-4 text-5xl">⏸️</div>
          <h1 className="font-display text-2xl font-bold text-white">Account paused</h1>
          <p className="mt-3 text-slate-400">
            {school.name} has been paused by the platform team. Please contact support to reactivate it.
          </p>
          <Link href="/" className="btn-glow mt-6 inline-block rounded-xl px-6 py-3 text-sm">Back to website</Link>
        </div>
      </main>
    );
  }

  const [counts, notices] = await Promise.all([
    sidebarCounts(session.schoolId, panel.modules),
    db.select().from(platformNotices).orderBy(desc(platformNotices.id)).limit(5),
  ]);

  const modules = panel.modules
    .map((id) => MODULE_MAP[id])
    .filter(Boolean)
    .map((m) => ({ id: m.id, title: m.title, icon: m.icon, color: m.color, count: counts[m.id] ?? 0, features: m.features.length }));

  return (
    <AppShell
      panel={{ id: panel.id, title: panel.title, tagline: panel.tagline, icon: panel.icon, color: panel.color }}
      modules={modules}
      userName={session.name}
      schoolName={school.name}
      notices={notices.map((n) => ({ id: n.id, title: n.title, body: n.body }))}
    >
      {children}
    </AppShell>
  );
}
