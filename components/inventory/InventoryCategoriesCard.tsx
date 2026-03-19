"use client";

import { useGame } from "@/features/game/gameContext";

export default function InventoryCategoriesCard() {
  const { state } = useGame();
  const { player } = state;

  const inventoryCategories = [
    {
      title: "Raw Materials",
      subtitle: "Core extraction resources",
      entries: [
        { label: "Iron Ore", value: player.resources.ironOre },
        { label: "Scrap Alloy", value: player.resources.scrapAlloy },
        { label: "Bio Samples", value: player.resources.bioSamples },
      ],
    },
    {
      title: "Refined Components",
      subtitle: "Higher-grade crafting stock",
      entries: [
        { label: "Rune Dust", value: player.resources.runeDust },
        { label: "Ember Core", value: player.resources.emberCore },
      ],
    },
    {
      title: "Combat Storage",
      subtitle: "Reserved for future gear items",
      entries: [
        { label: "Weapons", value: 0 },
        { label: "Armor Pieces", value: 0 },
        { label: "Rune Sets", value: 0 },
      ],
    },
  ];

  return (
    <div className="grid gap-4">
      {inventoryCategories.map((category) => (
        <div
          key={category.title}
          className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,18,26,0.92),rgba(8,10,16,0.96))] p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                {category.subtitle}
              </div>
              <div className="mt-2 text-lg font-black uppercase tracking-[0.05em] text-white">
                {category.title}
              </div>
            </div>

            <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
              Category
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {category.entries.map((entry) => (
              <div
                key={entry.label}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <span className="text-sm uppercase tracking-[0.06em] text-white/70">
                  {entry.label}
                </span>
                <span className="text-base font-black text-white">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}