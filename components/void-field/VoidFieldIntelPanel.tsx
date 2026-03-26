"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useGame } from "@/features/game/gameContext";
import {
  getContributionProfessionHint,
  getContributionRole,
} from "@/features/void-maps/realtime/contributionScoring";
import {
  hasStabilizationSigil,
  RUNE_CRAFTER_STABILIZATION_SIGIL_COST,
} from "@/features/status/statusRecovery";
import { MOSS_RATION_RECIPE_COST } from "@/features/status/survival";
import {
  DEFAULT_HOME_DEPLOY_ZONE_ID,
  voidZones,
  voidZoneById,
  type VoidZoneId,
} from "@/features/void-maps/zoneData";
import { VOID_EXPEDITION_PATH } from "@/features/void-maps/voidRoutes";
import { voidFieldClamp } from "@/features/void-maps/voidFieldUtils";

export default function VoidFieldIntelPanel({
  onClose,
  isHuntRunning,
}: {
  onClose: () => void;
  isHuntRunning: boolean;
}) {
  const { state } = useGame();
  const router = useRouter();
  const searchParams = useSearchParams();
  const zoneQuery = searchParams.get("zone");
  const initialZoneId: VoidZoneId =
    zoneQuery && Object.prototype.hasOwnProperty.call(voidZoneById, zoneQuery)
      ? (zoneQuery as VoidZoneId)
      : DEFAULT_HOME_DEPLOY_ZONE_ID;
  const allocatedZone = voidZoneById[initialZoneId];
  const zone = allocatedZone;

  const missionQueue = Array.isArray(state.player.missionQueue)
    ? state.player.missionQueue
    : [];
  const activeHuntProcess =
    state.player.activeProcess?.kind === "hunt"
      ? state.player.activeProcess
      : null;

  const stateLine = useMemo(() => {
    if (activeHuntProcess?.status === "running") {
      return "Hunt simulation active";
    }
    if (activeHuntProcess?.status === "complete") {
      return "Hunt payout resolving";
    }
    return "No active hunt in timer queue";
  }, [activeHuntProcess]);

  const spawnWavesLine =
    activeHuntProcess?.status === "running" ? "RUNNING" : "PAUSED";

  const playerCondition = state.player.condition;
  const isRecommended = playerCondition >= zone.recommendedCondition;
  const nextLockedZone = voidZones
    .filter((z) => state.player.rankLevel < z.threatLevel)
    .sort((a, b) => a.threatLevel - b.threatLevel)[0];

  const lastHuntResult = state.player.lastHuntResult;
  const realtimeBonusAppliedForLastResolvedAt =
    lastHuntResult !== null &&
    lastHuntResult.realtimeContributionAppliedForResolvedAt ===
      lastHuntResult.resolvedAt &&
    lastHuntResult.realtimeContributionBonusMultiplier !== null;

  const canOpenExpeditionForNewDeploy =
    !isHuntRunning &&
    (lastHuntResult === null || realtimeBonusAppliedForLastResolvedAt);

  const canCraftMossRation =
    state.player.resources.bioSamples >= MOSS_RATION_RECIPE_COST.bioSamples &&
    state.player.resources.runeDust >= MOSS_RATION_RECIPE_COST.runeDust;

  const stabilizationSigilCrafted = hasStabilizationSigil(
    state.player.knownRecipes,
  );
  const canCraftStabilizationSigil =
    !stabilizationSigilCrafted &&
    state.player.resources.credits >=
      RUNE_CRAFTER_STABILIZATION_SIGIL_COST.credits &&
    state.player.resources.runeDust >=
      RUNE_CRAFTER_STABILIZATION_SIGIL_COST.runeDust &&
    state.player.resources.emberCore >=
      RUNE_CRAFTER_STABILIZATION_SIGIL_COST.emberCore;

  const isQueueFull = missionQueue.length >= state.player.maxMissionQueueSlots;

  return (
    <div className="absolute right-2 top-2 z-[35] flex max-h-[min(72vh,520px)] w-[min(360px,calc(100vw-1rem))] flex-col overflow-hidden rounded-xl border border-white/15 bg-black/75 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
          Intel
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-white/70 hover:bg-white/10"
        >
          Close
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 text-sm">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Realm
          </div>
          <div className="mt-1 font-semibold text-white">{zone.label}</div>
          <div className="mt-1 text-xs text-white/60">
            {zone.threatBand.toUpperCase()} · Lvl {zone.threatLevel}{" "}
            {isRecommended ? (
              <span className="text-emerald-300">· OK</span>
            ) : (
              <span className="text-red-300">· Risk</span>
            )}
          </div>
          <div className="mt-2 text-xs text-white/50">
            Mastery {state.player.zoneMastery[zone.id] ?? 0} · Streak{" "}
            {state.player.zoneRunStreak}
          </div>
          {(() => {
            const mastery = state.player.zoneMastery[zone.id] ?? 0;
            const masteryExtraBossChance = voidFieldClamp(
              mastery * 0.01,
              0,
              0.2,
            );
            const tierStep = 5;
            const nextTierTarget =
              (Math.floor(mastery / tierStep) + 1) * tierStep;
            const remainingToNextTier = Math.max(0, nextTierTarget - mastery);
            return (
              <div className="mt-1 text-[11px] text-white/45">
                Boss nudge ~{Math.round(masteryExtraBossChance * 100)}% · Next +{remainingToNextTier} to {nextTierTarget}
              </div>
            );
          })()}
          {nextLockedZone ? (
            <p className="mt-2 text-[11px] text-white/50">
              Next: {nextLockedZone.label} @ rank {nextLockedZone.threatLevel}
            </p>
          ) : null}
          <Link
            href={VOID_EXPEDITION_PATH}
            className="mt-3 inline-flex text-sm font-semibold text-cyan-200 underline decoration-cyan-400/35"
          >
            Change realm
          </Link>
        </div>

        <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Deployment
          </div>
          <p className="mt-1 font-semibold text-white">{stateLine}</p>
          <p className="mt-1 text-xs text-white/60">
            Queue {missionQueue.length}/{state.player.maxMissionQueueSlots} ·
            Waves {spawnWavesLine}
          </p>
          {!isHuntRunning ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!canOpenExpeditionForNewDeploy) return;
                  router.push(`${VOID_EXPEDITION_PATH}?zone=${allocatedZone.id}`);
                }}
                disabled={!canOpenExpeditionForNewDeploy}
                className={[
                  "rounded-lg border px-3 py-2 text-xs font-semibold",
                  canOpenExpeditionForNewDeploy
                    ? "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-50"
                    : "cursor-not-allowed border-white/10 text-white/45",
                ].join(" ")}
              >
                New expedition
              </button>
              <button
                type="button"
                onClick={() => router.push("/home")}
                className="rounded-lg border border-white/12 bg-black/30 px-3 py-2 text-xs font-semibold text-white/80"
              >
                Hub
              </button>
            </div>
          ) : null}
          {isQueueFull && !isHuntRunning ? (
            <p className="mt-2 text-xs text-amber-200/80">Queue full.</p>
          ) : null}
        </div>

        {lastHuntResult &&
        lastHuntResult.realtimeContributionAppliedForResolvedAt ===
          lastHuntResult.resolvedAt &&
        lastHuntResult.realtimeContributionBonusMultiplier !== null ? (
          <div className="mt-3 space-y-3">
            {(() => {
              const latest = lastHuntResult;
              const baseRank = latest.baseRankXpGained ?? latest.rankXpGained;
              const baseCredits = latest.baseResourcesGained?.credits ?? 0;
              const bonusMultiplier =
                latest.realtimeContributionBonusMultiplier ?? 0;
              const bonusRank = latest.realtimeRankXpBonusGained ?? 0;
              const bonusCredits =
                latest.realtimeResourcesBonusGained?.credits ?? 0;
              const finalRank = latest.rankXpGained ?? baseRank;
              const finalCredits =
                latest.resourcesGained?.credits ?? baseCredits;
              const realtimeTotalDamageDealt =
                latest.realtimeTotalDamageDealt ?? 0;
              const realtimeTotalHitsLanded =
                latest.realtimeTotalHitsLanded ?? 0;
              const realtimeMobsContributedTo =
                latest.realtimeMobsContributedTo ?? 0;
              const realtimeMobsKilled = latest.realtimeMobsKilled ?? 0;
              const contributionRole = getContributionRole({
                totalDamage: realtimeTotalDamageDealt,
                totalHits: realtimeTotalHitsLanded,
                mobsContributedTo: realtimeMobsContributedTo,
                mobsKilled: realtimeMobsKilled,
              });
              const contributionProfessionHint =
                getContributionProfessionHint({
                  totalDamage: realtimeTotalDamageDealt,
                  totalHits: realtimeTotalHitsLanded,
                  mobsContributedTo: realtimeMobsContributedTo,
                  mobsKilled: realtimeMobsKilled,
                });
              return (
                <div className="rounded-lg border border-cyan-400/25 bg-cyan-500/10 p-3 text-xs text-white/75">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">
                    Last bonus
                  </div>
                  <p>
                    Rank +{baseRank} +{bonusRank} → +{finalRank}
                  </p>
                  <p>
                    Cr +{baseCredits} +{bonusCredits} → +{finalCredits}
                  </p>
                  <p>Multiplier +{Math.round(bonusMultiplier * 100)}%</p>
                  <p className="mt-2 font-semibold text-white/90">
                    {contributionRole}
                  </p>
                  <p className="text-white/55">{contributionProfessionHint}</p>
                </div>
              );
            })()}
            {(() => {
              const latest = lastHuntResult!;
              const kills = latest.kills ?? 0;
              const damage = latest.damage ?? 0;
              const bossDefeated = latest.bossDefeated ?? false;
              const bio = latest.resourcesGained?.bioSamples ?? 0;
              const mecha = latest.resourcesGained?.scrapAlloy ?? 0;
              const spirit = latest.resourcesGained?.runeDust ?? 0;
              const score =
                kills * 120 + Math.round(damage / 10) + (bossDefeated ? 600 : 0);
              const rating =
                score >= 2400 ? "S" : score >= 1600 ? "A" : score >= 900 ? "B" : "C";
              return (
                <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs">
                  <div className="font-semibold text-white">Last run · {rating}</div>
                  <p className="mt-1 text-white/65">
                    Kills {kills} · Dmg {Math.round(damage)} · Boss{" "}
                    {bossDefeated ? "yes" : "no"}
                  </p>
                  <p className="text-white/55">
                    Bio +{bio} · Mecha +{mecha} · Dust +{spirit}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {canCraftMossRation ? (
                      <Link
                        href="/bazaar/crafting-district"
                        className="text-[11px] font-semibold text-emerald-200 underline"
                      >
                        Moss Ration
                      </Link>
                    ) : null}
                    {canCraftStabilizationSigil ? (
                      <Link
                        href="/bazaar/crafting-district"
                        className="text-[11px] font-semibold text-cyan-200 underline"
                      >
                        Sigil
                      </Link>
                    ) : null}
                    <Link
                      href="/inventory"
                      className="text-[11px] text-white/60 underline"
                    >
                      Inventory
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : null}

        <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
          <Link
            href="/bazaar/mercenary-guild"
            className="block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85"
          >
            Hunting Ground
          </Link>
          <Link
            href="/bazaar/biotech-labs/result"
            className="block rounded-lg border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100"
          >
            Hunt result
          </Link>
          <Link
            href="/bazaar/teleport-gate"
            className="block rounded-lg border border-sky-400/25 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-100"
          >
            Teleport Gate
          </Link>
        </div>
      </div>
    </div>
  );
}
