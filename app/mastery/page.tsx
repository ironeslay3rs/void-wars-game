import type { Metadata } from "next";
import MasteryScreen from "@/components/mastery/MasteryScreen";

export const metadata: Metadata = {
  title: "Mastery | Void Wars: Oblivion",
  description: "Mastery trees, milestones, and long-term growth systems.",
};

export default function MasteryPage() {
  return <MasteryScreen />;
}