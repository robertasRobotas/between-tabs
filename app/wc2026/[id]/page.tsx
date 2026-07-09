import { notFound } from "next/navigation";
import { getPool, toPublicPool } from "@/lib/store";
import GroupView from "@/components/GroupView";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pool = await getPool(id);
  if (!pool) notFound();
  return <GroupView initialPool={toPublicPool(pool)} />;
}
