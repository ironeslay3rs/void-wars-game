import { notFound } from "next/navigation";

import EmpireDetailScreen from "@/components/empires/EmpireDetailScreen";
import { EMPIRE_ORDER } from "@/features/empires/empireData";
import { getEmpireById } from "@/features/empires/empireSelectors";
import type { EmpireId } from "@/features/empires/empireTypes";

export function generateStaticParams() {
  return EMPIRE_ORDER.map((empireId) => ({ empireId }));
}

type PageProps = {
  params: Promise<{ empireId: string }>;
};

const VALID_EMPIRE_IDS: readonly string[] = EMPIRE_ORDER;

function isEmpireId(id: string): id is EmpireId {
  return VALID_EMPIRE_IDS.includes(id);
}

export default async function EmpireDetailPage({ params }: PageProps) {
  const { empireId } = await params;
  if (!isEmpireId(empireId)) {
    notFound();
  }
  const empire = getEmpireById(empireId);
  return <EmpireDetailScreen empire={empire} />;
}
