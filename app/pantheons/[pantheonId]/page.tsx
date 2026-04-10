import { notFound } from "next/navigation";

import PantheonHqScreen from "@/components/pantheons/PantheonHqScreen";
import {
  PANTHEONS,
  PANTHEON_ORDER,
} from "@/features/pantheons/pantheonData";
import type { PantheonId } from "@/features/pantheons/pantheonTypes";

export function generateStaticParams() {
  return PANTHEON_ORDER.map((pantheonId) => ({ pantheonId }));
}

type PageProps = {
  params: Promise<{ pantheonId: string }>;
};

const VALID_PANTHEON_IDS: readonly string[] = PANTHEON_ORDER;

function isPantheonId(id: string): id is PantheonId {
  return VALID_PANTHEON_IDS.includes(id);
}

export default async function PantheonHqPage({ params }: PageProps) {
  const { pantheonId } = await params;
  if (!isPantheonId(pantheonId)) {
    notFound();
  }
  const pantheon = PANTHEONS[pantheonId];
  return <PantheonHqScreen pantheon={pantheon} />;
}
