import type { Metadata } from "next";
import ArenaScreen from "@/components/arena/ArenaScreen";

export const metadata: Metadata = {
  title: "Arena | Void Wars: Oblivion",
  description: "Structured combat modes, queue readiness, and arena progression systems.",
};

export default function ArenaPage() {
  return <ArenaScreen />;
}
