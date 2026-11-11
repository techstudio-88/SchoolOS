import { redirect } from "next/navigation";
import { AutomationsCenter } from "@/components/app/AutomationsCenter";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AutomationsPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== role) redirect(`/app/${session.role}`);
  if (role !== "owner") redirect(`/app/${role}`);
  return <AutomationsCenter />;
}
