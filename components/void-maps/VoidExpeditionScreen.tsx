"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VoidExpeditionHUD from "@/components/void-expedition/VoidExpeditionHUD";
import VoidExpeditionMap from "@/components/void-expedition/VoidExpeditionMap";
import { useGame } from "@/features/game/gameContext";
import {
  DEFAULT_HOME_DEPLOY_ZONE_ID,
  voidZones,
  voidZoneById,
  type VoidZoneId,
} from "@/features/void-maps/zoneData";
import { voidFieldSearch } from "@/features/void-maps/voidRoutes";
import {
  getZoneMasteryGateFailureLines,
  playerMeetsAllZoneMasteryGates,
} from "@/features/mastery/runeMasteryGates";
import {
  getCanonBookLockReason,
  isCanonBookMissionUnlocked,
} from "@/features/progression/canonBookGate";
import { getDoctrineQueueGate } from "@/features/progression/launchDoctrine";

const DEFAULT_DEPLOY_HG_MISSION_ID = "hg-rustfang-prowl";

function dropTypeDisplay(dropType: "bio" | "mecha" | "spirit"): string {
  if (dropType === "spirit") return "Pure residue";
  return dropType === "bio" ? "Bio" : "Mecha";
}

export default function VoidExpeditionScreen() {
  const searchParams = useSearchParams();
  const zoneKey = searchParams.get("zone") ?? "__default__";
  return <VoidExpeditionScreenInner key={zoneKey} />;
}

function VoidExpeditionScreenInner() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hintZone = searchParams.get("zone");
  const [now, setNow] = useState(() => Date.now());

  const missionQueue = Array.isArray(state.player.missionQueue)
    ? state.player.missionQueue
    : [];
  const doctrineQueueGate = getDoctrineQueueGate(state.player, now);
  const isQueueFull = missionQueue.length >= doctrineQueueGate.cap;
  const deployMission = state.missions.find(
    (mission) => mission.id === DEFAULT_DEPLOY_HG_MISSION_ID,
  );
  const isDeployMissionCanonUnlocked = isCanonBookMissionUnlocked(
    deployMission?.canonBook,
  );
  const canonLockReason = isDeployMissionCanonUnlocked
    ? null
    : getCanonBookLockReason(deployMission?.canonBook);
  const activeHunt =
    state.player.activeProcess?.kind === "hunt"
      ? state.player.activeProcess
      : null;

  const firstUnlocked =
    voidZones.find((z) => state.player.rankLevel >= z.threatLevel) ??
    voidZones[0];

  const initialPick: VoidZoneId =
    hintZone && Object.prototype.hasOwnProperty.call(voidZoneById, hintZone)
      ? (hintZone as VoidZoneId)
      : firstUnlocked?.id ?? DEFAULT_HOME_DEPLOY_ZONE_ID;

  const [selectedZoneId, setSelectedZoneId] =
    useState<VoidZoneId>(initialPick);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  const selected = voidZoneById[selectedZoneId];
  const playerCondition = state.player.condition;
  const isUnlocked = state.player.rankLevel >= selected.threatLevel;
  const masteryGatesOk = playerMeetsAllZoneMasteryGates(state.player, selected);
  const isRecommended = playerCondition >= selected.recommendedCondition;
  const mastery = state.player.zoneMastery[selectedZoneId] ?? 0;

  const nextLocked = useMemo(
    () =>
      voidZones
        .filter((z) => state.player.rankLevel < z.threatLevel)
        .sort((a, b) => a.threatLevel - b.threatLevel)[0],
    [state.player.rankLevel],
  );

  const nextLockLine = nextLocked
    ? `Next lock: ${nextLocked.label} at rank ${nextLocked.threatLevel}`
    : "All realms unlocked by rank.";

  function handleDeployThisZone() {
    if (
      !isUnlocked ||
      !masteryGatesOk ||
      !isDeployMissionCanonUnlocked ||
      !doctrineQueueGate.canQueue ||
      activeHunt
    ) {
      return;
    }

    const SESSION_BUCKET_MS = 2 * 60 * 1000;
    const sessionBucketId = Math.floor(Date.now() / SESSION_BUCKET_MS);
    const voidClientId =
      globalThis.crypto?.randomUUID?.() ?? `void-${Date.now()}`;

    dispatch({
      type: "SET_VOID_REALTIME_BINDING",
      payload: {
        zoneId: selectedZoneId,
        sessionBucketId,
        clientId: voidClientId,
      },
    });

    dispatch({
      type: "QUEUE_MISSION",
      payload: { missionId: DEFAULT_DEPLOY_HG_MISSION_ID },
    });

    router.push(
      voidFieldSearch({
        zoneId: selectedZoneId,
        sessionBucketId,
        deployIntro: true,
      }),
    );
  }

  function goToActiveField() {
    const b = state.player.voidRealtimeBinding;
    if (!b || !activeHunt) return;
    router.push(
      voidFieldSearch({ zoneId: b.zoneId, sessionBucketId: b.sessionBucketId }),
    );
  }

  const deployDisabled =
    !isUnlocked ||
    !masteryGatesOk ||
    !isDeployMissionCanonUnlocked ||
    !doctrineQueueGate.canQueue ||
    !!activeHunt;

  const deployLabel = !isUnlocked
    ? "Locked Zone"
    : !masteryGatesOk
      ? "Mastery Locked"
      : !isDeployMissionCanonUnlocked
        ? "Future Book"
        : !doctrineQueueGate.canQueue && isQueueFull
          ? "Queue Full"
          : !doctrineQueueGate.canQueue
            ? "Stabilize First"
            : activeHunt
              ? "Hunt Active"
              : `Deploy into ${selected.label}`;

  const masteryGateFailures = getZoneMasteryGateFailureLines(
    state.player,
    selected,
  );

  const deployHint = !isUnlocked ? (
    <span>Raise rank to unlock this realm.</span>
  ) : !masteryGatesOk && masteryGateFailures.length > 0 ? (
    <span>
      {masteryGateFailures.join(" ")} Open Career or Mastery to deepen runes,
      then return.
    </span>
  ) : !isDeployMissionCanonUnlocked && canonLockReason ? (
    <span>{canonLockReason}</span>
  ) : !doctrineQueueGate.canQueue && isQueueFull ? (
    <>
      Queue gate reached ({missionQueue.length}/{doctrineQueueGate.cap}) —{" "}
      <Link
        href="/market/mercenary-guild"
        className="font-semibold text-amber-100 underline decoration-amber-400/40 underline-offset-2 hover:text-white"
      >
        open the contract board
      </Link>{" "}
      to clear or resolve a contract.
    </>
  ) : !doctrineQueueGate.canQueue && doctrineQueueGate.reason ? (
    <span>{doctrineQueueGate.reason}</span>
  ) : activeHunt ? (
    <span>Finish or open the active hunt before deploying again.</span>
  ) : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute left-0 right-0 top-0 z-40 flex items-center justify-between px-3 py-3 md:px-5 md:py-4">
        <Link
          href="/home"
          className="rounded-lg border border-white/15 bg-black/55 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/80 hover:border-white/30 hover:text-white"
        >
          Back to Home
        </Link>
        <div className="rounded-lg border border-fuchsia-300/35 bg-fuchsia-500/12 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-fuchsia-100">
          Deploy Map
        </div>
      </div>

      {activeHunt ? (
        <div className="absolute left-3 right-3 top-[4.25rem] z-40 md:left-6 md:right-auto md:max-w-lg">
          <div className="rounded-xl border border-amber-300/35 bg-amber-950/80 px-4 py-3 shadow-lg backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-[0.22em] text-amber-100/80">
              Hunt in progress
            </div>
            <p className="mt-1 text-sm text-white/88">
              {activeHunt.title} — timer active. Return to the field before a
              new expedition deploy.
            </p>
            <button
              type="button"
              onClick={goToActiveField}
              className="mt-2 rounded-lg border border-amber-200/40 bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-50 hover:border-amber-100/55"
            >
              Open void field
            </button>
          </div>
        </div>
      ) : null}

      <VoidExpeditionMap
        selectedZoneId={selectedZoneId}
        rankLevel={state.player.rankLevel}
        onSelectZone={setSelectedZoneId}
      />

      <VoidExpeditionHUD
        selectedZone={selected}
        dropBiasLabel={dropTypeDisplay(selected.dropType)}
        isUnlocked={isUnlocked}
        isRecommended={isRecommended}
        mastery={mastery}
        nextLockLine={nextLockLine}
        deployDisabled={deployDisabled}
        deployLabel={deployLabel}
        deployHint={deployHint}
        onDeploy={handleDeployThisZone}
        playerName={state.player.playerName}
        characterPortraitId={state.player.characterPortraitId}
      />
    </main>
  );
}
