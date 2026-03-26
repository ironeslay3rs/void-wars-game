"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
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
  const { state } = useGame();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hintZone = searchParams.get("zone");

  const missionQueue = Array.isArray(state.player.missionQueue)
    ? state.player.missionQueue
    : [];
  const isQueueFull =
    missionQueue.length >= state.player.maxMissionQueueSlots;
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

  const defaultDeployMission = state.missions.find(
    (m) => m.id === DEFAULT_DEPLOY_HG_MISSION_ID,
  );

  function handleDeployThisZone() {
    if (!isUnlocked || !masteryGatesOk || isQueueFull || activeHunt) return;
    router.push(
      `/hunt?zone=${encodeURIComponent(selectedZoneId)}&missionId=${encodeURIComponent(
        DEFAULT_DEPLOY_HG_MISSION_ID,
      )}&return=${encodeURIComponent("/home")}`,
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
    !isUnlocked || !masteryGatesOk || isQueueFull || !!activeHunt;

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
  ) : isQueueFull ? (
    <>
      Mission queue full —{" "}
      <Link
        href="/bazaar/mercenary-guild"
        className="font-semibold text-amber-100 underline decoration-amber-400/40 underline-offset-2 hover:text-white"
      >
        open the contract board
      </Link>{" "}
      to clear a slot.
    </>
  ) : activeHunt ? (
    <span>Finish or open the active hunt before deploying again.</span>
  ) : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute left-0 right-0 top-0 z-40 flex justify-end px-3 py-3 md:px-5 md:py-4">
        <div className="rounded-2xl border border-white/10 bg-black/55 px-2 py-2 shadow-lg backdrop-blur-md">
          <BazaarSubpageNav accentClassName="hover:border-cyan-400/35" />
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
        contractTitle={
          defaultDeployMission?.title ?? "Hunting ground sortie"
        }
        queueLabel={`${missionQueue.length}/${state.player.maxMissionQueueSlots}`}
        deployDisabled={deployDisabled}
        deployHint={deployHint}
        onDeploy={handleDeployThisZone}
        playerName={state.player.playerName}
        characterPortraitId={state.player.characterPortraitId}
      />
    </main>
  );
}
