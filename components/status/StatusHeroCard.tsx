"use client";

import Image from "next/image";
import Link from "next/link";
import { canonPathFactions } from "@/features/canonRegistry";
import { factionData } from "@/features/factions/factionData";
import { useGame } from "@/features/game/gameContext";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";
import { useRecoveryCooldown } from "@/features/status/useRecoveryCooldown";
import {
  CONDITION_PRESSURE_PENALTY,
  CONDITION_PRESSURE_THRESHOLD,
  getConditionPressurePenalty,
  getStatusRecoveryAmount,
  hasStabilizationSigil,
  STATUS_RECOVERY_COST,
} from "@/features/status/statusRecovery";
import {
  EMERGENCY_RATION_CONDITION_RESTORE,
  EMERGENCY_RATION_COST,
  getHungerLabel,
  HUNGER_PRESSURE_THRESHOLD,
  MOSS_RATION_CONDITION_RESTORE,
  MOSS_RATION_HUNGER_RESTORE,
} from "@/features/status/survival";

function formatFactionLabel(faction: string) {
  if (faction === "unbound") return "Unbound";
  if (faction === "bio") return "Bio";
  if (faction === "mecha") return "Mecha";
  if (faction === "pure") return "Pure";
  return faction;
}

function getPathAccent(path: string) {
  switch (path) {
    case "bio":
      return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
    case "mecha":
      return "border-cyan-400/30 bg-cyan-500/10 text-cyan-100";
    case "pure":
      return "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-100";
    default:
      return "border-white/10 bg-white/5 text-white/80";
  }
}

function getConditionLabel(condition: number) {
  if (condition >= 85) return "Optimal";
  if (condition >= 65) return "Stable";
  if (condition >= 40) return "Strained";
  return "Critical";
}

function getProgressPercent(current: number, max: number) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (current / max) * 100));
}

export default function StatusHeroCard() {
  const { state, dispatch } = useGame();
  const { player } = state;
  const guidance = getFirstSessionGuidance(state);
  const { recoveryCooldownRemainingSeconds, isRecoveryOnCooldown } =
    useRecoveryCooldown(player.conditionRecoveryAvailableAt);
  const {
    recoveryCooldownRemainingSeconds: emergencyCooldownRemainingSeconds,
    isRecoveryOnCooldown: isEmergencyOnCooldown,
  } = useRecoveryCooldown(player.emergencyRationAvailableAt);
  const recoveryAmount = getStatusRecoveryAmount(player.knownRecipes);
  const stabilizationSigilActive = hasStabilizationSigil(player.knownRecipes);
  const conditionPressurePenalty = getConditionPressurePenalty(
    player.condition,
  );
  const canAffordRecovery = player.resources.credits >= STATUS_RECOVERY_COST;
  const canRecoverCondition = canAffordRecovery && !isRecoveryOnCooldown;
  const canConsumeRation = player.resources.mossRations > 0;
  const showMossRationRecoveryPrompt =
    player.condition <= 15 && player.resources.mossRations === 0;
  const canEmergencyRation =
    player.resources.credits >= EMERGENCY_RATION_COST && !isEmergencyOnCooldown;
  const canCraftMossRationNow =
    player.resources.bioSamples >= 10 && player.resources.ironOre >= 5;
  const recoveryActionMessage = isRecoveryOnCooldown
    ? `Blocked. Recovery is cooling down for ${recoveryCooldownRemainingSeconds}s before another stabilization cycle can begin.`
    : !canAffordRecovery
      ? `Blocked. Recovery needs ${STATUS_RECOVERY_COST} credits before stabilization can begin.`
      : guidance.nextAction === "recover"
        ? "Recommended. Low condition is the main blocker before the next loop step."
        : "Ready. Condition is stable enough to continue, but recovery remains available if needed.";

  const rankProgress = getProgressPercent(player.rankXp, player.rankXpToNext);
  const selectedFaction =
    player.factionAlignment === "unbound" ? null : player.factionAlignment;
  const needsRecoveryPriority =
    player.condition < 40 || player.hunger < 40;

  function handleRecoverCondition() {
    if (!canRecoverCondition) return;

    dispatch({ type: "RECOVER_CONDITION" });
  }

  function handleConsumeRation() {
    if (!canConsumeRation) return;

    dispatch({ type: "CONSUME_MOSS_RATION" });
  }

  function handleEmergencyRation() {
    if (!canEmergencyRation) return;

    dispatch({ type: "USE_EMERGENCY_RATION" });
  }

  return (
    <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,20,34,0.82),rgba(7,9,16,0.94))] p-5 shadow-[0_18px_56px_rgba(0,0,0,0.35)] backdrop-blur md:p-6">
      {needsRecoveryPriority ? (
        <div className="mb-5 rounded-[22px] border border-amber-400/35 bg-[linear-gradient(165deg,rgba(60,28,8,0.5),rgba(12,8,6,0.92))] px-4 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200/75">
            Recovery priority
          </div>
          <p className="mt-2 text-sm leading-relaxed text-amber-50/95">
            Condition or hunger is in the danger band. The contract stack and the
            Void both tax a weak body — buy time in the Black Market, use the
            tools below, then return to{" "}
            <Link
              href="/home"
              className="font-semibold text-amber-100 underline decoration-amber-400/45 underline-offset-2 hover:text-white"
            >
              Command
            </Link>{" "}
            when you are steady.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/bazaar/black-market"
              className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-amber-300/40 bg-amber-500/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-50 hover:border-amber-200/55 hover:bg-amber-500/22"
            >
              Black Market
            </Link>
            <Link
              href="/missions"
              className="inline-flex min-h-[40px] items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/80 hover:border-white/25 hover:bg-white/10"
            >
              Review contracts
            </Link>
          </div>
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-white/38">
                  Character Identity
                </div>
                <div className="mt-3 text-3xl font-black uppercase tracking-[0.06em] text-white md:text-4xl">
                  {player.playerName}
                </div>
                <div className="mt-2 text-sm uppercase tracking-[0.16em] text-white/55">
                  {player.rank}
                </div>
                <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/78">
                  {formatFactionLabel(player.factionAlignment)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm lg:min-w-[220px]">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                    Rank Level
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {player.rankLevel}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                    Influence
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {player.influence}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {factionData.map((faction) => {
                const isActive = selectedFaction === faction.id;

                return (
                  <div
                    key={faction.id}
                    className={[
                      "rounded-[20px] border p-4 transition",
                      isActive
                        ? getPathAccent(faction.id)
                        : "border-white/10 bg-white/[0.03] text-white/72",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                        <Image
                          src={faction.icon}
                          alt={faction.name}
                          fill
                          className="object-contain p-2"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">
                          {canonPathFactions[faction.id].tagline}
                        </div>
                        <div className="mt-2 text-lg font-black uppercase tracking-[0.06em]">
                          {faction.name}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-sm leading-6 opacity-80">
                      {faction.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[22px] border border-red-400/20 bg-[linear-gradient(180deg,rgba(70,14,18,0.42),rgba(15,8,12,0.9))] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-red-100/55">
                    Condition
                  </div>
                  <div className="mt-2 text-4xl font-black text-white">
                    {player.condition}%
                  </div>
                </div>
                <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/72">
                  {getConditionLabel(player.condition)}
                </div>
              </div>

              <div className="mt-4 h-3 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,rgba(248,113,113,0.8),rgba(239,68,68,1))]"
                  style={{ width: `${player.condition}%` }}
                />
              </div>

              <div className="mt-4 space-y-2 text-xs leading-6 text-white/58">
                <div>Recovery Cost: {STATUS_RECOVERY_COST} Credits</div>
                <div>
                  Recovery Yield: +{recoveryAmount} Condition
                  {stabilizationSigilActive ? " (Sigil boosted)" : ""}
                </div>
                <div>
                  Pressure Penalty:{" "}
                  {conditionPressurePenalty > 0
                    ? `-${CONDITION_PRESSURE_PENALTY} extra condition on the next exploration or mission claim while below ${CONDITION_PRESSURE_THRESHOLD}%`
                    : `Inactive until condition drops below ${CONDITION_PRESSURE_THRESHOLD}%`}
                </div>
                <div>
                  {isRecoveryOnCooldown
                    ? `Recovery Cooldown: ${recoveryCooldownRemainingSeconds}s`
                    : "Recovery Cooldown: Ready"}
                </div>
                <div>
                  {isEmergencyOnCooldown
                    ? `Emergency Cooldown: ${emergencyCooldownRemainingSeconds}s`
                    : "Emergency Cooldown: Ready"}
                </div>
              </div>

              <button
                type="button"
                onClick={handleRecoverCondition}
                disabled={!canRecoverCondition}
                className={[
                  "mt-4 rounded-xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] transition",
                  canRecoverCondition
                    ? "border-red-300/35 bg-red-500/14 text-red-50 hover:border-red-200/45 hover:bg-red-500/20"
                    : "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/30",
                ].join(" ")}
              >
                {isRecoveryOnCooldown
                  ? "Recovery Cooling Down"
                  : canAffordRecovery
                    ? `Recover Condition (${STATUS_RECOVERY_COST} cr)`
                    : `Need ${STATUS_RECOVERY_COST} Credits`}
              </button>
              <button
                type="button"
                onClick={handleEmergencyRation}
                disabled={!canEmergencyRation}
                className={[
                  "mt-2 rounded-xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] transition",
                  canEmergencyRation
                    ? "border-amber-300/35 bg-amber-500/14 text-amber-50 hover:border-amber-200/45 hover:bg-amber-500/20"
                    : "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/30",
                ].join(" ")}
              >
                {isEmergencyOnCooldown
                  ? "Emergency Cooling Down"
                  : player.resources.credits >= EMERGENCY_RATION_COST
                    ? `Emergency Ration (${EMERGENCY_RATION_COST} cr)`
                    : `Need ${EMERGENCY_RATION_COST} Credits`}
              </button>

              <div className="mt-3 text-xs leading-6 text-white/58">
                {recoveryActionMessage}
              </div>
            </div>

            <div className="rounded-[22px] border border-amber-400/20 bg-[linear-gradient(180deg,rgba(68,42,10,0.38),rgba(15,10,8,0.9))] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-amber-100/55">
                    Hunger
                  </div>
                  <div className="mt-2 text-4xl font-black text-white">
                    {player.hunger}%
                  </div>
                </div>
                <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/72">
                  {getHungerLabel(player.hunger)}
                </div>
              </div>

              <div className="mt-4 h-3 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,rgba(251,191,36,0.8),rgba(245,158,11,1))]"
                  style={{ width: `${player.hunger}%` }}
                />
              </div>

              <div className="mt-4 space-y-2 text-xs leading-6 text-white/58">
                <div>
                  Hunger below {HUNGER_PRESSURE_THRESHOLD}% adds steady condition pressure.
                </div>
                <div>
                  Moss Ration restores {MOSS_RATION_HUNGER_RESTORE}% hunger and{" "}
                  {MOSS_RATION_CONDITION_RESTORE}% condition.
                </div>
              </div>

              <button
                type="button"
                onClick={handleConsumeRation}
                disabled={!canConsumeRation}
                className={[
                  "mt-4 rounded-xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] transition",
                  canConsumeRation
                    ? "border-amber-300/35 bg-amber-400/12 text-amber-100 hover:border-amber-200/45 hover:bg-amber-400/18"
                    : "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/30",
                ].join(" ")}
              >
                {canConsumeRation ? "Use Moss Ration" : "No Moss Rations"}
              </button>
              {showMossRationRecoveryPrompt ? (
                <div className="mt-3 rounded-xl border border-amber-300/30 bg-amber-500/10 px-3 py-3 text-xs leading-relaxed text-amber-100/90">
                  Critical survival condition with no Moss Rations on hand.
                  Stabilize via crafting, or use an emergency ration if credits
                  remain.
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "CRAFT_MOSS_RATION" })}
                      disabled={!canCraftMossRationNow}
                      className={[
                        "rounded-lg border px-2 py-1 font-semibold uppercase tracking-[0.08em]",
                        canCraftMossRationNow
                          ? "border-amber-200/40 bg-black/25 text-amber-50 hover:border-amber-100/60"
                          : "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/30",
                      ].join(" ")}
                      title={
                        canCraftMossRationNow
                          ? "Craft Moss Ration: 10 bio samples + 5 iron ore."
                          : "Need 10 bio samples and 5 iron ore."
                      }
                    >
                      Craft Moss Ration
                    </button>
                    <button
                      type="button"
                      onClick={handleEmergencyRation}
                      disabled={!canEmergencyRation}
                      className={[
                        "rounded-lg border px-2 py-1 font-semibold uppercase tracking-[0.08em] text-amber-50",
                        canEmergencyRation
                          ? "border-amber-200/40 bg-black/25 hover:border-amber-100/60"
                          : "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/30",
                      ].join(" ")}
                      title={
                        canEmergencyRation
                          ? `Emergency Ration: spend ${EMERGENCY_RATION_COST} credits to restore ${EMERGENCY_RATION_CONDITION_RESTORE}% condition.`
                          : `Need ${EMERGENCY_RATION_COST} credits or wait for cooldown.`
                      }
                    >
                      Emergency Ration
                    </button>
                  </div>
                  <div className="mt-2 text-[11px] text-amber-100/75">
                    Craft: 10 bio samples + 5 iron ore. Emergency: {EMERGENCY_RATION_COST} credits for +{EMERGENCY_RATION_CONDITION_RESTORE}% condition.
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,22,36,0.82),rgba(8,10,16,0.95))] p-5">
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Rank / Mastery Snapshot
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm text-white/72">
                  <span className="uppercase tracking-[0.08em]">Rank Progress</span>
                  <span>
                    {player.rankXp}/{player.rankXpToNext}
                  </span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(248,250,252,0.7),rgba(255,255,255,1))]"
                    style={{ width: `${rankProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-white/55">
                  Complete hunts and missions to advance rank.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm text-white/72">
                  <span className="uppercase tracking-[0.08em]">Mastery</span>
                  <span>{player.masteryProgress}%</span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(192,132,252,0.72),rgba(168,85,247,1))]"
                    style={{ width: `${player.masteryProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
