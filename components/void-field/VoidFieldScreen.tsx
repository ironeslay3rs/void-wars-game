"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import { useGame } from "@/features/game/gameContext";
import { getMissionById } from "@/features/game/gameMissionUtils";
import {
  DEFAULT_HOME_DEPLOY_ZONE_ID,
  voidZoneById,
  type VoidZoneId,
} from "@/features/void-maps/zoneData";
import { voidFieldMapSrcForZone } from "@/features/void-maps/voidFieldMapAssets";
import {
  isVoidFieldShellMobId,
  VOID_FIELD_SHELL_STRIKE_DAMAGE,
} from "@/features/void-maps/voidFieldShellMobs";
import { useVoidRealtimeSession } from "@/features/void-maps/realtime/VoidRealtimeBridge";
import { useVoidFieldCombatFeedback } from "@/features/void-maps/useVoidFieldCombatFeedback";
import { useVoidFieldLootDropSpawns } from "@/features/void-maps/useVoidFieldLootDropSpawns";
import { voidFieldContractPayoutPreview } from "@/features/void-maps/voidFieldContractPreview";
import { useVoidFieldShellMobPopulation } from "@/features/void-maps/useVoidFieldShellMobPopulation";
import { useVoidFieldControls } from "@/features/void-maps/useVoidFieldControls";
import { useRecoveryCooldown } from "@/features/status/useRecoveryCooldown";
import VoidFieldCanvas from "@/components/void-field/VoidFieldCanvas";
import VoidFieldCombatTicker from "@/components/void-field/VoidFieldCombatTicker";
import VoidFieldControls from "@/components/void-field/VoidFieldControls";
import VoidFieldDeployIntro from "@/components/void-field/VoidFieldDeployIntro";
import VoidFieldHud from "@/components/void-field/VoidFieldHud";
import { useVoidFieldLocalPlayer } from "@/components/void-field/useVoidFieldLocalPlayer";
import { getFeastHallOfferById } from "@/features/black-market/feastHallData";
import {
  getCareerFocusFieldLootAmountMultiplier,
  getCareerFocusShellDamageBonusPct,
} from "@/features/player/careerFocusModifiers";
import { getMasteryAlignedPickupYieldMultiplier } from "@/features/mastery/masteryGameplayEffects";
import {
  getSchoolCombatPassives,
  getVisibleStrikeSchool,
} from "@/features/combat/fieldCombatIdentity";
import { FIELD_LOADOUT_PROFILES } from "@/features/combat/fieldLoadout";

export default function VoidFieldScreen() {
  const { state, dispatch } = useGame();
  const searchParams = useSearchParams();
  const zoneQuery = searchParams.get("zone");
  const bucketQuery = searchParams.get("bucket");
  const deployIntroFlag = searchParams.get("deployIntro");
  const initialZoneId: VoidZoneId =
    zoneQuery && Object.prototype.hasOwnProperty.call(voidZoneById, zoneQuery)
      ? (zoneQuery as VoidZoneId)
      : DEFAULT_HOME_DEPLOY_ZONE_ID;
  const sessionBucketId =
    bucketQuery && Number.isFinite(Number(bucketQuery))
      ? Number(bucketQuery)
      : 0;

  const [showDeployIntro, setShowDeployIntro] = useState(
    deployIntroFlag === "1",
  );

  useEffect(() => {
    if (deployIntroFlag !== "1") return;
    const t = window.setTimeout(() => setShowDeployIntro(false), 5200);
    return () => window.clearTimeout(t);
  }, [deployIntroFlag]);

  const allocatedZone = voidZoneById[initialZoneId];
  const zone = allocatedZone;
  const fieldMapSrc = voidFieldMapSrcForZone(allocatedZone.id);

  const activeHuntProcess =
    state.player.activeProcess?.kind === "hunt"
      ? state.player.activeProcess
      : null;
  const [nowMs, setNowMs] = useState(() => state.player.lastConditionTickAt);
  useEffect(() => {
    const interval = window.setInterval(() => setNowMs(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, []);
  const huntFromQueue = (() => {
    const missionQueue = Array.isArray(state.player.missionQueue)
      ? state.player.missionQueue
      : [];
    const matchingEntry = missionQueue.find((entry) => {
      const mission = getMissionById(state.missions, entry.missionId);
      if (!mission) return false;
      if (mission.category !== "hunting-ground") return false;
      if (mission.deployZoneId && mission.deployZoneId !== allocatedZone.id)
        return false;
      return true;
    });

    if (!matchingEntry) return null;

    if (nowMs >= matchingEntry.endsAt) return "complete" as const;
    if (nowMs >= matchingEntry.startsAt) return "running" as const;
    // Pre-start: keep the field locked (prevents attacks before WS spawn loop).
    return null;
  })();

  const huntStatus =
    activeHuntProcess?.status ?? huntFromQueue ?? (activeHuntProcess ? "complete" : null);
  const isHuntRunning = huntStatus === "running";

  const realtime = useVoidRealtimeSession();
  const { connected: realtimeConnected, sendMove } = realtime;

  const selfPositionPctRef = useRef({ x: 50, y: 82 });
  const lootPlayerPctRef = useRef({ x: 50, y: 82 });
  const [targetedMobEntityId, setTargetedMobEntityId] = useState<string | null>(
    null,
  );
  const targetedMobEntityIdRef = useRef<string | null>(null);

  /** User intent; ticking while hunt+WS **or** shell-only field (local practice). */
  const [autoStrikeEngaged, setAutoStrikeEngaged] = useState(false);
  const shellPracticeField = realtime.mobs.length === 0;
  const autoStrikeActive =
    autoStrikeEngaged &&
    ((realtimeConnected && isHuntRunning) || shellPracticeField);

  const fieldLootAmountMultiplier = useMemo(() => {
    const career = getCareerFocusFieldLootAmountMultiplier(
      state.player.careerFocus,
    );
    const masteryAligned = getMasteryAlignedPickupYieldMultiplier(
      state.player.runeMastery,
      zone.lootTheme,
    );
    return career * masteryAligned;
  }, [state.player.careerFocus, state.player.runeMastery, zone.lootTheme]);

  const { mobsForField, applyShellMobDamage, bossChip } =
    useVoidFieldShellMobPopulation(allocatedZone.id, realtime.mobs, state.player);

  const combatHudLine = useMemo(() => {
    const loadout =
      FIELD_LOADOUT_PROFILES.find(
        (x) => x.id === state.player.fieldLoadoutProfile,
      )?.label ?? "Assault rig";
    const school = getVisibleStrikeSchool(state.player);
    const s =
      school === "neutral" ? "NEUTRAL" : school.toUpperCase();
    const passives = getSchoolCombatPassives(state.player);
    const on = passives.filter((x) => x.active).length;
    return `${loadout} · ${s} · passives ${on}/${passives.length}`;
  }, [state.player]);

  const encounterBrief = useMemo(() => {
    if (allocatedZone.id !== "howling-scar") return null;
    return "Hollowfang apex · shell drill + wave 5 scout (WS)";
  }, [allocatedZone.id]);

  const effectiveTargetedMobEntityId = useMemo(() => {
    if (!targetedMobEntityId) return null;
    const m = mobsForField.find((x) => x.mobEntityId === targetedMobEntityId);
    if (!m || m.hp <= 0) return null;
    return targetedMobEntityId;
  }, [targetedMobEntityId, mobsForField]);

  useLayoutEffect(() => {
    targetedMobEntityIdRef.current = effectiveTargetedMobEntityId;
  }, [effectiveTargetedMobEntityId]);

  const serverSyncMove = useCallback(
    (xPct: number, yPct: number) => {
      if (realtimeConnected && isHuntRunning) {
        sendMove(xPct, yPct);
      }
    },
    [realtimeConnected, isHuntRunning, sendMove],
  );

  const { positionNorm, onFieldPointerDown, setMoveTargetPct } =
    useVoidFieldLocalPlayer({
    movementEnabled: true,
    serverSyncEnabled: realtimeConnected && isHuntRunning,
    selfPositionPctRef,
    syncMove: serverSyncMove,
  });

  useEffect(() => {
    lootPlayerPctRef.current = {
      x: positionNorm.x * 100,
      y: positionNorm.y * 100,
    };
  }, [positionNorm]);

  const { drops: lootDrops, removeDrop } = useVoidFieldLootDropSpawns(
    mobsForField,
    allocatedZone.id,
    fieldLootAmountMultiplier,
  );
  const [lootCollectPulse, setLootCollectPulse] = useState(0);

  const onLootConsumed = useCallback(
    (id: string) => {
      const d = lootDrops.find((x) => x.id === id) ?? null;
      removeDrop(id);
      setLootCollectPulse((p) => p + 1);
      if (d) {
        dispatch({
          type: "ADD_FIELD_LOOT",
          payload: { key: d.resource, amount: d.amount },
        });
      }
    },
    [dispatch, lootDrops, removeDrop],
  );

  const stimFloatMultiplier =
    state.player.nextRunModifiers?.effectKey === "EMBER_STIM"
      ? 1 +
        (state.player.nextRunModifiers.applyInField?.floatDamageBoostPct ?? 0) /
          100
      : 1;
  const { slashes, floats, hitPulses, registerSlashForMob, pushLocalDamageFloat } =
    useVoidFieldCombatFeedback({
      selfClientId: realtime.selfClientId,
      recentCombatEvents: realtime.recentCombatEvents,
      mobs: mobsForField,
      selfDamageFloatMultiplier: stimFloatMultiplier,
    });

  const [hitPulseNowMs, setHitPulseNowMs] = useState(() => Date.now());
  useEffect(() => {
    if (hitPulses.length === 0) return;
    const id = window.setInterval(() => {
      setHitPulseNowMs(Date.now());
    }, 50);
    return () => window.clearInterval(id);
  }, [hitPulses]);

  const mobHitUntilById = useMemo(() => {
    const out: Record<string, number> = {};
    for (const p of hitPulses) {
      if (p.until <= hitPulseNowMs) continue;
      out[p.mobEntityId] = Math.max(out[p.mobEntityId] ?? 0, p.until);
    }
    return out;
  }, [hitPulses, hitPulseNowMs]);

  const applyShellStrike = useCallback(
    (mobEntityId: string) => {
      if (!isVoidFieldShellMobId(mobEntityId)) return;
      // Give shell drills the same "hit impact" weight as melee: slash + float.
      const stimBoostPct =
        state.player.nextRunModifiers?.effectKey === "EMBER_STIM"
          ? state.player.nextRunModifiers.applyInField?.shellDamageBoostPct ?? 0
          : 0;
      const careerBoostPct = getCareerFocusShellDamageBonusPct(
        state.player.careerFocus,
      );
      const boostPct = stimBoostPct + careerBoostPct;
      const dmg = Math.round(
        VOID_FIELD_SHELL_STRIKE_DAMAGE * (1 + boostPct / 100),
      );
      registerSlashForMob(mobEntityId);
      const dealt = applyShellMobDamage(mobEntityId, dmg);
      if (dealt > 0) {
        pushLocalDamageFloat(mobEntityId, dealt);
      }
    },
    [
      applyShellMobDamage,
      pushLocalDamageFloat,
      registerSlashForMob,
      state.player,
    ],
  );

  useEffect(() => {
    if (!activeHuntProcess || activeHuntProcess.kind !== "hunt") {
      return;
    }
    const b = state.player.voidRealtimeBinding;
    if (
      b &&
      b.zoneId === initialZoneId &&
      b.sessionBucketId === sessionBucketId
    ) {
      return;
    }
    dispatch({
      type: "SET_VOID_REALTIME_BINDING",
      payload: {
        zoneId: initialZoneId,
        sessionBucketId,
        clientId: globalThis.crypto?.randomUUID?.() ?? `void-${Date.now()}`,
      },
    });
  }, [
    activeHuntProcess,
    dispatch,
    initialZoneId,
    sessionBucketId,
    state.player.voidRealtimeBinding,
  ]);

  const { performNearestStrike, tryDirectMobAttack } = useVoidFieldControls({
    multiplayerEnabled: true,
    connected: realtimeConnected,
    isRunning: isHuntRunning,
    fieldMobs: mobsForField,
    selfPositionPctRef,
    sendAttack: realtime.sendAttack,
    setMoveTargetPct,
    onAttackCommitted: registerSlashForMob,
    onShellStrike: applyShellStrike,
    targetedMobEntityIdRef,
    autoStrikeEnabled: autoStrikeActive,
  });

  const onFieldPointerDownWrapped = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      setTargetedMobEntityId(null);
      onFieldPointerDown(e);
    },
    [onFieldPointerDown],
  );

  const stateLine = useMemo(() => {
    if (huntStatus === "running") {
      return "Hunt active";
    }
    if (huntStatus === "complete") {
      return "Run complete";
    }
    return "No hunt timer";
  }, [huntStatus]);

  const spawnWavesLine = huntStatus === "running" ? "RUNNING" : "PAUSED";

  const playerNameById = useMemo(
    () => new Map(realtime.players.map((p) => [p.clientId, p.playerName])),
    [realtime.players],
  );
  const mobLabelById = useMemo(
    () => new Map(realtime.mobs.map((m) => [m.mobEntityId, m.mobLabel])),
    [realtime.mobs],
  );

  const contractPayoutPreview = voidFieldContractPayoutPreview(state);

  const {
    isRecoveryOnCooldown,
    recoveryCooldownRemainingSeconds,
  } = useRecoveryCooldown(state.player.conditionRecoveryAvailableAt);
  const feastHallOffer = state.player.activeFeastHallOfferId
    ? getFeastHallOfferById(state.player.activeFeastHallOfferId)
    : null;
  const feastHallLockoutChip =
    isRecoveryOnCooldown && feastHallOffer
      ? `Feast Hall: ${feastHallOffer.label} · ${feastHallOffer.nextRunEffect} (${recoveryCooldownRemainingSeconds}s)`
      : null;
  const activeModifierChip =
    state.player.nextRunModifiers && huntStatus === "running"
      ? `${state.player.nextRunModifiers.effectKey}: ${state.player.nextRunModifiers.nextRunEffect}`
      : state.player.nextRunModifiers
        ? `Primed: ${state.player.nextRunModifiers.effectKey}`
        : null;

  return (
    <main className="fixed inset-0 overflow-hidden bg-black text-white">
      {showDeployIntro ? <VoidFieldDeployIntro /> : null}

      <div className="absolute inset-0">
        <VoidFieldCanvas
          zoneId={allocatedZone.id}
          fieldMapSrc={fieldMapSrc}
          backdropFallbackClassName={zone.backdropClassName}
          threatBand={zone.threatBand}
          huntStatus={huntStatus}
          multiplayerEnabled
          isRunning={isHuntRunning}
          fieldMobs={mobsForField}
          realtimePlayers={realtime.players}
          selfClientId={realtime.selfClientId}
          localPlayerNorm={positionNorm}
          fieldPointerActive
          onFieldPointerDown={onFieldPointerDownWrapped}
          selfFactionAlignment={state.player.factionAlignment}
          combatSlashes={slashes}
          combatFloats={floats}
          mobHitUntilById={mobHitUntilById}
          tryDirectMobAttack={tryDirectMobAttack}
          targetedMobEntityId={effectiveTargetedMobEntityId}
          onMobTarget={setTargetedMobEntityId}
          lootDrops={lootDrops}
          lootPlayerPctRef={lootPlayerPctRef}
          onLootConsumed={onLootConsumed}
          lootCollectPulse={lootCollectPulse}
        />
      </div>

      <VoidFieldHud
        className="absolute left-0 right-0 top-0"
        zoneLabel={zone.label}
        threatBand={zone.threatBand}
        threatLevel={zone.threatLevel}
        huntStateLine={stateLine}
        spawnWavesLine={spawnWavesLine}
        playerCount={realtime.players.length}
        connected={realtime.connected}
        contractPayoutPreview={contractPayoutPreview}
        showTimerHandoff={huntStatus !== null}
        runComplete={huntStatus === "complete"}
        feastHallLockoutChip={feastHallLockoutChip}
        nextRunChip={activeModifierChip}
        bossChip={bossChip}
        combatHudLine={combatHudLine}
        encounterBrief={encounterBrief}
      />

      <VoidFieldCombatTicker
        events={realtime.recentCombatEvents}
        selfClientId={realtime.selfClientId}
        playerNameById={playerNameById}
        mobLabelById={mobLabelById}
      />

      <div className="absolute bottom-0 left-0 right-0 z-50">
        <VoidFieldControls
          connected={realtime.connected}
          isRunning={isHuntRunning}
          shellPracticeActive={shellPracticeField}
          onAttack={performNearestStrike}
          autoStrikeEngaged={autoStrikeEngaged}
          autoStrikeActive={autoStrikeActive}
          onAutoStrikeToggle={() => setAutoStrikeEngaged((v) => !v)}
        />
      </div>
    </main>
  );
}
