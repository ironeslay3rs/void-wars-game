"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MissionResult from "@/components/missions/MissionResult";
import MissionTimer from "@/components/missions/MissionTimer";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import { useGame } from "@/features/game/gameContext";
import { missionsScreenData } from "@/features/missions/missionsScreenData";
import type {
  MissionDefinition,
  MissionQueueEntry,
} from "@/features/game/gameTypes";
import { VOID_EXPEDITION_PATH } from "@/features/void-maps/voidRoutes";
import {
  onMissionComplete,
  queueMission,
} from "@/features/missions/missionRunner";

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

type MissionBlockReason = "path-locked" | "already-queued" | "queue-full" | null;

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

function formatPathLabel(path: "neutral" | "bio" | "mecha" | "pure") {
  switch (path) {
    case "bio":
      return "Bio";
    case "mecha":
      return "Mecha";
    case "pure":
      return "Pure";
    default:
      return "Neutral";
  }
}

function getPathBadgeClasses(path: "neutral" | "bio" | "mecha" | "pure") {
  switch (path) {
    case "bio":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "mecha":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
    case "pure":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    default:
      return "border-white/15 bg-white/5 text-white/70";
  }
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

function getPathRequirementLabel(path: "neutral" | "bio" | "mecha" | "pure") {
  if (path === "neutral") {
    return "Available to any operative";
  }

  return `Requires ${formatPathLabel(path)} alignment`;
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
  if (now < entry.startsAt) {
    return "queued";
  }

  return "active";
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
      title: "Mission Complete",
      detail: `${mission.title} resolved and rewards were added to your progression.`,
      rankXp,
      masteryProgress,
      influence,
      conditionDelta,
      resources,
    };
  }

  return {
    title: `${completedMissions.length} Operations Complete`,
    detail:
      "Multiple queued operations resolved together and their rewards were applied.",
    rankXp,
    masteryProgress,
    influence,
    conditionDelta,
    resources,
  };
}

function StatCard({
  label,
  value,
  hint,
  valueClassName = "text-white",
}: {
  label: string;
  value: string;
  hint: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-bold ${valueClassName}`}>{value}</div>
      <div className="mt-1 text-sm text-white/55">{hint}</div>
    </div>
  );
}

export default function MissionsScreen() {
  const { state, dispatch } = useGame();
  const [now, setNow] = useState(() => Date.now());
  const [completionFeedback, setCompletionFeedback] =
    useState<CompletionFeedback | null>(null);
  const [boardFeedback, setBoardFeedback] = useState<string | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const missionQueue = Array.isArray(state.player.missionQueue)
    ? state.player.missionQueue
    : [];

  const queuedMissionIds = new Set(missionQueue.map((entry) => entry.missionId));
  const isQueueFull = missionQueue.length >= state.player.maxMissionQueueSlots;

  const queuedEntries: QueuedMissionView[] = missionQueue.reduce<QueuedMissionView[]>(
    (acc, entry) => {
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

  const inProgressEntries = queuedEntries.filter(
    (entry) => now >= entry.startsAt && now < entry.endsAt,
  );

  const pendingEntries = queuedEntries.filter((entry) => now < entry.startsAt);

  const standardMissions = state.missions.filter(
    (mission) => mission.category !== "hunting-ground",
  );

  const availableMissions = standardMissions.filter((mission) => {
    if (mission.path === "neutral") return true;
    return state.player.factionAlignment === mission.path;
  });
  const previousQueuedEntriesRef = useRef<QueuedMissionView[]>(queuedEntries);

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

  useEffect(() => {
    if (!boardFeedback) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setBoardFeedback(null);
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [boardFeedback]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(70,90,120,0.18),_rgba(5,8,20,0.96)_55%)] px-4 py-6 text-white md:px-6 md:py-8 xl:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <ScreenHeader
          backHref="/home"
          backLabel="Back to Home"
          eyebrow={missionsScreenData.eyebrow}
          title={missionsScreenData.title}
          subtitle={missionsScreenData.subtitle}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Available"
            value={`${availableMissions.length}`}
            hint="Missions currently accessible to your path."
          />
          <StatCard
            label="Queue"
            value={`${missionQueue.length}/${state.player.maxMissionQueueSlots}`}
            hint="Operations currently running or waiting in line."
          />
          <StatCard
            label="In Progress"
            value={`${inProgressEntries.length}`}
            hint="Active missions auto-complete and auto-reward."
            valueClassName="text-emerald-300"
          />
          <StatCard
            label="Current Path"
            value={
              state.player.factionAlignment === "unbound"
                ? "Unbound"
                : formatPathLabel(state.player.factionAlignment)
            }
            hint="Path-specific missions unlock after affiliation."
          />
        </div>

        {completionFeedback ? (
          <SectionCard
            title={completionFeedback.title}
            description={completionFeedback.detail}
          >
            <MissionResult
              title={completionFeedback.title}
              detail={completionFeedback.detail}
              rankXp={completionFeedback.rankXp}
              masteryProgress={completionFeedback.masteryProgress}
              influence={completionFeedback.influence}
              conditionDelta={completionFeedback.conditionDelta}
              resources={completionFeedback.resources}
              formatRewardLabel={formatRewardLabel}
              onReturn={() => setCompletionFeedback(null)}
              returnLabel="Queue next"
            />
          </SectionCard>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
          <SectionCard
            title="Mission Board"
            description="Queue standard operations here. Hunting Ground contracts and Void Expedition deploys share this same timer stack."
          >
            <div className="mb-4 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/65">
                {state.player.factionAlignment === "unbound"
                  ? "You can deploy neutral operations right away. Bio, Mecha, and Pure missions stay locked until you align with a path."
                  : `${formatPathLabel(state.player.factionAlignment)}-aligned operations are ready. Neutral missions remain available to everyone.`}
              </div>

              {isQueueFull ? (
                <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100">
                  Mission queue is full. Remove or finish an active operation before deploying another one.
                </div>
              ) : null}

              {boardFeedback ? (
                <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                  {boardFeedback}
                </div>
              ) : null}

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/65">
                Live void field: pick realm on{" "}
                <Link
                  href={VOID_EXPEDITION_PATH}
                  className="font-semibold text-fuchsia-200/95 underline decoration-fuchsia-400/35 underline-offset-2 hover:text-white"
                >
                  Void Expedition
                </Link>
                — deploy still enqueues here.
              </div>
            </div>

            <div className="space-y-3">
              {standardMissions.map((mission) => {
                const isAccessible =
                  mission.path === "neutral" ||
                  state.player.factionAlignment === mission.path;

                const isQueued = queuedMissionIds.has(mission.id);
                const blockReason: MissionBlockReason = !isAccessible
                  ? "path-locked"
                  : isQueued
                    ? "already-queued"
                    : isQueueFull
                      ? "queue-full"
                      : null;

                const resourceRewards = Object.entries(
                  mission.reward.resources ?? {},
                ).filter(([, value]) => typeof value === "number" && value !== 0);

                return (
                  <div
                    key={mission.id}
                    className={[
                      "rounded-2xl border p-4 transition",
                      isAccessible
                        ? "border-white/10 bg-white/5"
                        : "border-white/10 bg-white/5 opacity-55",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-white md:text-lg">
                            {mission.title}
                          </h3>

                          <span
                            className={[
                              "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                              getPathBadgeClasses(mission.path),
                            ].join(" ")}
                          >
                            {formatPathLabel(mission.path)}
                          </span>

                          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
                            {formatDuration(mission.durationHours)}
                          </span>

                          {!isAccessible && (
                            <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-200">
                              Locked
                            </span>
                          )}

                          {isQueued && (
                            <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                              In Queue
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-white/65">
                          {mission.description}
                        </p>

                        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/40">
                          {getPathRequirementLabel(mission.path)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/85">
                            +{mission.reward.rankXp} XP
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/85">
                            +{mission.reward.masteryProgress} Mastery
                          </span>
                          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs text-red-200">
                            {mission.reward.conditionDelta > 0
                              ? `+${mission.reward.conditionDelta}`
                              : mission.reward.conditionDelta}{" "}
                            Condition
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/85">
                            +{mission.reward.influence ?? 0} Influence
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

                      <div className="w-full lg:w-[168px]">
                        <button
                          type="button"
                          onClick={() => {
                            if (blockReason === "path-locked") {
                              setBoardFeedback(
                                `${mission.title} is locked until you align with ${formatPathLabel(mission.path)}.`,
                              );
                              return;
                            }

                            if (blockReason === "already-queued") {
                              setBoardFeedback(
                                `${mission.title} is already in the live queue.`,
                              );
                              return;
                            }

                            if (blockReason === "queue-full") {
                              setBoardFeedback(
                                "Mission queue is full. Clear a slot to deploy another operation.",
                              );
                              return;
                            }

                            queueMission(dispatch, mission.id);
                            setBoardFeedback(
                              `${mission.title} entered the operations queue.`,
                            );
                          }}
                          disabled={blockReason !== null}
                          className={[
                            "w-full rounded-2xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition",
                            blockReason !== null
                              ? "cursor-not-allowed border-white/10 bg-white/5 text-white/35"
                              : "border-cyan-400/30 bg-cyan-500/10 text-cyan-100 hover:border-cyan-300/50 hover:bg-cyan-500/15",
                          ].join(" ")}
                        >
                          {isQueued
                            ? "Queued"
                            : isQueueFull
                              ? "Queue Full"
                              : !isAccessible
                                ? "Locked"
                                : "Queue Mission"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <div className="xl:sticky xl:top-6 xl:self-start">
            <div className="flex flex-col gap-6">
              <SectionCard
                title="Operations"
                description="Shared live queue for standard missions, Hunting Ground hunts, and Void Expedition sorties."
              >
                <div className="space-y-3">
                  {queuedEntries.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-white/50">
                      No missions queued yet. Queue one from the board to begin.
                    </div>
                  ) : (
                    queuedEntries.map((entry) => {
                      const status = getQueueStatus(entry, now);
                      const isActive = status === "active";

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
                                {now < entry.startsAt ? (
                                  getQueueStatusLabel(entry, now)
                                ) : (
                                  <>
                                    Ends in{" "}
                                    <MissionTimer
                                      startsAt={entry.startsAt}
                                      endsAt={entry.endsAt}
                                      onDone={() => {
                                        onMissionComplete(dispatch);
                                        setNow(Date.now());
                                      }}
                                    />
                                  </>
                                )}
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

                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                dispatch({
                                  type: "REMOVE_QUEUED_MISSION",
                                  payload: { queueId: entry.queueId },
                                })
                              }
                              className="w-full rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-100 transition hover:border-red-400/45 hover:bg-red-500/15"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </SectionCard>

              <SectionCard
                title="Progress Snapshot"
                description="Quick read on how the shared mission queue is feeding progression right now."
              >
                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Rank
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      {state.player.rank} - Level {state.player.rankLevel}
                    </div>
                    <div className="mt-1 text-sm text-white/55">
                      {state.player.rankXp}/{state.player.rankXpToNext} XP toward
                      next level.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Condition
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      {state.player.condition}/100
                    </div>
                    <div className="mt-1 text-sm text-white/55">
                      Timed operations convert pressure into progression.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Mastery & Influence
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      {state.player.masteryProgress} Mastery /{" "}
                      {state.player.influence} Influence
                    </div>
                    <div className="mt-1 text-sm text-white/55">
                      Completed missions now reward automatically when timers end.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-white/50">
                    Active queue: {inProgressEntries.length} / Pending:{" "}
                    {pendingEntries.length}
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
