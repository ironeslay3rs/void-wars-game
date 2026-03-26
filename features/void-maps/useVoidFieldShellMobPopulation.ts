"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MobEntity } from "@/features/void-maps/realtime/voidRealtimeProtocol";
import {
  buildVoidFieldShellMobTemplates,
  isVoidFieldShellMobId,
  isVoidFieldShellBossMobId,
  VOID_FIELD_SHELL_BOSS_MOB_PREFIX,
  VOID_FIELD_SHELL_MOB_PREFIX,
} from "@/features/void-maps/voidFieldShellMobs";
import { voidZoneById, type VoidZoneBossSpawnConfig, type VoidZoneId } from "@/features/void-maps/zoneData";
import {
  voidFieldClamp,
  voidFieldHashStringToInt,
} from "@/features/void-maps/voidFieldUtils";

/**
 * Keep shell corpses visible until loot can finish homing (VoidFieldLootDrops hold+home ~1180ms).
 */
export const VOID_FIELD_SHELL_CORPSE_VISIBLE_MS = 1_360;

/** After corpse removal, brief gap before replacement spawns (stable shell population). */
export const VOID_FIELD_SHELL_RESPAWN_DELAY_MS = 520;

// Ambient drift tuning for shell stand-ins (client-only).
const SHELL_MOB_AMBIENT_TICK_MS = 80;
const SHELL_MOB_WANDER_RADIUS_X_PCT = 2.8;
const SHELL_MOB_WANDER_RADIUS_Y_PCT = 2.2;
const SHELL_MOB_RESPAWN_JITTER_PCT = 4.0;
const SHELL_MOB_CLAMP_MIN_PCT = 4;
const SHELL_MOB_CLAMP_MAX_PCT = 96;
const SHELL_BOSS_CLAMP_MIN_PCT = 8;
const SHELL_BOSS_CLAMP_MAX_PCT = 92;

type ShellHomeParams = {
  homeX: number;
  homeY: number;
  radiusX: number;
  radiusY: number;
  speedA: number;
  speedB: number;
  phaseA: number;
  phaseB: number;
};

type ShellSlotAlive = { kind: "alive"; mob: MobEntity };
type ShellSlotCorpse = { kind: "corpse"; mob: MobEntity; removeAt: number };
type ShellSlotPending = {
  kind: "pending";
  slotIndex: number;
  respawnAt: number;
};

type ShellSlot = ShellSlotAlive | ShellSlotCorpse | ShellSlotPending;

type BossSlot =
  | { kind: "none" }
  | { kind: "alive"; mob: MobEntity }
  | { kind: "corpse"; mob: MobEntity; removeAt: number }
  | {
      kind: "cooldown";
      deadAt: number;
      cooldownUntil: number;
      forceAt: number;
      nextRollAt: number;
      rollCount: number;
    }
  | {
      kind: "rolling";
      baseAt: number;
      forceAt: number;
      nextRollAt: number;
      rollCount: number;
    };

function shellMobIdForSlot(
  zoneId: VoidZoneId,
  slotIndex: number,
  gen: number,
): string {
  if (gen <= 0) {
    return `${VOID_FIELD_SHELL_MOB_PREFIX}-${zoneId}-${slotIndex}`;
  }
  return `${VOID_FIELD_SHELL_MOB_PREFIX}-${zoneId}-${slotIndex}-g${gen}`;
}

function slotsToMobs(slots: ShellSlot[]): MobEntity[] {
  return slots.flatMap((s) => (s.kind === "pending" ? [] : [s.mob]));
}

function bossIdForGen(zoneId: VoidZoneId, gen: number) {
  if (gen <= 0) return `${VOID_FIELD_SHELL_BOSS_MOB_PREFIX}-${zoneId}-0`;
  return `${VOID_FIELD_SHELL_BOSS_MOB_PREFIX}-${zoneId}-g${gen}`;
}

function formatMsAsClock(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/**
 * Local-only shell field: death, corpse window (loot-friendly), removal, respawn.
 * When realtime mobs exist, returns server list unchanged and ignores damage.
 */
export function useVoidFieldShellMobPopulation(
  zoneId: VoidZoneId,
  realtimeMobs: MobEntity[],
): {
  mobsForField: MobEntity[];
  applyShellMobDamage: (mobEntityId: string, damage: number) => void;
  bossChip: string | null;
} {
  /**
   * Shell lifecycle should run when the field is effectively "shell-only".
   * In some situations the realtime list may still include shell stand-ins;
   * we must not enable local respawns if non-shell server mobs are present.
   */
  const shellMode =
    realtimeMobs.length === 0 || realtimeMobs.every((m) => isVoidFieldShellMobId(m.mobEntityId));
  const templates = useMemo(() => buildVoidFieldShellMobTemplates(zoneId), [zoneId]);
  const template = templates.regular;
  const bossTemplate = templates.boss;
  const bossConfig: VoidZoneBossSpawnConfig | null =
    voidZoneById[zoneId]?.bossEnabled ? voidZoneById[zoneId]?.bossSpawn ?? null : null;

  const homeParams = useMemo<ShellHomeParams[]>(
    () =>
      template.map((tmpl, i) => {
        const seed = voidFieldHashStringToInt(`${zoneId}-${i}-shell-ambient`);
        const t01 = (seed % 1000) / 1000;
        const t02 = ((seed / 1000) % 1000) / 1000;
        const t03 = ((seed / 1_000_000) % 1000) / 1000;
        const t04 = ((seed / 1_000_000_000) % 1000) / 1000;
        return {
          homeX: tmpl.x,
          homeY: tmpl.y,
          radiusX:
            SHELL_MOB_WANDER_RADIUS_X_PCT * (0.65 + t01 * 0.6),
          radiusY:
            SHELL_MOB_WANDER_RADIUS_Y_PCT * (0.65 + t02 * 0.6),
          speedA: 0.22 + t03 * 0.12,
          speedB: 0.14 + t04 * 0.10,
          phaseA: t01 * Math.PI * 2,
          phaseB: t02 * Math.PI * 2,
        };
      }),
    [template, zoneId],
  );

  const [slots, setSlots] = useState<ShellSlot[]>(() =>
    template.map((mob) => ({ kind: "alive", mob: { ...mob } })),
  );

  const [bossSlot, setBossSlot] = useState<BossSlot>(() => ({ kind: "none" }));
  const [bossChip, setBossChip] = useState<string | null>(null);

  const slotsRef = useRef<ShellSlot[]>(slots);
  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  const bossRef = useRef<BossSlot>(bossSlot);
  useEffect(() => {
    bossRef.current = bossSlot;
  }, [bossSlot]);

  // Only used to re-schedule corpse/pending timers.
  // Ambient movement updates x/y but must not continuously re-schedule respawn timers.
  const shellTimerScheduleKey = useMemo(() => {
    return slots
      .map((s, i) => {
        if (s.kind === "corpse") return `c${i}:${s.removeAt}`;
        if (s.kind === "pending") return `p${i}:${s.respawnAt}`;
        return `a${i}:${s.mob.mobEntityId}`;
      })
      .join("|");
  }, [slots]);

  const genBySlotRef = useRef<number[]>(template.map(() => 0));
  const bossGenRef = useRef(0);

  useEffect(() => {
    if (!shellMode) return;
    const resetId = window.setTimeout(() => {
      setSlots(template.map((mob) => ({ kind: "alive", mob: { ...mob } })));
      genBySlotRef.current = template.map(() => 0);
      bossGenRef.current = 0;
      if (bossConfig) {
        const now = Date.now();
        setBossSlot({
          kind: "rolling",
          baseAt: now,
          forceAt: now + bossConfig.forceSpawnAfterMs,
          nextRollAt: now + bossConfig.rollIntervalMs,
          rollCount: 0,
        });
        setBossChip("Boss dormant");
      } else {
        setBossSlot({ kind: "none" });
        setBossChip(null);
      }
    }, 0);
    return () => window.clearTimeout(resetId);
  }, [shellMode, zoneId, template, bossConfig]);

  // Ambient drifting for alive shell mobs (slow, no pathfinding).
  useEffect(() => {
    if (!shellMode) return;

    const start = performance.now();
    const id = window.setInterval(() => {
      const t = (performance.now() - start) / 1000;
      setSlots((prev) =>
        prev.map((s, i) => {
          if (s.kind !== "alive") return s;
          const hp = homeParams[i];
          if (!hp) return s;

          // Two gentle harmonics to avoid a mechanical "slide".
          const dx =
            Math.sin(t * hp.speedA + hp.phaseA) * hp.radiusX +
            Math.sin(t * hp.speedB * 0.7 + hp.phaseB) * (hp.radiusX * 0.35);
          const dy =
            Math.cos(t * hp.speedA + hp.phaseB) * hp.radiusY +
            Math.cos(t * hp.speedB * 0.75 + hp.phaseA) * (hp.radiusY * 0.35);

          return {
            ...s,
            mob: {
              ...s.mob,
              x: voidFieldClamp(
                hp.homeX + dx,
                SHELL_MOB_CLAMP_MIN_PCT,
                SHELL_MOB_CLAMP_MAX_PCT,
              ),
              y: voidFieldClamp(
                hp.homeY + dy,
                SHELL_MOB_CLAMP_MIN_PCT,
                SHELL_MOB_CLAMP_MAX_PCT,
              ),
            },
          };
        }),
      );
    }, SHELL_MOB_AMBIENT_TICK_MS);

    return () => window.clearInterval(id);
  }, [shellMode, homeParams]);

  useEffect(() => {
    if (!shellMode) return;
    const timers: number[] = [];

    slotsRef.current.forEach((s, i) => {
      if (s.kind === "corpse") {
        const ms = Math.max(0, s.removeAt - Date.now());
        timers.push(
          window.setTimeout(() => {
            setSlots((prev) => {
              const cur = prev[i];
              if (cur.kind !== "corpse" || cur.removeAt !== s.removeAt) {
                return prev;
              }
              return prev.map((x, j) =>
                j === i
                  ? {
                      kind: "pending" as const,
                      slotIndex: i,
                      respawnAt: Date.now() + VOID_FIELD_SHELL_RESPAWN_DELAY_MS,
                    }
                  : x,
              );
            });
          }, ms),
        );
      }
      if (s.kind === "pending") {
        const ms = Math.max(0, s.respawnAt - Date.now());
        timers.push(
          window.setTimeout(() => {
            setSlots((prev) => {
              const cur = prev[i];
              if (cur.kind !== "pending") return prev;

              genBySlotRef.current[i] += 1;
              const gen = genBySlotRef.current[i];
              const tmpl = template[i];
              if (!tmpl) return prev;

              const hp = homeParams[i];
              const now = Date.now();
              const seed = voidFieldHashStringToInt(
                `${zoneId}-${i}-respawn-${gen}-${now}`,
              );
              const jx =
                ((seed % 1000) / 1000 - 0.5) * SHELL_MOB_RESPAWN_JITTER_PCT;
              const jy =
                (((seed / 1000) % 1000) / 1000 - 0.5) *
                SHELL_MOB_RESPAWN_JITTER_PCT;

              const x = voidFieldClamp(
                (hp?.homeX ?? tmpl.x) + jx,
                SHELL_MOB_CLAMP_MIN_PCT,
                SHELL_MOB_CLAMP_MAX_PCT,
              );
              const y = voidFieldClamp(
                (hp?.homeY ?? tmpl.y) + jy,
                SHELL_MOB_CLAMP_MIN_PCT,
                SHELL_MOB_CLAMP_MAX_PCT,
              );

              const mob: MobEntity = {
                ...tmpl,
                mobEntityId: shellMobIdForSlot(zoneId, i, gen),
                hp: tmpl.maxHp,
                maxHp: tmpl.maxHp,
                spawnedAt: now,
                x,
                y,
              };
              return prev.map((x, j) =>
                j === i ? { kind: "alive" as const, mob } : x,
              );
            });
          }, ms),
        );
      }
    });

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [shellMode, shellTimerScheduleKey, template, zoneId, homeParams]);

  useEffect(() => {
    if (!shellMode) return;
    if (!bossConfig) return;

    const id = window.setInterval(() => {
      const now = Date.now();
      const cur = bossRef.current;

      // If alive, nothing to do here (death is handled by applyShellMobDamage).
      if (cur.kind === "alive") return;

      if (cur.kind === "corpse") {
        if (now < cur.removeAt) return;
        setBossSlot({
          kind: "cooldown",
          deadAt: now,
          cooldownUntil: now + bossConfig.cooldownMs,
          forceAt: now + bossConfig.forceSpawnAfterMs,
          nextRollAt: now + bossConfig.cooldownMs + bossConfig.rollIntervalMs,
          rollCount: 0,
        });
        return;
      }

      if (cur.kind === "cooldown") {
        if (now < cur.cooldownUntil) return;
        setBossSlot({
          kind: "rolling",
          baseAt: cur.deadAt,
          forceAt: cur.forceAt,
          nextRollAt: now,
          rollCount: cur.rollCount,
        });
        return;
      }

      if (cur.kind === "rolling") {
        const shouldForce = now >= cur.forceAt;
        const canRoll = now >= cur.nextRollAt;
        if (!shouldForce && !canRoll) return;

        const rollIndex = shouldForce ? cur.rollCount + 999 : cur.rollCount + 1;
        const seed = voidFieldHashStringToInt(
          `${zoneId}-boss-roll-${cur.baseAt}-${rollIndex}`,
        );
        const r01 = (seed % 1000) / 1000;
        const success = shouldForce || r01 < bossConfig.spawnChancePerRoll;
        if (!success) {
          setBossSlot({
            ...cur,
            rollCount: cur.rollCount + 1,
            nextRollAt: now + bossConfig.rollIntervalMs,
          });
          return;
        }

        bossGenRef.current += 1;
        const gen = bossGenRef.current;

        // Spawn location: broad roam, clamped away from edges.
        const sx = voidFieldHashStringToInt(`${zoneId}-boss-x-${cur.baseAt}-${gen}`);
        const sy = voidFieldHashStringToInt(`${zoneId}-boss-y-${cur.baseAt}-${gen}`);
        const x = voidFieldClamp(
          20 + ((sx % 1000) / 1000) * 60,
          SHELL_BOSS_CLAMP_MIN_PCT,
          SHELL_BOSS_CLAMP_MAX_PCT,
        );
        const y = voidFieldClamp(
          18 + ((sy % 1000) / 1000) * 56,
          SHELL_BOSS_CLAMP_MIN_PCT,
          SHELL_BOSS_CLAMP_MAX_PCT,
        );

        const mob: MobEntity = {
          ...bossTemplate,
          mobEntityId: bossIdForGen(zoneId, gen),
          spawnedAt: now,
          hp: bossTemplate.maxHp,
          maxHp: bossTemplate.maxHp,
          x,
          y,
        };
        setBossSlot({ kind: "alive", mob });
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [bossConfig, bossTemplate, shellMode, zoneId]);

  const applyShellMobDamage = useCallback(
    (mobEntityId: string, damage: number) => {
      if (!shellMode) return;
      if (!isVoidFieldShellMobId(mobEntityId)) return;
      if (damage <= 0) return;

      // Boss damage path (still shell-only).
      if (isVoidFieldShellBossMobId(mobEntityId)) {
        setBossSlot((prev) => {
          if (prev.kind !== "alive") return prev;
          if (prev.mob.mobEntityId !== mobEntityId) return prev;
          const hp = Math.max(0, prev.mob.hp - damage);
          if (hp > 0) {
            return { kind: "alive", mob: { ...prev.mob, hp } };
          }
          return {
            kind: "corpse",
            mob: { ...prev.mob, hp: 0 },
            removeAt: Date.now() + VOID_FIELD_SHELL_CORPSE_VISIBLE_MS,
          };
        });
        return;
      }

      setSlots((prev) => {
        const i = prev.findIndex(
          (x) => x.kind === "alive" && x.mob.mobEntityId === mobEntityId,
        );
        if (i < 0) return prev;
        const slot = prev[i];
        if (slot.kind !== "alive") return prev;

        const hp = Math.max(0, slot.mob.hp - damage);
        if (hp > 0) {
          return prev.map((x, j) =>
            j === i
              ? { kind: "alive", mob: { ...slot.mob, hp } }
              : x,
          );
        }

        return prev.map((x, j) =>
          j === i
            ? {
                kind: "corpse",
                mob: { ...slot.mob, hp: 0 },
                removeAt: Date.now() + VOID_FIELD_SHELL_CORPSE_VISIBLE_MS,
              }
            : x,
        );
      });
    },
    [shellMode],
  );

  const mobsForField = useMemo(() => {
    if (!shellMode) return realtimeMobs;
    const base = slotsToMobs(slots);
    const b = bossSlot;
    if (b.kind === "alive" || b.kind === "corpse") {
      return [...base, b.mob];
    }
    return base;
  }, [shellMode, realtimeMobs, slots, bossSlot]);

  useEffect(() => {
    if (!shellMode || !bossConfig) {
      const t = window.setTimeout(() => setBossChip(null), 0);
      return () => window.clearTimeout(t);
    }
    const id = window.setInterval(() => {
      const b = bossRef.current;
      const now = Date.now();
      if (b.kind === "alive") {
        setBossChip("Boss roaming");
        return;
      }
      if (b.kind === "corpse") {
        setBossChip("Boss down");
        return;
      }
      if (b.kind === "cooldown") {
        setBossChip(`Boss cooldown ${formatMsAsClock(b.cooldownUntil - now)}`);
        return;
      }
      if (b.kind === "rolling") {
        setBossChip(`Boss check ${formatMsAsClock(b.nextRollAt - now)}`);
        return;
      }
      setBossChip("Boss dormant");
    }, 1000);
    return () => window.clearInterval(id);
  }, [bossConfig, shellMode]);

  return { mobsForField, applyShellMobDamage, bossChip };
}
