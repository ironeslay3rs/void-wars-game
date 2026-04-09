"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useGame } from "@/features/game/gameContext";
import { getResourceIcon } from "@/features/game/resourceIconMap";
import type { ResourceKey } from "@/features/game/gameTypes";
import { formatResourceLabel } from "@/features/game/gameFeedback";
import QuickDiscardResourceButtons from "@/components/inventory/QuickDiscardResourceButtons";
import {
  checkCapacity,
  getOverflowPenalty,
  INVENTORY_CAPACITY_MAX,
} from "@/features/resources/inventoryLogic";
import { CARGO_INFUSION_HEADING } from "@/features/status/voidInfusionMetaphor";
import RunInstabilityBar from "@/components/shared/RunInstabilityBar";
import ResourceTooltip from "@/components/shared/ResourceTooltip";
import { getActivePrepSurface } from "@/features/crafting/prepRunHooks";
import {
  evaluateExpeditionReadiness,
  formatExpeditionReadinessBand,
} from "@/features/expedition/expeditionReadiness";
import { voidZones } from "@/features/void-maps/zoneData";

// Canonical currency order: Sinful Coin, Ichor, Soul Crystals, then game-specific
const PRIMARY_KEYS: ResourceKey[] = ["credits", "bioSamples", "runeDust"];
const SECONDARY_KEYS: ResourceKey[] = ["ironOre", "scrapAlloy", "emberCore", "mossRations"];

const PRIMARY = PRIMARY_KEYS.map((key) => ({ key, label: formatResourceLabel(key) }));
const SECONDARY = SECONDARY_KEYS.map((key) => ({ key, label: formatResourceLabel(key) }));

function ResourceChip({ label, value, resourceKey }: { label: string; value: number; resourceKey: ResourceKey }) {
  return (
    <div className="flex min-w-[80px] shrink-0 items-center gap-2 px-3 py-2">
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
        <div className="truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40 sm:text-[10px]">
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
  const prep = getActivePrepSurface(state.player);
  const previewZoneId = useMemo(() => {
    const z = voidZones.find((vz) => state.player.rankLevel >= vz.threatLevel);
    return z?.id ?? voidZones[0].id;
  }, [state.player.rankLevel]);
  const expeditionPreview = useMemo(
    () => evaluateExpeditionReadiness(state.player, previewZoneId),
    [state.player, previewZoneId],
  );
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
    <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(90deg,rgba(8,12,20,0.96),rgba(12,16,26,0.94))] shadow-[0_8px_28px_rgba(0,0,0,0.4)] backdrop-blur-md">
      <div className="flex min-w-0 items-stretch">
        <div className="flex items-center px-2 py-2 text-[8px] font-bold uppercase tracking-[0.22em] text-white/25 [writing-mode:vertical-rl] sm:px-3 sm:text-[9px] sm:tracking-[0.28em] sm:text-white/30">
          Resources
        </div>

        <div className="h-px w-px shrink-0 self-stretch bg-white/8" />

        <div className="flex min-w-0 flex-1 divide-x divide-white/8 overflow-x-auto">
          {PRIMARY.map((res) => (
            <ResourceTooltip key={res.key} resourceKey={res.key}>
              <ResourceChip label={res.label} value={r[res.key]} resourceKey={res.key} />
            </ResourceTooltip>
          ))}
          <div className="flex divide-x divide-white/8 sm:hidden">
            {SECONDARY.map((res) => (
              <ResourceTooltip key={res.key} resourceKey={res.key}>
                <ResourceChip label={res.label} value={r[res.key]} resourceKey={res.key} />
              </ResourceTooltip>
            ))}
          </div>
        </div>

        <div className="hidden divide-x divide-white/8 sm:flex">
          {SECONDARY.map((res) => (
            <ResourceTooltip key={res.key} resourceKey={res.key}>
              <ResourceChip label={res.label} value={r[res.key]} resourceKey={res.key} />
            </ResourceTooltip>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 px-3 py-2 sm:px-4">
        <div className="flex items-center justify-between gap-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/45 sm:text-[10px]">
          <span>
            Carry load
            {capacity.isOverloaded ? (
              <span className="ml-1 text-red-200/90">· {CARGO_INFUSION_HEADING}</span>
            ) : null}
          </span>
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

      <div
        className={[
          "border-t px-3 py-2 sm:px-4",
          prep.state === "primed"
            ? "border-cyan-400/25 bg-cyan-950/20"
            : "border-white/10 bg-black/20",
        ].join(" ")}
      >
        <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">
          Next run prep
        </div>
        <p
          className={[
            "mt-0.5 text-[10px] font-semibold leading-snug sm:text-[11px]",
            prep.state === "primed" ? "text-cyan-100/95" : "text-white/55",
          ].join(" ")}
        >
          {prep.headline}
        </p>
        <p className="mt-0.5 text-[9px] leading-snug text-white/48 sm:text-[10px]">
          {prep.detail}{" "}
          <Link
            href="/bazaar/crafting-district"
            className="font-semibold text-cyan-200/85 underline decoration-cyan-400/35 underline-offset-2 hover:text-cyan-50"
          >
            Crafting District
          </Link>
        </p>
      </div>

      <div className="border-t border-white/10 px-3 py-2 sm:px-4">
        <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">
          Expedition readiness
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-bold tabular-nums text-white/80">
            {expeditionPreview.readinessScore}/100 ·{" "}
            {formatExpeditionReadinessBand(expeditionPreview.readinessBand)}
          </span>
          <Link
            href="/deploy-into-void"
            className="text-[9px] font-bold uppercase tracking-[0.14em] text-cyan-200/90 underline decoration-cyan-400/40 underline-offset-2 hover:text-cyan-50"
          >
            Deploy map →
          </Link>
        </div>
        {expeditionPreview.primaryWarning ? (
          <p className="mt-1 text-[9px] leading-snug text-amber-200/80">
            {expeditionPreview.primaryWarning}
          </p>
        ) : (
          <p className="mt-1 text-[9px] leading-snug text-white/45">
            {expeditionPreview.readinessBand === "ready"
              ? "Full readiness — first void closeout trims a sliver of wear."
              : "Review strip on the deploy map before you commit a run."}
          </p>
        )}
      </div>

      <div className="border-t border-white/10 px-3 py-2 sm:px-4">
        <RunInstabilityBar />
      </div>
    </div>
  );
}
