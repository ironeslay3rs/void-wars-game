"use client";

import Link from "next/link";
import { useGame } from "@/features/game/gameContext";
import {
  getFactionStarterLoadout,
  getUtilityItems,
} from "@/features/inventory/inventoryLoadoutData";
import { describeLoadoutItemCombatProfile } from "@/features/combat/loadoutCombatStats";
import { itemRankLabel } from "@/features/inventory/itemRanks";

function getRarityClass(rarity: string) {
  if (rarity === "Rare") {
    return "border-cyan-400/30 bg-cyan-400/10 text-cyan-100";
  }

  if (rarity === "Uncommon") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
  }

  return "border-white/10 bg-white/5 text-white/80";
}

export default function InventoryLoadoutCard() {
  const { state } = useGame();
  const starterLoadout = getFactionStarterLoadout(state.player.factionAlignment);
  const utilityItems = getUtilityItems();

  return (
    <div className="grid gap-5">
      <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,18,26,0.92),rgba(8,10,16,0.96))] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
              Active Combat Kit
            </div>
            <div className="mt-2 text-lg font-black uppercase tracking-[0.05em] text-white">
              Starter Loadout
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Link
              href="/loadout"
              className="rounded-full border border-cyan-400/35 bg-cyan-500/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-300/50"
            >
              Field rig →
            </Link>
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
              Equipped
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {starterLoadout.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black uppercase tracking-[0.05em] text-white">
                    {item.name}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
                    {item.type} / {item.slot} / {itemRankLabel(item.rankTier)}
                  </div>
                </div>

                <div
                  className={[
                    "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                    getRarityClass(item.rarity),
                  ].join(" ")}
                >
                  {item.rarity}
                </div>
              </div>

              <div className="mt-3 text-sm leading-6 text-white/65">
                {item.description}
              </div>
              {describeLoadoutItemCombatProfile(item.id) ? (
                <div className="mt-1 text-[11px] text-cyan-100/80">
                  {describeLoadoutItemCombatProfile(item.id)}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,18,26,0.92),rgba(8,10,16,0.96))] p-5">
        <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
          Mission Support
        </div>
        <div className="mt-2 text-lg font-black uppercase tracking-[0.05em] text-white">
          Utility Items
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {utilityItems.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black uppercase tracking-[0.05em] text-white">
                    {item.name}
                  </div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
                    {item.type} / {item.slot}
                  </div>
                </div>

                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">
                  x{item.quantity}
                </div>
              </div>

              <div className="mt-3 text-sm leading-6 text-white/65">
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
