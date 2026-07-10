import { notFound } from "next/navigation";
import { getPool, toPublicPool } from "@/lib/store";
import { getGlobalActual } from "@/lib/globalResults";
import GroupView from "@/components/GroupView";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [pool, globalActual] = await Promise.all([
    getPool(id),
    getGlobalActual(),
  ]);
  if (!pool) notFound();
  return (
    <GroupView initialPool={toPublicPool(pool)} globalActual={globalActual} />
  );
}
