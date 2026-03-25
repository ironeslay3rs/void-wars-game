"use client";

import { formatResourceLabel } from "@/features/game/gameFeedback";
import type { ResourceKey } from "@/features/game/gameTypes";
import { useGame } from "@/features/game/gameContext";

const RESOURCE_SLOT_ORDER: ResourceKey[] = [
  "credits",
  "ironOre",
  "scrapAlloy",
  "runeDust",
  "emberCore",
  "bioSamples",
  "mossRations",
];

function formatFactionLabel(faction: string) {
  if (faction === "unbound") return "Unbound";
  if (faction === "bio") return "Bio";
  if (faction === "mecha") return "Mecha";
  if (faction === "pure") return "Pure";
  return faction;
}

function getFactionAccent(faction: string) {
  if (faction === "bio") {
    return {
      chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
      glow: "shadow-[0_0_35px_rgba(16,185,129,0.14)]",
      ring: "border-emerald-500/20",
    };
  }

  if (faction === "mecha") {
    return {
      chip: "border-cyan-500/30 bg-cyan-500/10 text-cyan-100",
      glow: "shadow-[0_0_35px_rgba(34,211,238,0.14)]",
      ring: "border-cyan-500/20",
    };
  }

  if (faction === "pure") {
    return {
      chip: "border-violet-500/30 bg-violet-500/10 text-violet-100",
      glow: "shadow-[0_0_35px_rgba(168,85,247,0.14)]",
      ring: "border-violet-500/20",
    };
  }

  return {
    chip: "border-white/15 bg-white/5 text-white/90",
    glow: "shadow-[0_0_28px_rgba(255,255,255,0.05)]",
    ring: "border-white/15",
  };
}

export default function InventoryOverviewCard() {
  const { state } = useGame();
  const { player } = state;

  const factionAccent = getFactionAccent(player.factionAlignment);

  const totalStoredItems =
    player.resources.ironOre +
    player.resources.scrapAlloy +
    player.resources.runeDust +
    player.resources.emberCore +
    player.resources.bioSamples;

  const capacityUsed = totalStoredItems;
  const capacityMax = 120;
  const capacityPercent = Math.max(
    0,
    Math.min(100, (capacityUsed / capacityMax) * 100),
  );

  return (
    <div
      className={[
        "rounded-[24px] border bg-[linear-gradient(180deg,rgba(18,18,28,0.92),rgba(8,10,16,0.96))] p-5",
        factionAccent.ring,
        factionAccent.glow,
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
            Active Storage Profile
          </div>
          <div className="mt-3 text-2xl font-black uppercase tracking-[0.05em] text-white">
            Your holdings
          </div>
          <div className="mt-2 text-sm text-white/65">
            Counts read directly from current survival stock—every row is a tracked
            resource slot.
          </div>
        </div>

        <div
          className={[
            "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
            factionAccent.chip,
          ].join(" ")}
        >
          {formatFactionLabel(player.factionAlignment)}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
            Capacity Load
          </div>
          <div className="text-sm font-bold text-white/85">
            {capacityUsed} / {capacityMax}
          </div>
        </div>

        <div className="mt-3 h-4 overflow-hidden rounded-full border border-white/10 bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-emerald-300"
            style={{ width: `${capacityPercent}%` }}
          />
        </div>

        <div className="mt-3 text-sm text-white/60">
          Capacity sums salvage, biomass, and refined materials only. Credits and moss
          rations are listed below but do not add to this bar.
        </div>
      </div>

      <div className="mt-7 border-t border-white/10 pt-6">
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
          Resource slots
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {RESOURCE_SLOT_ORDER.map((key) => {
            const amount = player.resources[key];
            const hasStock = amount > 0;

            return (
              <div
                key={key}
                className="flex min-h-[48px] items-center justify-between gap-4 rounded-xl border border-white/12 bg-black/35 px-4 py-3"
              >
                <span className="text-sm font-semibold uppercase tracking-[0.08em] text-white/85">
                  {formatResourceLabel(key)}
                </span>
                <span
                  className={[
                    "tabular-nums text-lg font-black tracking-tight",
                    hasStock ? "text-white" : "text-white/40",
                  ].join(" ")}
                >
                  {amount}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
