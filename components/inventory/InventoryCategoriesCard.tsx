"use client";

import { useGame } from "@/features/game/gameContext";

export default function InventoryCategoriesCard() {
  const { state } = useGame();
  const { player } = state;

  const inventoryCategories = [
    {
      title: "Currency & rations",
      subtitle: "Spendable balance and hunger relief",
      entries: [
        { label: "Credits", value: player.resources.credits },
        { label: "Moss Rations", value: player.resources.mossRations },
      ],
    },
    {
      title: "Salvage & biomass",
      subtitle: "Field extraction stock",
      entries: [
        { label: "Iron Ore", value: player.resources.ironOre },
        { label: "Scrap Alloy", value: player.resources.scrapAlloy },
        { label: "Bio Samples", value: player.resources.bioSamples },
      ],
    },
    {
      title: "Refined components",
      subtitle: "Higher-grade crafting stock",
      entries: [
        { label: "Rune Dust", value: player.resources.runeDust },
        { label: "Ember Core", value: player.resources.emberCore },
      ],
    },
    {
      title: "Boss relics",
      subtitle: "Rare void boss extracts (phase 2 crafting)",
      entries: [
        { label: "Coilbound Lattice", value: player.resources.coilboundLattice },
        { label: "Ash Synod Relic", value: player.resources.ashSynodRelic },
        { label: "Vault Lattice Shard", value: player.resources.vaultLatticeShard },
        { label: "Ironheart", value: player.resources.ironHeart },
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

          <div className="mt-4 flex flex-col gap-2">
            {category.entries.map((entry) => {
              const hasStock = entry.value > 0;

              return (
                <div
                  key={entry.label}
                  className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-white/14 bg-black/30 px-4 py-3"
                >
                  <span className="text-sm font-medium uppercase tracking-[0.06em] text-white/80">
                    {entry.label}
                  </span>
                  <span
                    className={[
                      "font-black tabular-nums",
                      hasStock ? "text-white" : "text-white/40",
                    ].join(" ")}
                  >
                    {entry.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="rounded-[22px] border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-center text-xs uppercase tracking-[0.12em] text-white/45">
        Equipment and gear rows are reserved for a later build—this screen only
        tracks resources in player stock.
      </div>
    </div>
  );
}
