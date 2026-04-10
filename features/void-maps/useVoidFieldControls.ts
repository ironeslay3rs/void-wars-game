"use client";

import { useCallback, useEffect, useRef, type MutableRefObject } from "react";
import type { MobEntity } from "@/features/void-maps/realtime/voidRealtimeProtocol";
import { isVoidFieldShellMobId } from "@/features/void-maps/voidFieldShellMobs";
import {
  AUTO_ATTACK_TICK_MS,
  nextAttackCooldownMs,
} from "@/features/combat/autoAttack";

// For autoplay movement, prefer targets inside this radius.
// If nothing is nearby, we keep the current move target instead of picking something far.
const AUTO_LOCAL_MOVE_RADIUS_PCT = 22;

function mobInStrikeRange(
  mob: MobEntity,
  selfPos: { x: number; y: number },
  radiusPct: number,
): boolean {
  if (mob.hp <= 0) return false;
  const dx = mob.x - selfPos.x;
  const dy = mob.y - selfPos.y;
  return dx * dx + dy * dy <= radiusPct * radiusPct;
}

/** Prefer locked target when in range; otherwise nearest mob in range. */
function pickMobForStrike(
  mobs: MobEntity[],
  selfPos: { x: number; y: number },
  preferredMobEntityId: string | null,
  radiusPct: number,
): MobEntity | null {
  const radiusSq = radiusPct * radiusPct;

  if (preferredMobEntityId) {
    const pref = mobs.find((m) => m.mobEntityId === preferredMobEntityId);
    if (pref && mobInStrikeRange(pref, selfPos, radiusPct)) {
      return pref;
    }
  }

  let best: MobEntity | null = null;
  let bestDistSq = Number.POSITIVE_INFINITY;
  for (const mob of mobs) {
    if (mob.hp <= 0) continue;
    const dx = mob.x - selfPos.x;
    const dy = mob.y - selfPos.y;
    const distSq = dx * dx + dy * dy;
    if (distSq > radiusSq || distSq >= bestDistSq) continue;
    best = mob;
    bestDistSq = distSq;
  }
  return best;
}

export type UseVoidFieldControlsArgs = {
  multiplayerEnabled: boolean;
  connected: boolean;
  isRunning: boolean;
  /** Mobs currently drawn on the field (realtime list or shell stand-ins). */
  fieldMobs: MobEntity[];
  selfPositionPctRef: MutableRefObject<{ x: number; y: number }>;
  sendAttack: (mobEntityId: string) => void;
  /** Sets local click-to-move target (pct coordinates). Used by autoplay. */
  setMoveTargetPct: (xPct: number, yPct: number) => void;
  /** Fires when a strike is committed (before server ack). For local VFX. */
  onAttackCommitted?: (mobEntityId: string) => void;
  /** Apply local HP loss + any client-only strike feedback (e.g. damage float). */
  onShellStrike: (mobEntityId: string) => void;
  /** Current field target (mob entity id). Updated each render via ref sync in parent. */
  targetedMobEntityIdRef: MutableRefObject<string | null>;
  /** M1 auto-strike: repeat strikes while true. */
  autoStrikeEnabled: boolean;
  /** Effective range from equipped weapon profile. */
  strikeRangePct: number;
  /** Callback to activate an ability by slot index (0-based). */
  onActivateAbilityByIndex?: (index: number) => void;
};

/**
 * Strike wiring for the void field. Movement is handled locally in the canvas hook.
 */
export function useVoidFieldControls({
  multiplayerEnabled,
  connected,
  isRunning,
  fieldMobs,
  selfPositionPctRef,
  sendAttack,
  setMoveTargetPct,
  onAttackCommitted,
  onShellStrike,
  targetedMobEntityIdRef,
  autoStrikeEnabled,
  strikeRangePct,
  onActivateAbilityByIndex,
}: UseVoidFieldControlsArgs) {
  const mobsRef = useRef<MobEntity[]>(fieldMobs);
  const canAttackRef = useRef(isRunning);
  const attackCooldownUntilRef = useRef(0);
  const onAttackCommittedRef = useRef(onAttackCommitted);
  const onShellStrikeRef = useRef(onShellStrike);
  const autoMoveTargetMobEntityIdRef = useRef<string | null>(null);
  const lastAutoMoveTargetSetAtRef = useRef(0);
  useEffect(() => {
    onAttackCommittedRef.current = onAttackCommitted;
  }, [onAttackCommitted]);
  useEffect(() => {
    onShellStrikeRef.current = onShellStrike;
  }, [onShellStrike]);

  const performStrike = useCallback(() => {
    if (!multiplayerEnabled) return;
    if (Date.now() < attackCooldownUntilRef.current) return;

    const mobs = mobsRef.current;
    const selfPos = selfPositionPctRef.current;
    const preferred = targetedMobEntityIdRef.current;
    const best = pickMobForStrike(mobs, selfPos, preferred, strikeRangePct);

    if (!best) return;

    if (isVoidFieldShellMobId(best.mobEntityId)) {
      onAttackCommittedRef.current?.(best.mobEntityId);
      onShellStrikeRef.current?.(best.mobEntityId);
      attackCooldownUntilRef.current =
        Date.now() + nextAttackCooldownMs(autoStrikeEnabled);
      return;
    }

    if (!canAttackRef.current || !connected) return;

    onAttackCommittedRef.current?.(best.mobEntityId);
    sendAttack(best.mobEntityId);
    attackCooldownUntilRef.current =
      Date.now() + nextAttackCooldownMs(autoStrikeEnabled);
  }, [
    multiplayerEnabled,
    connected,
    autoStrikeEnabled,
    sendAttack,
    selfPositionPctRef,
    targetedMobEntityIdRef,
    strikeRangePct,
  ]);

  function pickNearestAliveMob(
    mobs: MobEntity[],
    selfPos: { x: number; y: number },
    radiusPct: number | null,
  ): MobEntity | null {
    let best: MobEntity | null = null;
    let bestDistSq = Number.POSITIVE_INFINITY;
    for (const mob of mobs) {
      if (mob.hp <= 0) continue;
      const dx = mob.x - selfPos.x;
      const dy = mob.y - selfPos.y;
      const distSq = dx * dx + dy * dy;
      if (radiusPct !== null) {
        const radiusSq = radiusPct * radiusPct;
        if (distSq > radiusSq) continue;
      }
      if (distSq >= bestDistSq) continue;
      best = mob;
      bestDistSq = distSq;
    }
    return best;
  }

  useEffect(() => {
    if (!multiplayerEnabled) return;
    mobsRef.current = fieldMobs;
  }, [multiplayerEnabled, fieldMobs]);

  useEffect(() => {
    if (!multiplayerEnabled) return;
    canAttackRef.current = isRunning;
  }, [multiplayerEnabled, isRunning]);

  useEffect(() => {
    if (!multiplayerEnabled) return;

    // Keyboard movement step size: ~5% of field per keypress.
    // Held keys repeat via the browser's key repeat, giving smooth
    // arrow/WASD traversal alongside the existing click-to-move.
    const KEYBOARD_STEP_PCT = 5;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        performStrike();
        return;
      }

      // Arrow keys + WASD → move the player in the pressed direction.
      const pos = selfPositionPctRef.current;
      let dx = 0;
      let dy = 0;
      if (e.code === "ArrowUp" || e.code === "KeyW") dy = -KEYBOARD_STEP_PCT;
      if (e.code === "ArrowDown" || e.code === "KeyS") dy = KEYBOARD_STEP_PCT;
      if (e.code === "ArrowLeft" || e.code === "KeyA") dx = -KEYBOARD_STEP_PCT;
      if (e.code === "ArrowRight" || e.code === "KeyD") dx = KEYBOARD_STEP_PCT;
      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        setMoveTargetPct(pos.x + dx, pos.y + dy);
        return;
      }

      // Hotkeys 1/2 for ability slots.
      if (e.code === "Digit1" || e.code === "Numpad1") {
        e.preventDefault();
        onActivateAbilityByIndex?.(0);
        return;
      }
      if (e.code === "Digit2" || e.code === "Numpad2") {
        e.preventDefault();
        onActivateAbilityByIndex?.(1);
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });

    return () => {
      window.removeEventListener("keydown", onKeyDown as EventListener);
    };
  }, [multiplayerEnabled, performStrike, selfPositionPctRef, setMoveTargetPct, onActivateAbilityByIndex]);

  useEffect(() => {
    if (!multiplayerEnabled || !autoStrikeEnabled) return;

    const id = window.setInterval(() => {
      const mobs = mobsRef.current;
      const selfPos = selfPositionPctRef.current;
      const preferred = targetedMobEntityIdRef.current;

      const bestInRange = pickMobForStrike(
        mobs,
        selfPos,
        preferred,
        strikeRangePct,
      );

      if (bestInRange) {
        performStrike();
        return;
      }

      const currentAutoMobId = autoMoveTargetMobEntityIdRef.current;
      const currentAutoMob = currentAutoMobId
        ? mobs.find((m) => m.mobEntityId === currentAutoMobId && m.hp > 0)
        : null;

      // Prefer a closer target within a local radius to avoid long-distance chasing.
      const localNearest = pickNearestAliveMob(
        mobs,
        selfPos,
        AUTO_LOCAL_MOVE_RADIUS_PCT,
      );

      const nextTarget = localNearest ?? (!currentAutoMob ? null : currentAutoMob);

      // If we have no local target and no current move target, fall back to global nearest.
      const globalNearest = nextTarget
        ? null
        : pickNearestAliveMob(mobs, selfPos, null);

      const chosen = nextTarget ?? globalNearest;
      if (!chosen) return;

      const now = Date.now();
      const shouldRetarget =
        chosen.mobEntityId !== autoMoveTargetMobEntityIdRef.current ||
        now - lastAutoMoveTargetSetAtRef.current > 320;
      if (!shouldRetarget) return;

      autoMoveTargetMobEntityIdRef.current = chosen.mobEntityId;
      lastAutoMoveTargetSetAtRef.current = now;
      setMoveTargetPct(chosen.x, chosen.y);
    }, AUTO_ATTACK_TICK_MS);

    return () => window.clearInterval(id);
  }, [
    multiplayerEnabled,
    autoStrikeEnabled,
    selfPositionPctRef,
    targetedMobEntityIdRef,
    setMoveTargetPct,
    performStrike,
    strikeRangePct,
  ]);

  // When auto turns off, lock the local move target at the current position.
  // This prevents the player from "finishing" a previously set autopilot target.
  useEffect(() => {
    if (!multiplayerEnabled) return;
    if (autoStrikeEnabled) return;
    const { x, y } = selfPositionPctRef.current;
    setMoveTargetPct(x, y);
    autoMoveTargetMobEntityIdRef.current = null;
  }, [multiplayerEnabled, autoStrikeEnabled, selfPositionPctRef, setMoveTargetPct]);

  const tryDirectMobAttack = useCallback(
    (mobEntityId: string) => {
      if (Date.now() < attackCooldownUntilRef.current) return;
      const selfPos = selfPositionPctRef.current;
      const targetMob =
        mobsRef.current.find((x) => x.mobEntityId === mobEntityId) ?? null;
      if (!targetMob || targetMob.hp <= 0) return;
      if (!mobInStrikeRange(targetMob, selfPos, strikeRangePct)) {
        setMoveTargetPct(targetMob.x, targetMob.y);
        return;
      }

      if (isVoidFieldShellMobId(mobEntityId)) {
        onAttackCommittedRef.current?.(mobEntityId);
        onShellStrikeRef.current?.(mobEntityId);
        attackCooldownUntilRef.current =
          Date.now() + nextAttackCooldownMs(autoStrikeEnabled);
        return;
      }

      if (!isRunning || !connected) return;
      onAttackCommittedRef.current?.(mobEntityId);
      sendAttack(mobEntityId);
      attackCooldownUntilRef.current =
        Date.now() + nextAttackCooldownMs(autoStrikeEnabled);
    },
    [
      isRunning,
      connected,
      sendAttack,
      autoStrikeEnabled,
      selfPositionPctRef,
      setMoveTargetPct,
      strikeRangePct,
    ],
  );

  return {
    performNearestStrike: performStrike,
    tryDirectMobAttack,
    attackCooldownUntilRef,
  };
}
