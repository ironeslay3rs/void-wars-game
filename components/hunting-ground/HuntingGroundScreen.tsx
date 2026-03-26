"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { useGame } from "@/features/game/gameContext";
import { huntingGroundScreenData } from "@/features/hunting-ground/huntingGroundScreenData";
import { VOID_EXPEDITION_PATH } from "@/features/void-maps/voidRoutes";
import {
  buildAfkFieldRunFeedback,
  formatAfkTrendLabel,
  getAfkFieldRiskRead,
  getAfkRunTrend,
  getExtractionQualityLabelForCondition,
  getLiveFieldIntensityLabel,
} from "@/features/hunting-ground/afkRunFeedback";
import type {
  MissionDefinition,
  MissionQueueEntry,
} from "@/features/game/gameTypes";

type HuntingGroundScreenHeader = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

type QueuedMissionView = MissionQueueEntry & {
  mission: MissionDefinition;
};

type CompletionFeedback = {
  title: string;
  detail: string;
  rankXp: number;
  masteryProgress: number;
  influence: number;
  conditionDelta: number;
  resources: Array<[string, number]>;
};

function getContractTierLabel(durationHours: number) {
  if (durationHours <= 0.0042) {
    return "Short Run";
  }

  if (durationHours <= 0.0056) {
    return "Medium Run";
  }

  return "Long Run";
}

function formatDuration(durationHours: number) {
  const totalSeconds = Math.max(1, Math.round(durationHours * 60 * 60));

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes < 60) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatRewardLabel(key: string) {
  switch (key) {
    case "credits":
      return "Credits";
    case "ironOre":
      return "Iron Ore";
    case "scrapAlloy":
      return "Scrap Alloy";
    case "runeDust":
      return "Rune Dust";
    case "emberCore":
      return "Ember Core";
    case "bioSamples":
      return "Bio Samples";
    case "mossRations":
      return "Moss Rations";
    case "coilboundLattice":
      return "Coilbound Lattice";
    case "ashSynodRelic":
      return "Ash Synod Relic";
    case "vaultLatticeShard":
      return "Vault Lattice Shard";
    default:
      return key;
  }
}

function formatCountdown(targetTime: number, now: number, prefix: string) {
  const remainingMs = Math.max(0, targetTime - now);
  const totalSeconds = Math.floor(remainingMs / 1000);

  if (totalSeconds < 60) {
    return `${prefix} ${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes < 60) {
    return `${prefix} ${minutes}m ${seconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${prefix} ${hours}h ${remainingMinutes}m`;
}

function getQueueStatus(entry: MissionQueueEntry, now: number) {
  return now < entry.startsAt ? "queued" : "active";
}

function getQueueStatusLabel(entry: MissionQueueEntry, now: number) {
  const status = getQueueStatus(entry, now);

  if (status === "queued") {
    return formatCountdown(entry.startsAt, now, "Starts in");
  }

  return formatCountdown(entry.endsAt, now, "Ends in");
}

function buildCompletionFeedback(completedMissions: MissionDefinition[]): CompletionFeedback {
  const rankXp = completedMissions.reduce(
    (sum, mission) => sum + mission.reward.rankXp,
    0,
  );
  const masteryProgress = completedMissions.reduce(
    (sum, mission) => sum + mission.reward.masteryProgress,
    0,
  );
  const influence = completedMissions.reduce(
    (sum, mission) => sum + (mission.reward.influence ?? 0),
    0,
  );
  const conditionDelta = completedMissions.reduce(
    (sum, mission) => sum + mission.reward.conditionDelta,
    0,
  );
  const resourceTotals = completedMissions.reduce<Record<string, number>>(
    (totals, mission) => {
      Object.entries(mission.reward.resources ?? {}).forEach(([key, value]) => {
        if (typeof value !== "number" || value === 0) {
          return;
        }

        totals[key] = (totals[key] ?? 0) + value;
      });

      return totals;
    },
    {},
  );
  const resources = Object.entries(resourceTotals);

  if (completedMissions.length === 1) {
    const mission = completedMissions[0];

    return {
      title: "Hunt Complete",
      detail: `${mission.title} resolved and the payout was added to your shared progression pool.`,
      rankXp,
      masteryProgress,
      influence,
      conditionDelta,
      resources,
    };
  }

  return {
    title: `${completedMissions.length} Hunts Complete`,
    detail:
      "Multiple Hunting Ground runs resolved together and their payouts were applied.",
    rankXp,
    masteryProgress,
    influence,
    conditionDelta,
    resources,
  };
}

type HuntingGroundScreenProps = {
  header?: HuntingGroundScreenHeader;
};

export default function HuntingGroundScreen({
  header = huntingGroundScreenData,
}: HuntingGroundScreenProps) {
  const { state, dispatch } = useGame();
  const [now, setNow] = useState(() => Date.now());
  const [completionFeedback, setCompletionFeedback] =
    useState<CompletionFeedback | null>(null);
  const [afkTrendHint, setAfkTrendHint] = useState<string | null>(null);
  const lastHgResolvedRef = useRef<number | null>(null);
  const prevAfkQualityRef = useRef<number | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const huntingGroundMissions = state.missions.filter(
    (mission) => mission.category === "hunting-ground",
  );
  const huntingGroundMissionIds = new Set(
    huntingGroundMissions.map((mission) => mission.id),
  );

  const queue = Array.isArray(state.player.missionQueue)
    ? state.player.missionQueue
    : [];

  const queuedEntries: QueuedMissionView[] = queue.reduce<QueuedMissionView[]>(
    (acc, entry) => {
      if (!huntingGroundMissionIds.has(entry.missionId)) {
        return acc;
      }

      const mission = state.missions.find((item) => item.id === entry.missionId);

      if (!mission) {
        return acc;
      }

      acc.push({
        ...entry,
        mission,
      });

      return acc;
    },
    [],
  );

  const queuedMissionIds = new Set(queuedEntries.map((entry) => entry.missionId));
  const activeEntries = queuedEntries.filter(
    (entry) => now >= entry.startsAt && now < entry.endsAt,
  );
  const pendingEntries = queuedEntries.filter((entry) => now < entry.startsAt);
  const activeHgEntry = activeEntries[0] ?? null;
  const activeRunRiskRead = activeHgEntry
    ? getAfkFieldRiskRead({
        condition: state.player.condition,
        hunger: state.player.hunger,
      })
    : null;
  const activeRunExtractionPreview = activeHgEntry
    ? getExtractionQualityLabelForCondition(state.player.condition)
    : null;
  const hasStarterContracts = huntingGroundMissions.length > 0;
  const previousQueuedEntriesRef = useRef<QueuedMissionView[]>(queuedEntries);

  useEffect(() => {
    const result = state.player.lastHuntResult;
    if (!result) {
      return;
    }

    const mission = state.missions.find((m) => m.id === result.missionId);
    if (mission?.category !== "hunting-ground") {
      return;
    }

    if (lastHgResolvedRef.current === result.resolvedAt) {
      return;
    }

    lastHgResolvedRef.current = result.resolvedAt;

    const feedback = buildAfkFieldRunFeedback(result, mission, {
      rankLevel: state.player.rankLevel,
      masteryProgress: state.player.masteryProgress,
    });
    const trend = getAfkRunTrend(
      prevAfkQualityRef.current,
      feedback.qualityScore,
    );
    prevAfkQualityRef.current = feedback.qualityScore;
    setAfkTrendHint(formatAfkTrendLabel(trend));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- trend runs on new hunt only; rank/mastery match that commit
  }, [state.player.lastHuntResult, state.missions]);

  const lastHgResult = state.player.lastHuntResult;
  const lastHgIsField =
    !!lastHgResult &&
    huntingGroundMissionIds.has(lastHgResult.missionId);

  const cards = [
    {
      label: "Contracts",
      value: String(huntingGroundMissions.length),
      hint: "Start here when you want background hunt progress without reopening the main field loop.",
    },
    {
      label: "Queue",
      value: `${queue.length}/${state.player.maxMissionQueueSlots}`,
      hint: "Deploy a contract, let the queue run, then return here to read the payout and decide what comes next.",
    },
    {
      label: "Condition",
      value: `${state.player.condition}/100`,
      hint: "Contracts still spend condition, so the payout may push you toward Feast Hall before the next run.",
    },
  ];

  useEffect(() => {
    const previousEntries = previousQueuedEntriesRef.current;
    const currentIds = new Set(queuedEntries.map((entry) => entry.queueId));
    const completedMissions = previousEntries
      .filter(
        (entry) =>
          !currentIds.has(entry.queueId) &&
          entry.endsAt <= Date.now(),
      )
      .map((entry) => entry.mission);

    if (completedMissions.length > 0) {
      setCompletionFeedback(buildCompletionFeedback(completedMissions));
    }

    previousQueuedEntriesRef.current = queuedEntries;
  }, [queuedEntries]);

  useEffect(() => {
    if (!completionFeedback) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCompletionFeedback(null);
    }, 6000);

    return () => window.clearTimeout(timeout);
  }, [completionFeedback]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(120,90,40,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <BazaarSubpageNav accentClassName="hover:border-amber-300/40" />

        <ScreenHeader
          eyebrow={header.eyebrow}
          title={header.title}
          subtitle={header.subtitle}
        />

        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-amber-50/90">
            <span className="font-semibold text-white">Field deploy:</span>{" "}
            Quick deploy from{" "}
            <Link
              href="/home"
              className="text-amber-200 underline decoration-amber-400/40 underline-offset-2 hover:text-white"
            >
              Command Deck (Home)
            </Link>{" "}
            queues a short contract and lands here. Full payout readout lives on{" "}
            <Link
              href="/bazaar/biotech-labs/result"
              className="text-amber-200 underline decoration-amber-400/40 underline-offset-2 hover:text-white"
            >
              Hunt Result
            </Link>
            . For realm choice and the live void field, use{" "}
            <Link
              href={VOID_EXPEDITION_PATH}
              className="text-amber-200 underline decoration-amber-400/40 underline-offset-2 hover:text-white"
            >
              Void Expedition
            </Link>
            .
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">
            Field rhythm (this session)
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[11px] font-medium text-violet-100">
              Tempo: {getLiveFieldIntensityLabel(state.player)}
            </span>
            {lastHgIsField ? (
              <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-100">
                Last payout:{" "}
                {getExtractionQualityLabelForCondition(
                  lastHgResult.conditionAfter,
                )}
              </span>
            ) : (
              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] text-white/55">
                No hunting-ground payout on record yet
              </span>
            )}
            {afkTrendHint ? (
              <span className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-medium text-cyan-100">
                {afkTrendHint}
              </span>
            ) : null}
          </div>
        </div>

        {activeHgEntry && activeRunRiskRead ? (
          <SectionCard
            title="Active field run"
            description="Timer is live on the mission queue. Below is your in-run read: intensity, extraction posture before this payout finishes, and survival risk so you can prep the next move."
          >
            <div
              className={[
                "rounded-2xl border px-4 py-3",
                activeRunRiskRead.band === "critical"
                  ? "border-red-500/40 bg-red-500/12"
                  : activeRunRiskRead.band === "pressured"
                    ? "border-amber-400/35 bg-amber-500/12"
                    : "border-emerald-400/30 bg-emerald-500/10",
              ].join(" ")}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
                In-run status
              </div>
              <div
                className={[
                  "mt-1 text-sm font-semibold",
                  activeRunRiskRead.band === "critical"
                    ? "text-red-100"
                    : activeRunRiskRead.band === "pressured"
                      ? "text-amber-50"
                      : "text-emerald-50",
                ].join(" ")}
              >
                {activeRunRiskRead.label}
              </div>
              <p className="mt-2 text-sm leading-6 text-white/72">
                {activeRunRiskRead.detail}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="text-lg font-semibold text-white">
                  {activeHgEntry.mission.title}
                </div>
                <div className="mt-2 text-sm font-semibold text-amber-100/95">
                  {getQueueStatusLabel(activeHgEntry, now)}
                </div>
                <p className="mt-2 text-sm text-white/60">
                  Extraction read (now):{" "}
                  <span className="font-semibold text-white/88">
                    {activeRunExtractionPreview}
                  </span>
                  {" — "}
                  based on current condition before contract wear from this board
                  ({activeHgEntry.mission.reward.conditionDelta} condition on
                  settle).
                </p>
                <Link
                  href="/bazaar/biotech-labs/result"
                  className="mt-3 inline-flex text-sm font-semibold text-cyan-200/95 underline decoration-cyan-400/35 underline-offset-2 hover:text-white"
                >
                  Open Hunt Result (after timer)
                </Link>
              </div>
              <div className="flex flex-col gap-2 lg:items-end">
                <div className="flex flex-wrap justify-end gap-2">
                  <span className="rounded-full border border-violet-400/32 bg-violet-500/12 px-3 py-1 text-[11px] font-medium text-violet-100">
                    Intensity: {getLiveFieldIntensityLabel(state.player)}
                  </span>
                  <span
                    className={[
                      "rounded-full border px-3 py-1 text-[11px] font-medium",
                      activeRunExtractionPreview === "Clean extraction"
                        ? "border-emerald-400/35 bg-emerald-500/12 text-emerald-50"
                        : activeRunExtractionPreview === "Standard pull"
                          ? "border-cyan-400/30 bg-cyan-500/12 text-cyan-50"
                          : "border-orange-400/35 bg-orange-500/12 text-orange-50",
                    ].join(" ")}
                  >
                    Extraction (current): {activeRunExtractionPreview}
                  </span>
                  <span
                    className={[
                      "rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]",
                      activeRunRiskRead.band === "critical"
                        ? "border-red-400/40 bg-red-500/15 text-red-50"
                        : activeRunRiskRead.band === "pressured"
                          ? "border-amber-400/40 bg-amber-500/14 text-amber-50"
                          : "border-emerald-400/40 bg-emerald-500/14 text-emerald-50",
                    ].join(" ")}
                  >
                    {activeRunRiskRead.band === "safe"
                      ? "Prep: safe"
                      : activeRunRiskRead.band === "pressured"
                        ? "Prep: plan recovery"
                        : "Prep: urgent"}
                  </span>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <span className="rounded-full border border-white/12 bg-black/28 px-3 py-1 text-[11px] text-white/85">
                    Expected: +{activeHgEntry.mission.reward.rankXp} XP · +{" "}
                    {activeHgEntry.mission.reward.masteryProgress} Mastery
                  </span>
                  {Object.entries(
                    activeHgEntry.mission.reward.resources ?? {},
                  )
                    .filter(([, value]) => typeof value === "number" && value !== 0)
                    .map(([key, value]) => (
                      <span
                        key={key}
                        className="rounded-full border border-emerald-500/22 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-100"
                      >
                        +{value} {formatRewardLabel(key)}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </SectionCard>
        ) : null}

        {!activeEntries[0] && pendingEntries[0] ? (
          <SectionCard
            title="Contract queued"
            description="The mission queue is holding your hunt until the prior window clears or the clock reaches start time."
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-base font-semibold text-white">
                  {pendingEntries[0].mission.title}
                </div>
                <div className="mt-2 text-sm text-cyan-100/88">
                  {getQueueStatusLabel(pendingEntries[0], now)}
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-100">
                Waiting
              </span>
            </div>
          </SectionCard>
        ) : null}

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        {completionFeedback ? (
          <SectionCard
            title={completionFeedback.title}
            description={completionFeedback.detail}
          >
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-amber-200/70">
                  Rewards Applied
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/85">
                    +{completionFeedback.rankXp} XP
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/85">
                    +{completionFeedback.masteryProgress} Mastery
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/85">
                    +{completionFeedback.influence} Influence
                  </span>
                  <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-200">
                    {completionFeedback.conditionDelta} Condition
                  </span>
                  {completionFeedback.resources.map(([key, value]) => (
                    <span
                      key={key}
                      className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100"
                    >
                      +{value} {formatRewardLabel(key)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/8 p-4 text-sm text-cyan-50/88">
                <div>
                  {state.player.condition < 60
                    ? "Next Step: the contract paid out, but condition is strained. Open Feast Hall or Status before taking the next hunt."
                    : "Next Step: the payout is banked. Open Feast Hall if you need stabilization, or redeploy another contract if the body is still holding."}
                </div>
                <div className="mt-2 text-xs text-cyan-100/75">
                  Post-run read:{" "}
                  {getExtractionQualityLabelForCondition(state.player.condition)}
                  . Rank and mastery nudge how hard contracts feel even with the same
                  timer rails.
                </div>
              </div>
              <Link
                href="/bazaar/biotech-labs/result"
                className="inline-flex w-fit rounded-2xl border border-cyan-400/35 bg-cyan-500/12 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:border-cyan-300/50 hover:bg-cyan-500/18"
              >
                Open full Hunt Result readout
              </Link>
            </div>
          </SectionCard>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <SectionCard
            title="Contract Board"
            description="Start here. Pick a repeatable hunt contract, press Deploy, and the run will enter the shared timer queue. Short runs are the easiest first step."
          >
            <div className="space-y-3">
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4 text-sm text-amber-50/90">
                Contract Loop: deploy a hunt, let the field team run it through
                the shared queue, claim the payout, then decide whether to
                recover, trade, or redeploy.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/68">
                New-player rule: choose one contract, press Deploy, wait for the
                queue to resolve, then come back here to read the payout before
                spending it in Feast Hall or the Crafting District.
              </div>

              {!hasStarterContracts ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-white/50">
                  No hunt contracts are available yet. Contract postings will
                  appear here once valid repeatable contract data is present.
                </div>
              ) : (
                huntingGroundMissions.map((mission) => {
                  const isQueued = queuedMissionIds.has(mission.id);
                  const resourceRewards = Object.entries(
                    mission.reward.resources ?? {},
                  ).filter(([, value]) => typeof value === "number" && value !== 0);

                  return (
                    <div
                      key={mission.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-white md:text-lg">
                              {mission.title}
                            </h3>

                            <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200">
                              Contract
                            </span>

                            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
                              {getContractTierLabel(mission.durationHours)}
                            </span>

                            <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
                              {formatDuration(mission.durationHours)}
                            </span>

                            {isQueued ? (
                              <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                                In Queue
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-2 text-sm leading-6 text-white/65">
                            {mission.description}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/85">
                              +{mission.reward.rankXp} XP
                            </span>
                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/85">
                              +{mission.reward.masteryProgress} Mastery
                            </span>
                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/85">
                              +{mission.reward.influence ?? 0} Influence
                            </span>
                            <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-200">
                              {mission.reward.conditionDelta} Condition
                            </span>

                            {resourceRewards.map(([key, value]) => (
                              <span
                                key={key}
                                className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100"
                              >
                                +{value} {formatRewardLabel(key)}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="w-full lg:w-[176px]">
                          <button
                            type="button"
                            onClick={() =>
                              dispatch({
                                type: "QUEUE_MISSION",
                                payload: { missionId: mission.id },
                              })
                            }
                            disabled={
                              isQueued ||
                              queue.length >= state.player.maxMissionQueueSlots
                            }
                            className={[
                              "w-full rounded-2xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition",
                              isQueued ||
                              queue.length >= state.player.maxMissionQueueSlots
                                ? "cursor-not-allowed border-white/10 bg-white/5 text-white/35"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-100 hover:border-amber-400/45 hover:bg-amber-500/15",
                            ].join(" ")}
                          >
                            {isQueued
                              ? "Deployed"
                              : queue.length >= state.player.maxMissionQueueSlots
                                ? "Queue Full"
                                : "Deploy"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>

          <div className="grid gap-6">
            <SectionCard
              title="Deployment Queue"
              description="These contract hunts occupy the shared live mission queue, so they compete for the same slots as standard Missions."
            >
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/65">
                  Read this panel in order: queued means waiting, active means
                  running, and once the payout lands you should check recovery
                  pressure before deploying again.
                </div>
                {queuedEntries.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-white/50">
                    No hunts are deployed yet. Choose a contract from the
                    Contract Board and press Deploy to begin the next run.
                  </div>
                ) : (
                  queuedEntries.map((entry) => {
                    const isActive = getQueueStatus(entry, now) === "active";

                    return (
                      <div
                        key={entry.queueId}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white">
                              {entry.mission.title}
                            </div>
                            <div className="mt-1 text-xs text-white/50">
                              {getQueueStatusLabel(entry, now)}
                            </div>
                          </div>

                          <span
                            className={[
                              "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em]",
                              isActive
                                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                                : "border-cyan-500/25 bg-cyan-500/10 text-cyan-200",
                            ].join(" ")}
                          >
                            {isActive ? "Active" : "Queued"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Ground Status"
              description="Quick read on how repeatable contracts are feeding material stock and the next survival decision."
            >
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Active Hunts
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {activeEntries.length} active / {pendingEntries.length} pending
                  </div>
                  <div className="mt-1 text-sm text-white/55">
                    The queue keeps running inside the existing mission timer flow.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Material Stock
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {state.player.resources.ironOre} Iron Ore /{" "}
                    {state.player.resources.scrapAlloy} Scrap Alloy /{" "}
                    {state.player.resources.bioSamples} Bio Samples
                  </div>
                  <div className="mt-1 text-sm text-white/55">
                    Contract payouts feed the same shared resource pool that
                    supports recovery, crafting, and the next Black Market call.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Condition Pressure
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {state.player.condition}/100
                  </div>
                  <div className="mt-1 text-sm text-white/55">
                    AFK hunts still consume condition, so Status remains part of the long session loop.
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}
