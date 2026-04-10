"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
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
import type { PlayerState } from "@/features/game/gameTypes";
import { resolveShellHit } from "@/features/combat/shellHitResolution";
import { spawnFieldMobsFromCreatures } from "@/features/field/mobSpawner";

/**
 * Keep shell corpses visible until loot can finish homing.
 * Reduced from 1360 → 900ms for snappier death → respawn cycle.
 */
export const VOID_FIELD_SHELL_CORPSE_VISIBLE_MS = 900;

/**
 * After corpse removal, brief gap before replacement spawns.
 * Reduced from 520 → 280ms for faster farming flow — mobs come
 * back quicker so the field stays dense and engaging.
 */
export const VOID_FIELD_SHELL_RESPAWN_DELAY_MS = 280;

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
/** Per-tick aggro pull toward the player (% of field per 80ms tick).
 *  ~2.3% per second — slow enough to kite, fast enough to feel threatening. */
const MOB_AGGRO_PULL_PER_TICK = 0.19;
/** Stop approaching when this close to the player (% of field). */
const MOB_AGGRO_MIN_DIST_PCT = 7;
/** Boss approaches more slowly. */
const BOSS_AGGRO_PULL_PER_TICK = 0.09;

export function useVoidFieldShellMobPopulation(
  zoneId: VoidZoneId,
  realtimeMobs: MobEntity[],
  shellCombatPlayer: PlayerState | null,
  /** Pass the player's position ref so mobs can approach them. */
  selfPositionPctRef?: MutableRefObject<{ x: number; y: number }>,
): {
  mobsForField: MobEntity[];
  applyShellMobDamage: (mobEntityId: string, rawDamage: number) => number;
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
  const creatureShellTemplate = useMemo(
    () => spawnFieldMobsFromCreatures(zoneId),
    [zoneId],
  );
  const template = creatureShellTemplate.length > 0 ? creatureShellTemplate : templates.regular;
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

  // Aggro offset: accumulates per-mob drift toward the player.
  // Ref so it persists across ticks without triggering re-renders.
  const aggroOffsetRef = useRef(template.map(() => ({ x: 0, y: 0 })));

  // Reset aggro offsets when the zone/template changes.
  useEffect(() => {
    aggroOffsetRef.current = template.map(() => ({ x: 0, y: 0 }));
  }, [template]);

  // Ambient drifting + aggro pull for alive shell mobs.
  // Mobs slowly approach the player's position each tick, creating
  // tension and making movement matter. The player must kite or die.
  useEffect(() => {
    if (!shellMode) return;

    const start = performance.now();
    const id = window.setInterval(() => {
      const t = (performance.now() - start) / 1000;
      const playerPos = selfPositionPctRef?.current ?? { x: 50, y: 82 };

      setSlots((prev) =>
        prev.map((s, i) => {
          if (s.kind !== "alive") return s;
          const hp = homeParams[i];
          if (!hp) return s;

          // Two gentle harmonics (existing ambient drift).
          const dx =
            Math.sin(t * hp.speedA + hp.phaseA) * hp.radiusX +
            Math.sin(t * hp.speedB * 0.7 + hp.phaseB) * (hp.radiusX * 0.35);
          const dy =
            Math.cos(t * hp.speedA + hp.phaseB) * hp.radiusY +
            Math.cos(t * hp.speedB * 0.75 + hp.phaseA) * (hp.radiusY * 0.35);

          // Aggro pull: slowly move toward the player. This is what
          // makes the field feel alive — mobs don't just float, they
          // HUNT you.
          const ao = aggroOffsetRef.current[i] ?? { x: 0, y: 0 };
          const currentBaseX = hp.homeX + ao.x;
          const currentBaseY = hp.homeY + ao.y;
          const toPlayerX = playerPos.x - currentBaseX;
          const toPlayerY = playerPos.y - currentBaseY;
          const dist = Math.hypot(toPlayerX, toPlayerY);
          if (dist > MOB_AGGRO_MIN_DIST_PCT && dist > 0.1) {
            const step = MOB_AGGRO_PULL_PER_TICK;
            ao.x += (toPlayerX / dist) * step;
            ao.y += (toPlayerY / dist) * step;
            aggroOffsetRef.current[i] = ao;
          }

          return {
            ...s,
            mob: {
              ...s.mob,
              x: voidFieldClamp(
                hp.homeX + ao.x + dx,
                SHELL_MOB_CLAMP_MIN_PCT,
                SHELL_MOB_CLAMP_MAX_PCT,
              ),
              y: voidFieldClamp(
                hp.homeY + ao.y + dy,
                SHELL_MOB_CLAMP_MIN_PCT,
                SHELL_MOB_CLAMP_MAX_PCT,
              ),
            },
          };
        }),
      );
    }, SHELL_MOB_AMBIENT_TICK_MS);

    return () => window.clearInterval(id);
  }, [shellMode, homeParams, selfPositionPctRef]);

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
    (mobEntityId: string, rawDamage: number): number => {
      if (!shellMode) return 0;
      if (!isVoidFieldShellMobId(mobEntityId)) return 0;
      if (rawDamage <= 0) return 0;

      if (isVoidFieldShellBossMobId(mobEntityId)) {
        let dealt = 0;
        setBossSlot((prev) => {
          if (prev.kind !== "alive") return prev;
          if (prev.mob.mobEntityId !== mobEntityId) return prev;
          if (!shellCombatPlayer) {
            dealt = rawDamage;
            const hp = Math.max(0, prev.mob.hp - rawDamage);
            if (hp > 0) {
              return { kind: "alive", mob: { ...prev.mob, hp } };
            }
            return {
              kind: "corpse",
              mob: { ...prev.mob, hp: 0 },
              removeAt: Date.now() + VOID_FIELD_SHELL_CORPSE_VISIBLE_MS,
            };
          }
          const out = resolveShellHit(prev.mob, rawDamage, shellCombatPlayer);
          dealt = out.damageDealt;
          const mob = out.mob;
          if (mob.hp > 0) {
            return { kind: "alive", mob };
          }
          return {
            kind: "corpse",
            mob: { ...mob, hp: 0 },
            removeAt: Date.now() + VOID_FIELD_SHELL_CORPSE_VISIBLE_MS,
          };
        });
        return dealt;
      }

      let dealt = 0;
      setSlots((prev) => {
        const i = prev.findIndex(
          (x) => x.kind === "alive" && x.mob.mobEntityId === mobEntityId,
        );
        if (i < 0) return prev;
        const slot = prev[i];
        if (slot.kind !== "alive") return prev;

        if (!shellCombatPlayer) {
          dealt = rawDamage;
          const hp = Math.max(0, slot.mob.hp - rawDamage);
          if (hp > 0) {
            return prev.map((x, j) =>
              j === i ? { kind: "alive", mob: { ...slot.mob, hp } } : x,
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
        }

        const out = resolveShellHit(slot.mob, rawDamage, shellCombatPlayer);
        dealt = out.damageDealt;
        const mob = out.mob;
        if (mob.hp > 0) {
          return prev.map((x, j) =>
            j === i ? { kind: "alive", mob } : x,
          );
        }
        return prev.map((x, j) =>
          j === i
            ? {
                kind: "corpse",
                mob: { ...mob, hp: 0 },
                removeAt: Date.now() + VOID_FIELD_SHELL_CORPSE_VISIBLE_MS,
              }
            : x,
        );
      });
      return dealt;
    },
    [shellMode, shellCombatPlayer],
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
