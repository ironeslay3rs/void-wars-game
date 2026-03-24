import type { Metadata } from "next";
import FactionsScreen from "@/components/factions/FactionsScreen";

export const metadata: Metadata = {
  title: "Affiliations | Void Wars: Oblivion",
  description: "Doctrine powers, ideological blocs, and affiliation standing systems.",
};

export default function FactionsPage() {
  return <FactionsScreen />;
}
