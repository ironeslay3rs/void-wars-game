"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import MissionResult from "@/components/missions/MissionResult";
import MissionTimer from "@/components/missions/MissionTimer";
import QuickDiscardResourceButtons from "@/components/inventory/QuickDiscardResourceButtons";
import ScreenHeader from "@/components/shared/ScreenHeader";
import ScreenDataManualSections from "@/components/shared/ScreenDataManualSections";
import ScreenDataStatStrip from "@/components/shared/ScreenDataStatStrip";
import RunInstabilityBar from "@/components/shared/RunInstabilityBar";
import SectionCard from "@/components/shared/SectionCard";
import MissionOriginBadge from "@/components/missions/MissionOriginBadge";
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
import {
  getDoctrineQueueGate,
} from "@/features/progression/launchDoctrine";
import {
  getCanonBookLockReason,
  isCanonBookMissionUnlocked,
} from "@/features/progression/canonBookGate";
import {
  checkCapacity,
  getOverflowPenalty,
  INVENTORY_CAPACITY_MAX,
} from "@/features/resources/inventoryLogic";
import WarFrontSnapshotCallout from "@/components/shared/WarFrontSnapshotCallout";
import { getDoctrinePressureStrip } from "@/features/world/missionDoctrineStrip";
import { getWarFrontSnapshot } from "@/features/world/warFrontSnapshot";
import { voidZoneById, type VoidZoneId } from "@/features/void-maps/zoneData";
import { CARGO_INFUSION_HEADING } from "@/features/status/voidInfusionMetaphor";
import {
  MISSIONS_PLAYBOOK_TITLE,
  getMissionConsequenceHint,
  getMissionsPlaybookCallout,
  getMissionsPlaybookLines,
} from "@/features/guidance/missionsPlaybookCopy";
import { getMissionQueueBlockHint } from "@/features/guidance/missionBlockReasonCopy";

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
  originTag?: import("@/features/game/gameTypes").MissionOriginTagId;
  resolvedAt: number;
};

type MissionBlockReason =
  | "path-locked"
  | "already-queued"
  | "queue-full"
  | "launch-lock"
  | "canon-locked"
  | null;

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

function formatCanonBookLabel(book: MissionDefinition["canonBook"]) {
  switch (book) {
    case "book-1":
      return "Book 1";
    case "book-2":
      return "Book 2";
    case "book-3":
      return "Book 3";
    case "book-4":
      return "Book 4";
    case "book-5":
      return "Book 5";
    case "book-6":
      return "Book 6";
    case "book-7":
      return "Book 7";
    case "system":
      return "System";
    default:
      return "Book 1";
  }
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
      originTag: mission.originTag,
      resolvedAt: Date.now(),
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
    originTag: completedMissions[0]?.originTag,
    resolvedAt: Date.now(),
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
  const doctrineQueueGate = getDoctrineQueueGate(state.player, now);
  const doctrineQueueCap = doctrineQueueGate.cap;
  const launchReadiness = doctrineQueueGate.readiness;

  const queuedMissionIds = new Set(missionQueue.map((entry) => entry.missionId));
  const isQueueFull = !doctrineQueueGate.canQueue && missionQueue.length >= doctrineQueueCap;
  const hasLaunchQueueLock =
    !doctrineQueueGate.canQueue &&
    missionQueue.length < doctrineQueueCap &&
    doctrineQueueGate.reason !== null;

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

  const huntingGroundMissions = state.missions.filter(
    (mission) => mission.category === "hunting-ground",
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
    if (!boardFeedback) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setBoardFeedback(null);
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [boardFeedback]);

  const carryCapacity = useMemo(
    () => checkCapacity(state.player.resources, INVENTORY_CAPACITY_MAX),
    [state.player.resources],
  );
  const carryOverloadPenalty = carryCapacity.isOverloaded
    ? getOverflowPenalty(carryCapacity)
    : null;
  const carryPct = Math.min(100, Math.max(0, carryCapacity.percent));
  const carryNearCap = !carryCapacity.isOverloaded && carryPct >= 85;
  const doctrineStrip = getDoctrinePressureStrip(state.player, now);
  const playbookCallout = getMissionsPlaybookCallout({
    queueLen: missionQueue.length,
    queueFull: isQueueFull,
    launchLocked: hasLaunchQueueLock,
    inProgress: inProgressEntries.length,
  });
  const missionConsequenceHint = getMissionConsequenceHint({
    condition: state.player.condition,
    hunger: state.player.hunger,
  });

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

        <ScreenDataStatStrip
          cards={missionsScreenData.cards}
          ariaLabel="Mission protocol snapshot"
        />

        <ScreenDataManualSections
          sections={missionsScreenData.sections}
          ariaLabel="Mission protocol field manual"
        />

        <RunInstabilityBar />

        <section
          className="rounded-2xl border border-cyan-400/22 bg-[linear-gradient(165deg,rgba(12,28,42,0.88),rgba(8,10,18,0.94))] px-4 py-4 text-[11px] leading-relaxed text-white/82 shadow-[0_12px_40px_rgba(0,0,0,0.28)] md:text-sm"
          aria-label={MISSIONS_PLAYBOOK_TITLE}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200/75">
            {MISSIONS_PLAYBOOK_TITLE}
          </div>
          <ol className="mt-3 list-decimal space-y-2.5 pl-4 marker:font-semibold marker:text-cyan-400/55">
            {getMissionsPlaybookLines().map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ol>
          <p className="mt-3 border-t border-cyan-400/18 pt-3 text-[11px] leading-snug text-white/72">
            <span className="font-bold uppercase tracking-[0.12em] text-cyan-200/70">
              Consequence ·{" "}
            </span>
            {missionConsequenceHint}
          </p>
          {playbookCallout ? (
            <p className="mt-3 border-t border-cyan-400/18 pt-3 text-[11px] font-semibold leading-snug text-amber-100/88">
              <span className="font-bold uppercase tracking-[0.12em] text-amber-200/75">
                Now ·{" "}
              </span>
              {playbookCallout}
            </p>
          ) : null}
        </section>

        <div className="rounded-2xl border border-rose-400/22 bg-rose-950/14 px-4 py-3 text-[11px] leading-relaxed text-white/80 md:text-sm">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
            {doctrineStrip.title}
          </div>
          <div className="mt-1 font-semibold text-rose-100/90">
            {doctrineStrip.contestedLine}
          </div>
          {doctrineStrip.stakesLine ? (
            <p className="mt-1 text-rose-50/82">{doctrineStrip.stakesLine}</p>
          ) : null}
          <p className="mt-1 text-white/60">{doctrineStrip.pressureLine}</p>
          {doctrineStrip.commodityLine ? (
            <p className="mt-1 text-amber-200/85">{doctrineStrip.commodityLine}</p>
          ) : null}
          {doctrineStrip.sectorWinnerLine ? (
            <div className="mt-2 rounded-xl border border-amber-300/25 bg-black/30 px-3 py-2">
              <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-amber-200/70">
                {doctrineStrip.sectorControlTitle}
              </div>
              <p className="mt-1 text-[11px] font-semibold text-amber-50/95">
                {doctrineStrip.sectorWinnerLine}
              </p>
              {doctrineStrip.warConsequenceLine ? (
                <p className="mt-1 text-[11px] leading-relaxed text-rose-100/82">
                  {doctrineStrip.warConsequenceLine}
                </p>
              ) : null}
              {doctrineStrip.warMechanicalLine ? (
                <p className="mt-1 text-[10px] leading-relaxed text-white/55">
                  {doctrineStrip.warMechanicalLine}
                </p>
              ) : null}
            </div>
          ) : null}
          {doctrineStrip.warFrontSnapshot ? (
            <WarFrontSnapshotCallout
              snapshot={doctrineStrip.warFrontSnapshot}
              showZoneTitle={false}
              className="mt-2 border-rose-400/20 bg-black/28"
            />
          ) : null}
        </div>

        {carryOverloadPenalty ? (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-[11px] leading-relaxed text-red-100/95 shadow-[0_8px_28px_rgba(0,0,0,0.25)] md:text-sm">
            <div className="font-bold uppercase tracking-[0.12em] text-red-200">
              {CARGO_INFUSION_HEADING} · hold over capacity
            </div>
            <div className="mt-1 text-red-100/90">
              Timers run ×{carryOverloadPenalty.missionSpeedPenalty.toFixed(1)}, field movement −
              {carryOverloadPenalty.movementPenaltyPct}%, mission pay −
              {carryOverloadPenalty.missionRewardPenaltyPct}%.
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-red-50/95 md:text-[11px]">
              <span className="rounded-md border border-red-200/35 bg-black/25 px-2 py-0.5">
                Time ×{carryOverloadPenalty.missionSpeedPenalty.toFixed(1)}
              </span>
              <span className="rounded-md border border-red-200/35 bg-black/25 px-2 py-0.5">
                Move −{carryOverloadPenalty.movementPenaltyPct}%
              </span>
              <span className="rounded-md border border-red-200/35 bg-black/25 px-2 py-0.5">
                Pay −{carryOverloadPenalty.missionRewardPenaltyPct}%
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/inventory"
                className="rounded-lg border border-red-300/40 bg-red-500/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-red-50 hover:border-red-200/60 md:text-[11px]"
              >
                Inventory
              </Link>
              <Link
                href="/bazaar/war-exchange"
                className="rounded-lg border border-red-200/45 bg-black/30 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-red-50 hover:border-red-100/70 md:text-[11px]"
              >
                Sell surplus
              </Link>
            </div>
            <QuickDiscardResourceButtons
              wrapClassName="mt-2 flex flex-wrap gap-2"
              buttonClassName="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/75 hover:border-white/30 hover:bg-white/10 md:text-xs"
            />
          </div>
        ) : carryNearCap ? (
          <div className="rounded-2xl border border-amber-400/28 bg-amber-500/10 px-4 py-3 text-[11px] leading-snug text-amber-100/90 md:flex md:flex-wrap md:items-center md:justify-between md:gap-3 md:text-sm">
            <span>
              Carry near cap ({carryCapacity.used}/{carryCapacity.max}). Sell or discard before
              you stack long operations.
            </span>
            <Link
              href="/bazaar/war-exchange"
              className="mt-2 inline-block shrink-0 font-bold uppercase tracking-widest text-amber-50 underline decoration-amber-400/50 underline-offset-2 hover:text-amber-100 md:mt-0"
            >
              War Exchange →
            </Link>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Available"
            value={`${availableMissions.length}`}
            hint="Missions currently accessible to your path."
          />
          <StatCard
            label="Queue"
            value={`${missionQueue.length}/${doctrineQueueCap}`}
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
              originTag={completionFeedback.originTag}
              resolvedAt={completionFeedback.resolvedAt}
            />
          </SectionCard>
        ) : null}

        {huntingGroundMissions.length > 0 && (
          <SectionCard
            title="Hunting Grounds"
            description="Deploy into creature-rich void zones for direct encounter rewards. These missions route to the interactive Hunt screen."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {huntingGroundMissions.map((mission) => {
                const resourceRewards = Object.entries(
                  mission.reward.resources ?? {},
                ).filter(([, v]) => typeof v === "number" && v !== 0);
                const isCanonUnlocked = isCanonBookMissionUnlocked(mission.canonBook);
                const deployId = mission.deployZoneId;
                const zoneSnap =
                  deployId && deployId in voidZoneById
                    ? getWarFrontSnapshot(
                        state.player,
                        deployId as VoidZoneId,
                      )
                    : null;
                return (
                  <div
                    key={mission.id}
                    className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-white">
                        {mission.title}
                      </h3>
                      {mission.originTag ? (
                        <MissionOriginBadge originTagId={mission.originTag} />
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-white/60">
                      {mission.rumorFlavor ?? mission.description}
                    </p>
                    {zoneSnap ? (
                      <WarFrontSnapshotCallout
                        snapshot={zoneSnap}
                        className="mt-2 border-emerald-400/20 bg-black/35"
                      />
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {resourceRewards.map(([k, v]) => (
                        <span
                          key={k}
                          className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] text-emerald-200"
                        >
                          +{v} {formatRewardLabel(k)}
                        </span>
                      ))}
                      {mission.reward.rankXp > 0 && (
                        <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10px] text-amber-200">
                          +{mission.reward.rankXp} XP
                        </span>
                      )}
                    </div>
                    {isCanonUnlocked ? (
                      <Link
                        href={`/hunt?missionId=${mission.id}&zone=${(mission as { deployZoneId?: string }).deployZoneId ?? "void"}&return=/missions`}
                        className="mt-4 flex h-10 w-full items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/15 text-xs font-black uppercase tracking-[0.14em] text-emerald-200 transition hover:bg-emerald-500/25"
                      >
                        Deploy Hunt
                      </Link>
                    ) : (
                      <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-100">
                        {getCanonBookLockReason(mission.canonBook)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

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
                  Queue cap reached ({missionQueue.length}/{doctrineQueueCap}).
                  Recover or finish an active operation before deploying another
                  one.
                </div>
              ) : null}
              {launchReadiness.status === "critical" ? (
                <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-100">
                  Launch doctrine is critical. Queue cap is temporarily reduced
                  until condition and stores stabilize.
                </div>
              ) : null}
              {hasLaunchQueueLock ? (
                <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-100">
                  {doctrineQueueGate.reason}
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
                const isCanonUnlocked = isCanonBookMissionUnlocked(mission.canonBook);
                const blockReason: MissionBlockReason = !isAccessible
                  ? "path-locked"
                  : !isCanonUnlocked
                    ? "canon-locked"
                  : isQueued
                    ? "already-queued"
                    : isQueueFull
                      ? "queue-full"
                      : hasLaunchQueueLock
                        ? "launch-lock"
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

                          <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-100">
                            {formatCanonBookLabel(mission.canonBook)}
                          </span>

                          {mission.originTag ? (
                            <MissionOriginBadge originTagId={mission.originTag} />
                          ) : null}

                          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
                            {formatDuration(mission.durationHours)}
                          </span>

                          {!isAccessible && (
                            <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-200">
                              Locked
                            </span>
                          )}

                          {isAccessible && !isCanonUnlocked && (
                            <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-100">
                              Future Book
                            </span>
                          )}

                          {isQueued && (
                            <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                              In Queue
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-white/65">
                          {mission.rumorFlavor ?? mission.description}
                        </p>

                        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/40">
                          {isCanonUnlocked
                            ? `${formatCanonBookLabel(mission.canonBook)} contract · ${getPathRequirementLabel(mission.path)}`
                            : getCanonBookLockReason(mission.canonBook)}
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

                            if (blockReason === "canon-locked") {
                              setBoardFeedback(getCanonBookLockReason(mission.canonBook));
                              return;
                            }

                            if (blockReason === "queue-full") {
                              setBoardFeedback(
                                `Queue cap reached (${missionQueue.length}/${doctrineQueueCap}). Recover or clear a slot to deploy another operation.`,
                              );
                              return;
                            }
                            if (blockReason === "launch-lock") {
                              setBoardFeedback(
                                doctrineQueueGate.reason ??
                                  "Launch doctrine lock is preventing queue extension.",
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
                              : hasLaunchQueueLock
                                ? "Stabilize First"
                                : !isAccessible
                                  ? "Locked"
                                  : !isCanonUnlocked
                                    ? "Future Book"
                                    : "Queue Mission"}
                        </button>
                        {blockReason !== null ? (
                          <p className="mt-2 text-[10px] leading-snug text-white/45">
                            {getMissionQueueBlockHint({
                              reason: blockReason,
                              missionTitle: mission.title,
                              pathLabel: formatPathLabel(mission.path),
                              canonLockDetail: getCanonBookLockReason(
                                mission.canonBook,
                              ),
                              queueLen: missionQueue.length,
                              queueCap: doctrineQueueCap,
                              launchLockDetail: doctrineQueueGate.reason,
                            })}
                          </p>
                        ) : null}
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
                      const qz = entry.mission.deployZoneId;
                      const queueSnap =
                        qz && qz in voidZoneById
                          ? getWarFrontSnapshot(state.player, qz as VoidZoneId)
                          : null;

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
                              {queueSnap ? (
                                <div className="mt-2">
                                  <WarFrontSnapshotCallout
                                    snapshot={queueSnap}
                                    className="border-amber-400/20 bg-black/30"
                                  />
                                </div>
                              ) : null}
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
