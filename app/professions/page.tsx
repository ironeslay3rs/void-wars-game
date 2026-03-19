import type { Metadata } from "next";
import ProfessionsScreen from "@/components/professions/ProfessionsScreen";

export const metadata: Metadata = {
  title: "Professions | Void Wars: Oblivion",
  description: "Profession roles, progression paths, and work specialization systems.",
};

export default function ProfessionsPage() {
  return <ProfessionsScreen />;
}