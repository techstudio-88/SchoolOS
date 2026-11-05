import { notFound } from "next/navigation";
import { MODULE_MAP, PANEL_MAP } from "@/lib/catalog";
import { getSession } from "@/lib/session";
import { moduleData } from "@/lib/queries";
import { ModuleView } from "@/components/app/ModuleView";

export const dynamic = "force-dynamic";

export default async function ModulePage({ params }: { params: Promise<{ role: string; module: string }> }) {
  const { role, module: moduleId } = await params;
  const panel = PANEL_MAP[role];
  const mod = MODULE_MAP[moduleId];
  const session = await getSession();
  if (!panel || !mod || !session || !panel.modules.includes(moduleId)) notFound();
  const data = await moduleData(session.schoolId, moduleId);
  return (
    <ModuleView
      module={{ id: mod.id, title: mod.title, icon: mod.icon, color: mod.color, blurb: mod.blurb, features: mod.features.map((f) => ({ key: f.key, name: f.name, description: f.description })) }}
      counts={data.counts}
      disabled={data.disabled}
    />
  );
}
