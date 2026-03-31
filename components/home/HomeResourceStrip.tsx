"use client";

import Image from "next/image";
import Link from "next/link";
import { useGame } from "@/features/game/gameContext";
import { getResourceIcon } from "@/features/game/resourceIconMap";
import type { ResourceKey } from "@/features/game/gameTypes";
import QuickDiscardResourceButtons from "@/components/inventory/QuickDiscardResourceButtons";
import {
  checkCapacity,
  getOverflowPenalty,
  INVENTORY_CAPACITY_MAX,
} from "@/features/resources/inventoryLogic";

const PRIMARY: Array<{ key: ResourceKey; label: string }> = [
  { key: "credits", label: "Credits" },
  { key: "runeDust", label: "Void Crystals" },
  { key: "bioSamples", label: "Bio Essence" },
];

const SECONDARY: Array<{ key: ResourceKey; label: string }> = [
  { key: "ironOre", label: "Iron Ore" },
  { key: "scrapAlloy", label: "Scrap Alloy" },
  { key: "emberCore", label: "Ember Core" },
  { key: "mossRations", label: "Rations" },
];

function ResourceChip({ label, value, resourceKey }: { label: string; value: number; resourceKey: ResourceKey }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-black/30 p-0.5">
        <Image
          src={getResourceIcon(resourceKey)}
          alt={label}
          width={18}
          height={18}
          className="h-[18px] w-[18px] object-contain"
        />
      </div>
      <div className="min-w-0">
        <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40 sm:text-[10px]">
          {label}
        </div>
        <div className="text-xs font-black tabular-nums text-white sm:text-sm">
          {value.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default function HomeResourceStrip() {
  const { state } = useGame();
  const r = state.player.resources;
  const capacity = checkCapacity(r, INVENTORY_CAPACITY_MAX);
  const penalty = getOverflowPenalty(capacity);
  const pct = Math.max(0, Math.min(100, capacity.percent));
  const barClass = capacity.isOverloaded
    ? "bg-gradient-to-r from-red-500 to-orange-400"
    : pct >= 85
      ? "bg-gradient-to-r from-amber-400 to-amber-600"
      : "bg-gradient-to-r from-cyan-500/90 to-emerald-500/80";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(90deg,rgba(8,12,20,0.96),rgba(12,16,26,0.94))] shadow-[0_8px_28px_rgba(0,0,0,0.4)] backdrop-blur-md">
      <div className="flex items-stretch">
        <div className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.28em] text-white/30 [writing-mode:vertical-rl] flex items-center">
          Resources
        </div>

        <div className="h-px w-px self-stretch bg-white/8" />

        <div className="flex flex-1 divide-x divide-white/8">
          {PRIMARY.map((res) => (
            <ResourceChip key={res.key} label={res.label} value={r[res.key]} resourceKey={res.key} />
          ))}
        </div>

        <div className="hidden divide-x divide-white/8 sm:flex">
          {SECONDARY.map((res) => (
            <ResourceChip key={res.key} label={res.label} value={r[res.key]} resourceKey={res.key} />
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 px-3 py-2 sm:px-4">
        <div className="flex items-center justify-between gap-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/45 sm:text-[10px]">
          <span>Carry load</span>
          <span
            className={
              capacity.isOverloaded
                ? "text-red-300"
                : pct >= 85
                  ? "text-amber-200/90"
                  : "text-white/70"
            }
          >
            {capacity.used}/{capacity.max}
            {capacity.isOverloaded ? ` (+${capacity.overflow})` : ""}
          </span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className={["h-full rounded-full transition-[width] duration-300", barClass].join(" ")}
            style={{ width: `${pct}%` }}
          />
        </div>
        {capacity.isOverloaded ? (
          <div className="mt-2 space-y-2">
            <span className="block text-[10px] leading-snug text-red-200/85">{penalty.message}</span>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-red-50/95">
              <span className="rounded-md border border-red-200/35 bg-black/25 px-2 py-0.5">
                Missions ×{penalty.missionSpeedPenalty.toFixed(1)}
              </span>
              {penalty.missionRewardPenaltyPct > 0 ? (
                <span className="rounded-md border border-red-200/35 bg-black/25 px-2 py-0.5">
                  Rewards −{penalty.missionRewardPenaltyPct}%
                </span>
              ) : null}
              {penalty.movementPenaltyPct > 0 ? (
                <span className="rounded-md border border-red-200/35 bg-black/25 px-2 py-0.5">
                  Field move −{penalty.movementPenaltyPct}%
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/inventory"
                className="rounded-lg border border-red-300/40 bg-red-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-red-50 hover:border-red-200/60"
              >
                Inventory
              </Link>
              <Link
                href="/bazaar/war-exchange"
                className="rounded-lg border border-red-200/45 bg-black/30 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-red-50 hover:border-red-100/70"
              >
                Sell surplus
              </Link>
            </div>
            <QuickDiscardResourceButtons
              wrapClassName="mt-1 flex flex-wrap gap-1.5"
              buttonClassName="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/75 hover:border-white/30 hover:bg-white/10"
            />
          </div>
        ) : pct >= 85 ? (
          <div className="mt-2 flex flex-col gap-1.5 text-[10px] leading-snug text-amber-200/80 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <span>Carry near cap — sell, discard, or trim stacks before long hunts.</span>
            <Link
              href="/bazaar/war-exchange"
              className="shrink-0 font-bold uppercase tracking-widest text-amber-100 underline decoration-amber-400/50 underline-offset-2 hover:text-amber-50"
            >
              War Exchange →
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
