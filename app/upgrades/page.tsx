import type { Metadata } from "next";
import UpgradeHub from "@/components/upgrades/UpgradeHub";

export const metadata: Metadata = { title: "Upgrade Hub — Void Wars: Oblivion" };

export default function UpgradesPage() {
  return <UpgradeHub />;
}
