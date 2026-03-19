import type { Metadata } from "next";
import FactionsScreen from "@/components/factions/FactionsScreen";

export const metadata: Metadata = {
  title: "Factions | Void Wars: Oblivion",
  description: "Faction powers, ideological blocs, and standing systems.",
};

export default function FactionsPage() {
  return <FactionsScreen />;
}