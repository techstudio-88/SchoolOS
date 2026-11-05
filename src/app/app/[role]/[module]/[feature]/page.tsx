import { notFound } from "next/navigation";
import { MODULE_MAP, PANEL_MAP } from "@/lib/catalog";
import { getSession } from "@/lib/session";
import { FeatureDrawer } from "@/components/app/FeatureDrawer";

export const dynamic = "force-dynamic";

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ role: string; module: string; feature: string }>;
}) {
  const { role, module: moduleId, feature: featureParam } = await params;
  const panel = PANEL_MAP[role];
  const mod = MODULE_MAP[moduleId];
  const featureKey = decodeURIComponent(featureParam);
  const feature = mod?.features.find((item) => item.key === featureKey);
  const session = await getSession();

  if (!panel || !mod || !feature || !session || !panel.modules.includes(moduleId)) notFound();

  return (
    <FeatureDrawer
      feature={feature}
      moduleTitle={mod.title}
      moduleId={mod.id}
      color={mod.color}
      icon={mod.icon}
      fullPage
    />
  );
}
