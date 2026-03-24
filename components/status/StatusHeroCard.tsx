"use client";

import Image from "next/image";
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
  const recoveryAmount = getStatusRecoveryAmount(player.knownRecipes);
  const stabilizationSigilActive = hasStabilizationSigil(player.knownRecipes);
  const conditionPressurePenalty = getConditionPressurePenalty(
    player.condition,
  );
  const canAffordRecovery = player.resources.credits >= STATUS_RECOVERY_COST;
  const canRecoverCondition = canAffordRecovery && !isRecoveryOnCooldown;
  const canConsumeRation = player.resources.mossRations > 0;
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

  function handleRecoverCondition() {
    if (!canRecoverCondition) return;

    dispatch({ type: "RECOVER_CONDITION" });
  }

  function handleConsumeRation() {
    if (!canConsumeRation) return;

    dispatch({ type: "CONSUME_MOSS_RATION" });
  }

  return (
    <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,20,34,0.82),rgba(7,9,16,0.94))] p-5 shadow-[0_18px_56px_rgba(0,0,0,0.35)] backdrop-blur md:p-6">
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
                    ? "Recover Condition"
                    : "Need 10 Credits"}
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
