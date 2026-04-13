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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useGame } from "@/features/game/gameContext";
import type { ResourceKey, VoidFieldExtractionLedgerResult } from "@/features/game/gameTypes";
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
import { formatRunStyleLabel } from "@/features/game/runArchetypeLogic";
import {
  formatRunInstabilityChip,
  runInstabilityShellDamageMultiplier,
} from "@/features/progression/runInstability";
import { useVoidRealtimeSession } from "@/features/void-maps/realtime/VoidRealtimeBridge";
import { useVoidFieldCombatFeedback } from "@/features/void-maps/useVoidFieldCombatFeedback";
import { useVoidFieldLootDropSpawns } from "@/features/void-maps/useVoidFieldLootDropSpawns";
import {
  createVoidFieldLootDropVfx,
  type VoidFieldLootDropVfx,
} from "@/features/void-maps/voidFieldLootDrops";
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
import BossSpawnBanner from "@/components/void-field/BossSpawnBanner";
import KillFeed, { type KillFeedEntry } from "@/components/void-field/KillFeed";
import ExtractionSummary from "@/components/field/ExtractionSummary";
import { voidInfusionHudLine } from "@/features/status/voidInfusionMetaphor";
import { getAscensionTensionChipLine } from "@/features/progression/ascensionStep";
import {
  playSound,
  startAmbient,
  stopAmbient,
  ZONE_AMBIENT_FREQ,
} from "@/features/audio/soundEngine";
import DeathOverlay from "@/components/void-field/DeathOverlay";
import VirtualJoystick from "@/components/void-field/VirtualJoystick";
import { getManaDisplay } from "@/features/mana/manaSelectors";
import {
  SHELL_ABILITIES,
  pruneExpiredShellBuffs,
  type ShellAbilityId,
} from "@/features/combat/shellAbilities";
import type { AbilitySlot } from "@/components/void-field/VoidFieldControls";
import { getActivePrepSurface } from "@/features/crafting/prepRunHooks";
import { getFeastHallOfferById } from "@/features/black-market/feastHallData";
import {
  getCareerFocusFieldLootAmountMultiplier,
  getCareerFocusShellDamageBonusPct,
} from "@/features/player/careerFocusModifiers";
import {
  getConvergencePrimedFieldLootMultiplier,
  getPathAlignedFieldLootMultiplier,
} from "@/features/economy/pathGatheringYield";
import { getMasteryAlignedPickupYieldMultiplier } from "@/features/mastery/masteryGameplayEffects";
import {
  getSchoolCombatPassives,
  getVisibleStrikeSchool,
} from "@/features/combat/fieldCombatIdentity";
import { FIELD_LOADOUT_PROFILES } from "@/features/combat/fieldLoadout";
import {
  getPlayerLoadoutCombatModifiers,
  getPlayerStrikeRangePct,
} from "@/features/combat/loadoutCombatStats";

export default function VoidFieldScreen() {
  const { state, dispatch } = useGame();
  const router = useRouter();
  const pathname = usePathname();
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

  useEffect(() => {
    if (deployIntroFlag !== "1") return;
    const q = new URLSearchParams(searchParams.toString());
    q.delete("deployIntro");
    const next = q.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [deployIntroFlag, pathname, router, searchParams]);

  const allocatedZone = voidZoneById[initialZoneId];
  const zone = allocatedZone;

  // Ambient zone drone — starts on field mount, stops on unmount.
  useEffect(() => {
    const freq = ZONE_AMBIENT_FREQ[initialZoneId] ?? 50;
    startAmbient(freq);
    return () => stopAmbient();
  }, [initialZoneId]);
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
    const pathAligned = getPathAlignedFieldLootMultiplier(
      state.player.factionAlignment,
      zone.lootTheme,
    );
    const convergence = getConvergencePrimedFieldLootMultiplier(
      state.player.mythicAscension.convergencePrimed,
    );
    return career * masteryAligned * pathAligned * convergence;
  }, [
    state.player.careerFocus,
    state.player.factionAlignment,
    state.player.runeMastery,
    state.player.mythicAscension.convergencePrimed,
    zone.lootTheme,
  ]);

  const { mobsForField, applyShellMobDamage, bossChip } =
    useVoidFieldShellMobPopulation(
      allocatedZone.id,
      realtime.mobs,
      state.player,
      selfPositionPctRef,
    );

  const wsRealtimeMobIds = useMemo(
    () => new Set(realtime.mobs.map((m) => m.mobEntityId)),
    [realtime.mobs],
  );
  const skipClientRollForMobEntityId = useCallback(
    (mobEntityId: string) =>
      realtimeConnected && isHuntRunning && wsRealtimeMobIds.has(mobEntityId),
    [realtimeConnected, isHuntRunning, wsRealtimeMobIds],
  );

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
    const combat = getPlayerLoadoutCombatModifiers(state.player);
    return `${loadout} · ${s} · ${combat.weaponFamily.toUpperCase()} ${combat.strikeRangePct}% · passives ${on}/${passives.length}`;
  }, [state.player]);

  const ascensionTensionChip = useMemo(
    () => getAscensionTensionChipLine(state),
    [state],
  );

  const strikeRangePct = useMemo(
    () => getPlayerStrikeRangePct(state.player),
    [state.player],
  );

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

  const { drops: clientLootDrops, removeDrop } = useVoidFieldLootDropSpawns(
    mobsForField,
    allocatedZone.id,
    fieldLootAmountMultiplier,
    { skipClientRollForMobEntityId },
  );
  const [serverLootDrops, setServerLootDrops] = useState<VoidFieldLootDropVfx[]>(
    [],
  );

  useEffect(() => {
    queueMicrotask(() => {
      setServerLootDrops([]);
    });
  }, [initialZoneId, sessionBucketId]);

  useEffect(() => {
    const batch = realtime.drainAuthoritativeMobLootEvents();
    if (batch.length === 0) return;
    const additions: VoidFieldLootDropVfx[] = [];
    const tick = Date.now();
    for (const ev of batch) {
      ev.lines.forEach((line, idx) => {
        const amt = Math.max(
          1,
          Math.round(line.amount * fieldLootAmountMultiplier),
        );
        additions.push(
          createVoidFieldLootDropVfx(
            ev.x,
            ev.y,
            line.resource,
            amt,
            `srv-${ev.mobEntityId}-${idx}-${tick}`,
          ),
        );
      });
    }
    queueMicrotask(() => {
      setServerLootDrops((d) => [...additions, ...d].slice(0, 15));
    });
    /* `realtime` identity churns; loot advances on authoritativeMobLootSeq + stable drain. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    realtime.authoritativeMobLootSeq,
    fieldLootAmountMultiplier,
    realtime.drainAuthoritativeMobLootEvents,
  ]);

  const lootDrops = useMemo(
    () => [...serverLootDrops, ...clientLootDrops],
    [serverLootDrops, clientLootDrops],
  );

  const removeServerLootDrop = useCallback((id: string) => {
    setServerLootDrops((d) => d.filter((x) => x.id !== id));
  }, []);

  const [lootCollectPulse, setLootCollectPulse] = useState(0);
  const [sessionLoot, setSessionLoot] = useState<
    Partial<Record<ResourceKey, number>>
  >({});
  const [sessionKills, setSessionKills] = useState(0);
  const [extractionSummary, setExtractionSummary] =
    useState<VoidFieldExtractionLedgerResult | null>(null);
  const extractionAppliedRef = useRef(false);
  const extractionLedgerShownRef = useRef<number | null>(null);
  const seenDeadMobIdsRef = useRef<Set<string>>(new Set());

  // Kill feed + screen shake + boss banner state.
  const [killFeedEntries, setKillFeedEntries] = useState<KillFeedEntry[]>([]);
  const [screenShakeKey, setScreenShakeKey] = useState(0);
  const mainRef = useRef<HTMLElement>(null);

  const pushKillFeed = useCallback((text: string) => {
    setKillFeedEntries((prev) => [
      ...prev,
      { id: `kf-${Date.now()}-${Math.random()}`, text, at: Date.now() },
    ]);
  }, []);

  const triggerScreenShake = useCallback(() => {
    setScreenShakeKey((k) => k + 1);
    const el = mainRef.current;
    if (el) {
      el.classList.remove("void-field-screen-shake");
      // Force reflow so the animation restarts.
      void el.offsetWidth;
      el.classList.add("void-field-screen-shake");
    }
  }, []);

  const onLootConsumed = useCallback(
    (id: string) => {
      const d = lootDrops.find((x) => x.id === id) ?? null;
      if (id.startsWith("srv-")) {
        removeServerLootDrop(id);
      } else {
        removeDrop(id);
      }
      setLootCollectPulse((p) => p + 1);
      if (d) {
        dispatch({
          type: "VOID_FIELD_ORB_COLLECTED",
          payload: { key: d.resource, amount: d.amount },
        });
        setSessionLoot((prev) => ({
          ...prev,
          [d.resource]: (prev[d.resource] ?? 0) + d.amount,
        }));
      }
    },
    [lootDrops, removeDrop, removeServerLootDrop, dispatch],
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
      const loadoutMult = getPlayerLoadoutCombatModifiers(state.player).attackMultiplier;
      const heatMult = runInstabilityShellDamageMultiplier(
        state.player.runInstability,
      );
      const dmg = Math.round(
        VOID_FIELD_SHELL_STRIKE_DAMAGE *
          (1 + boostPct / 100) *
          loadoutMult *
          heatMult,
      );
      registerSlashForMob(mobEntityId);
      const dealt = applyShellMobDamage(mobEntityId, dmg);
      if (dealt > 0) {
        pushLocalDamageFloat(mobEntityId, dealt);
        // Sound + screen shake on heavy hits (40+ damage).
        if (dealt >= 40) {
          triggerScreenShake();
          playSound("hit-heavy");
        } else {
          playSound("hit");
        }
      }
    },
    [
      applyShellMobDamage,
      pushLocalDamageFloat,
      triggerScreenShake,
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

  // Ability hotkey callback — maps index 0/1 to surge/wolf-leap.
  const abilityHotkeyIds: ShellAbilityId[] = ["surge", "wolf-leap"];
  const onActivateAbilityByIndex = useCallback(
    (index: number) => {
      const id = abilityHotkeyIds[index];
      if (!id) return;
      playSound("ability-activate");
      dispatch({
        type: "ACTIVATE_SHELL_ABILITY",
        payload: { abilityId: id },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch],
  );

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
    strikeRangePct,
    onActivateAbilityByIndex,
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
  const prepSurface = getActivePrepSurface(state.player);
  const activeModifierChip =
    prepSurface.state === "primed"
      ? huntStatus === "running"
        ? `${prepSurface.headline} — ${prepSurface.detail}`
        : `${prepSurface.headline} · arms when hunt timer starts`
      : `${prepSurface.headline} · ${prepSurface.detail}`;

  useEffect(() => {
    let added = 0;
    for (const mob of mobsForField) {
      if (mob.hp > 0) continue;
      if (seenDeadMobIdsRef.current.has(mob.mobEntityId)) continue;
      seenDeadMobIdsRef.current.add(mob.mobEntityId);
      added += 1;
      // Kill feed entry + sound for each downed mob.
      pushKillFeed(`Defeated ${mob.mobLabel}`);
      playSound("kill");
      // Screen shake + boss sound on boss kill.
      if (mob.isBoss) {
        triggerScreenShake();
        pushKillFeed(`BOSS DOWN — ${mob.mobLabel}!`);
      }
    }
    if (added > 0) {
      queueMicrotask(() => {
        setSessionKills((prev) => prev + added);
      });
    }
  }, [mobsForField, pushKillFeed, triggerScreenShake]);

  const extractionXNorm = zone.extractionPositionPct.x / 100;
  const extractionYNorm = zone.extractionPositionPct.y / 100;
  const extractionDist = Math.hypot(
    positionNorm.x - extractionXNorm,
    positionNorm.y - extractionYNorm,
  );
  const inExtractionZone = extractionDist <= 0.055;

  useEffect(() => {
    if (!inExtractionZone) return;
    if (extractionAppliedRef.current) return;
    extractionAppliedRef.current = true;
    dispatch({
      type: "COMMIT_VOID_FIELD_EXTRACTION",
      payload: {
        kills: sessionKills,
        zoneName: zone.label,
        zoneId: zone.id,
      },
    });
  }, [dispatch, inExtractionZone, sessionKills, zone.label, zone.id]);

  useEffect(() => {
    const L = state.player.lastVoidFieldExtractionLedger;
    if (!L) return;
    if (L.zoneName !== zone.label) return;
    if (extractionLedgerShownRef.current === L.resolvedAt) return;
    extractionLedgerShownRef.current = L.resolvedAt;
    setExtractionSummary(L);
  }, [state.player.lastVoidFieldExtractionLedger, zone.label]);

  // ──── Ability slots for the control bar ────
  const manaDisplay = getManaDisplay(state.player.factionAlignment);

  const abilitySlots: AbilitySlot[] = useMemo(() => {
    const now = Date.now();
    const buffs = pruneExpiredShellBuffs(
      state.player.activeShellBuffs ?? [],
      now,
    );
    return (["surge", "wolf-leap"] as ShellAbilityId[]).map((id) => {
      const def = SHELL_ABILITIES[id];
      const activeBuff = buffs.find((b) => b.abilityId === id);
      const cooldownSecondsLeft = activeBuff
        ? Math.max(0, Math.ceil((activeBuff.expiresAt - now) / 1000))
        : null;
      const canActivate =
        state.player.mana >= def.manaCost && cooldownSecondsLeft === null;
      return {
        id,
        name: def.name,
        manaCost: def.manaCost,
        canActivate,
        cooldownSecondsLeft,
        tooltip: canActivate
          ? `${def.name}: ${def.description}`
          : cooldownSecondsLeft !== null
            ? `${def.name}: active for ${cooldownSecondsLeft}s`
            : `Need ${def.manaCost} ${manaDisplay.shortName}`,
        accentClass:
          id === "surge"
            ? "border-orange-400/50 bg-orange-500/20 text-orange-50 hover:bg-orange-500/30"
            : "border-red-400/50 bg-red-500/20 text-red-50 hover:bg-red-500/30",
        disabledClass:
          "cursor-not-allowed border-white/10 bg-black/30 text-white/30",
      };
    });
  }, [state.player.mana, state.player.activeShellBuffs, manaDisplay.shortName]);

  const handleActivateAbility = useCallback(
    (abilityId: string) => {
      playSound("ability-activate");
      dispatch({
        type: "ACTIVATE_SHELL_ABILITY",
        payload: {
          abilityId: abilityId as ShellAbilityId,
        },
      });
    },
    [dispatch],
  );

  return (
    <main
      ref={mainRef}
      className="fixed inset-0 overflow-hidden bg-black text-white void-field-deploy-fadein"
    >
      {showDeployIntro ? <VoidFieldDeployIntro /> : null}
      {state.player.condition <= 0 ? (
        <DeathOverlay playerName={state.player.playerName} />
      ) : null}
      <BossSpawnBanner bossLabel={bossChip === "Boss roaming" ? "Boss Roaming" : null} />
      <KillFeed entries={killFeedEntries} />
      {/* Mobile virtual joystick — only mounts on touch devices */}
      {"ontouchstart" in (typeof window !== "undefined" ? window : {}) ? (
        <VirtualJoystick
          onMove={(dx, dy) => {
            const pos = selfPositionPctRef.current;
            setMoveTargetPct(pos.x + dx, pos.y + dy);
          }}
          onRelease={() => {
            // Stop movement on release by setting target = current position.
            const pos = selfPositionPctRef.current;
            setMoveTargetPct(pos.x, pos.y);
          }}
        />
      ) : null}

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
          extractionPositionPct={zone.extractionPositionPct}
          strikeRangePct={strikeRangePct}
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
        voidStrainChip={voidInfusionHudLine(state.player.voidInstability)}
        voidSuppressionChip={
          state.player.voidRealtimeBinding ? "Void Suppression · mana ÷2" : null
        }
        runHeatChip={formatRunInstabilityChip(state.player.runInstability)}
        runStyleChip={formatRunStyleLabel(state.player.runArchetype)}
        ascensionTensionChip={ascensionTensionChip}
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
          mana={state.player.mana}
          manaMax={state.player.manaMax}
          manaDisplayName={manaDisplay.shortName}
          abilities={abilitySlots}
          onActivateAbility={handleActivateAbility}
        />
      </div>

      <div className="pointer-events-none absolute right-[max(1rem,env(safe-area-inset-right,0px))] top-[calc(6.25rem+env(safe-area-inset-top,0px))] z-30 max-w-[min(200px,calc(100vw-2rem))] rounded-full border border-emerald-300/45 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-100 md:top-24">
        Extraction
      </div>

      {extractionSummary ? (
        <ExtractionSummary
          ledger={extractionSummary}
          playerSnapshot={{
            condition: state.player.condition,
            hunger: state.player.hunger,
          }}
        />
      ) : null}
    </main>
  );
}
