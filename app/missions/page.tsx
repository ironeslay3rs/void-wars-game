import type { Metadata } from "next";
import MissionsScreen from "@/components/missions/MissionsScreen";

export const metadata: Metadata = {
  title: "Missions | Void Wars: Oblivion",
  description: "Mission types, objectives, and progression operations.",
};

export default function MissionsPage() {
  return <MissionsScreen />;
}