"use client";

import { useEffect, useRef, useState } from "react";
import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { useGame } from "@/features/game/gameContext";
import { huntingGroundScreenData } from "@/features/hunting-ground/huntingGroundScreenData";
import type {
  MissionDefinition,
  MissionQueueEntry,
} from "@/features/game/gameTypes";

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

export default function HuntingGroundScreen() {
  const { state, dispatch } = useGame();
  const [now, setNow] = useState(() => Date.now());
  const [completionFeedback, setCompletionFeedback] =
    useState<CompletionFeedback | null>(null);

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
  const hasStarterContracts = huntingGroundMissions.length > 0;
  const previousQueuedEntriesRef = useRef<QueuedMissionView[]>(queuedEntries);

  const cards = [
    {
      label: "Contracts",
      value: String(huntingGroundMissions.length),
      hint: "Repeatable AFK hunt contracts currently available through the guild.",
    },
    {
      label: "Queue",
      value: `${queue.length}/${state.player.maxMissionQueueSlots}`,
      hint: "Hunting Ground contracts consume slots from the shared global mission queue.",
    },
    {
      label: "Condition",
      value: `${state.player.condition}/100`,
      hint: "Queued hunts still trade condition for progression and material yield.",
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
          eyebrow={huntingGroundScreenData.eyebrow}
          title={huntingGroundScreenData.title}
          subtitle={huntingGroundScreenData.subtitle}
        />

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
            </div>
          </SectionCard>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <SectionCard
            title="Hunt Contract Board"
            description="Start here. Pick a starter contract, press Deploy, and the hunt will enter the shared timer queue. Short runs are the easiest first step."
          >
            <div className="space-y-3">
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4 text-sm text-amber-50/90">
                First Hunt: deploy any contract below to start background progress. Short Run contracts finish fastest if you want the quickest first result.
              </div>

              {!hasStarterContracts ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-white/50">
                  No hunt contracts are available yet. Hunting Ground starter contracts will appear here once this screen has valid guild data.
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
                              Hunting Ground
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
              description="These hunts occupy the shared live mission queue, so they compete for the same slots as standard Missions."
            >
              <div className="space-y-3">
                {queuedEntries.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-white/50">
                    No hunts are deployed yet. Choose a starter contract from the Hunt Contract Board and press Deploy to begin your first background run.
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
              description="Quick read on how repeatable hunt contracts are feeding progression and material stock."
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
                    Hunting Ground contracts feed the same shared resource pool used by inventory and future crafting.
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
