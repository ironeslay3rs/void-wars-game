import { notFound } from "next/navigation";

import SchoolHqScreen from "@/components/schools/SchoolHqScreen";
import { SCHOOL_ORDER, SCHOOLS } from "@/features/schools/schoolData";
import type { SchoolId } from "@/features/schools/schoolTypes";

export function generateStaticParams() {
  return SCHOOL_ORDER.map((schoolId) => ({ schoolId }));
}

type PageProps = {
  params: Promise<{ schoolId: string }>;
};

const VALID_SCHOOL_IDS: readonly string[] = SCHOOL_ORDER;

function isSchoolId(id: string): id is SchoolId {
  return VALID_SCHOOL_IDS.includes(id);
}

export default async function SchoolHqPage({ params }: PageProps) {
  const { schoolId } = await params;
  if (!isSchoolId(schoolId)) {
    notFound();
  }
  const school = SCHOOLS[schoolId];
  return <SchoolHqScreen school={school} />;
}
