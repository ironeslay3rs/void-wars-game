"use client";

import InventoryCategoriesCard from "@/components/inventory/InventoryCategoriesCard";
import InventoryEquipmentReserveCard from "@/components/inventory/InventoryEquipmentReserveCard";
import InventoryLoadoutCard from "@/components/inventory/InventoryLoadoutCard";
import InventoryOperationsCard from "@/components/inventory/InventoryOperationsCard";
import InventoryOverviewCard from "@/components/inventory/InventoryOverviewCard";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { useGame } from "@/features/game/gameContext";
import { inventoryScreenData } from "@/features/inventory/inventoryScreenData";

function formatFactionLabel(faction: string) {
  if (faction === "unbound") return "Unbound";
  if (faction === "bio") return "Bio";
  if (faction === "mecha") return "Mecha";
  if (faction === "pure") return "Pure";
  return faction;
}

export default function InventoryScreen() {
  const { state } = useGame();
  const { player } = state;

  const totalStoredItems =
    player.resources.ironOre +
    player.resources.scrapAlloy +
    player.resources.runeDust +
    player.resources.emberCore +
    player.resources.bioSamples;

  const capacityUsed = totalStoredItems;
  const capacityMax = 120;

  const liveCards = [
    {
      label: "Affiliation",
      value: formatFactionLabel(player.factionAlignment),
      hint: "Inventory visuals and future sorting rules can react to active path alignment.",
    },
    {
      label: "Used Capacity",
      value: `${capacityUsed}/${capacityMax}`,
      hint: "Material storage load—salvage, biomass, and refined stock only (not credits or rations).",
    },
    {
      label: "Credits",
      value: String(player.resources.credits),
      hint: "Shared global state balance available for market and inventory use.",
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(60,90,100,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow={inventoryScreenData.eyebrow}
          title={inventoryScreenData.title}
          subtitle={inventoryScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {liveCards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Storage Overview"
            description="Slot list and grouped counts from live player resources—what you own right now."
          >
            <div className="space-y-5">
              <InventoryOverviewCard />
              <InventoryCategoriesCard />
            </div>
          </SectionCard>

          <div className="grid gap-6">
            <SectionCard
              title="Storage Operations"
              description="Side systems for sorting, quick access, and future expansion layers."
            >
              <InventoryOperationsCard />
            </SectionCard>

            <SectionCard
              title="Equipment Reserve"
              description="Affiliation-specific starter gear, utility items, and open reserve slots for future loot drops."
            >
              <div className="space-y-5">
                <InventoryLoadoutCard />
                <InventoryEquipmentReserveCard />
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}
