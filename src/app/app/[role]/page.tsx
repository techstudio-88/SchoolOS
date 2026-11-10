import { notFound } from "next/navigation";
import { MODULE_MAP, PANEL_MAP, panelFeatureCount } from "@/lib/catalog";
import { getSession } from "@/lib/session";
import { overviewData } from "@/lib/queries";
import { Overview } from "@/components/app/Overview";

export const dynamic = "force-dynamic";

export default async function RoleOverview({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const panel = PANEL_MAP[role];
  const session = await getSession();
  if (!panel || !session || session.role !== role) notFound();
  const data = await overviewData(session.schoolId, panel.modules);
  const mods = panel.modules.map((id) => MODULE_MAP[id]).filter(Boolean);
  return (
    <Overview
      panel={{ id: panel.id, title: panel.title, tagline: panel.tagline, color: panel.color, icon: panel.icon }}
      userName={session.name}
      featureCount={panelFeatureCount(panel)}
      modules={mods.map((m) => ({ id: m.id, title: m.title, icon: m.icon, color: m.color, blurb: m.blurb, features: m.features.length, count: data.byModule[m.id] ?? 0 }))}
      data={data}
    />
  );
}
