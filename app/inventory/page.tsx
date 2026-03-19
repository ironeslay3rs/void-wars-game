import type { Metadata } from "next";
import InventoryScreen from "@/components/inventory/InventoryScreen";

export const metadata: Metadata = {
  title: "Inventory | Void Wars: Oblivion",
  description: "Inventory categories, capacity systems, and storage management.",
};

export default function InventoryPage() {
  return <InventoryScreen />;
}