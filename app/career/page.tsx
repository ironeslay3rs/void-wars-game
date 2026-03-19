import type { Metadata } from "next";
import CareerScreen from "@/components/career/CareerScreen";

export const metadata: Metadata = {
  title: "Career | Void Wars: Oblivion",
  description: "Career paths, role identity, and specialization planning.",
};

export default function CareerPage() {
  return <CareerScreen />;
}