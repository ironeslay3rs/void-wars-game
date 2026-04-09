"use client";

import { useGame } from "@/features/game/gameContext";

type InventoryEntry = {
  label: string;
  value: number;
  tier: "Common" | "Refined" | "Boss" | "Consumable" | "Currency";
  tooltip: string;
};

export default function InventoryCategoriesCard() {
  const { state } = useGame();
  const { player } = state;

  const inventoryCategories = [
    {
      title: "Currency & rations",
      subtitle: "Spendable balance and hunger relief",
      entries: [
        {
          label: "Credits",
          value: player.resources.credits,
          tier: "Currency",
          tooltip:
            "Universal payment. Spent on Black Market trades, services, and recovery.",
        },
        {
          label: "Moss Rations",
          value: player.resources.mossRations,
          tier: "Consumable",
          tooltip:
            "Emergency survival buffer. Restores hunger and condition on use.",
        },
      ] as InventoryEntry[],
    },
    {
      title: "Salvage & biomass",
      subtitle: "Field extraction stock",
      entries: [
        {
          label: "Iron Ore",
          value: player.resources.ironOre,
          tier: "Common",
          tooltip: "Raw salvage. Refine into usable alloy plating.",
        },
        {
          label: "Scrap Alloy",
          value: player.resources.scrapAlloy,
          tier: "Refined",
          tooltip: "Refined salvage. Used across early crafting and upgrades.",
        },
        {
          label: "Bio Samples",
          value: player.resources.bioSamples,
          tier: "Common",
          tooltip: "Recovered biomass. Used for survival buffers and Bio-facing crafts.",
        },
      ] as InventoryEntry[],
    },
    {
      title: "Refined components",
      subtitle: "Higher-grade crafting stock",
      entries: [
        {
          label: "Rune Dust",
          value: player.resources.runeDust,
          tier: "Refined",
          tooltip: "Binding material. Fuels upgrades, rations, and rune-linked crafts.",
        },
        {
          label: "Ember Core",
          value: player.resources.emberCore,
          tier: "Refined",
          tooltip: "Heat-stable core used for higher-grade crafting and sigils.",
        },
      ] as InventoryEntry[],
    },
    {
      title: "Boss relics",
      subtitle: "Rare void boss extracts (phase 2 crafting)",
      entries: [
        {
          label: "Coilbound Lattice",
          value: player.resources.coilboundLattice,
          tier: "Boss",
          tooltip:
            "Boss-grade extract — bank it for high-tier refinement and war-economy gates when those lanes open.",
        },
        {
          label: "Ash Synod Relic",
          value: player.resources.ashSynodRelic,
          tier: "Boss",
          tooltip: "Boss-grade relic. Used for phase-2 refinement and war economy gates.",
        },
        {
          label: "Vault Lattice Shard",
          value: player.resources.vaultLatticeShard,
          tier: "Boss",
          tooltip: "Pure-aligned shard. Refinable into higher-order materials.",
        },
        {
          label: "Ironheart",
          value: player.resources.ironHeart,
          tier: "Boss",
          tooltip: "Rare named material. High-end progression sink (later milestone).",
        },
      ] as InventoryEntry[],
    },
  ];

  function tierChipClass(tier: InventoryEntry["tier"]) {
    switch (tier) {
      case "Currency":
        return "border-amber-300/30 bg-amber-400/10 text-amber-100";
      case "Consumable":
        return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
      case "Boss":
        return "border-violet-300/30 bg-violet-400/10 text-violet-100";
      case "Refined":
        return "border-cyan-300/30 bg-cyan-400/10 text-cyan-100";
      default:
        return "border-white/15 bg-white/5 text-white/75";
    }
  }

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
                  title={entry.tooltip}
                  className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-white/14 bg-black/30 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-medium uppercase tracking-[0.06em] text-white/80">
                      {entry.label}
                    </span>
                    <span
                      className={[
                        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em]",
                        tierChipClass(entry.tier),
                      ].join(" ")}
                    >
                      {entry.tier}
                    </span>
                  </div>
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
