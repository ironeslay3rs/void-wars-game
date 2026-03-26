"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CombatEventMessage,
  MobEntity,
} from "@/features/void-maps/realtime/voidRealtimeProtocol";

export type VoidFieldSlashFx = {
  id: string;
  xPct: number;
  yPct: number;
  until: number;
};

export type VoidFieldDamageFloatFx = {
  id: string;
  xPct: number;
  yPct: number;
  damage: number;
  isCrit: boolean;
  /** Heavier, slower float (chunkier hits; not used when isCrit). */
  heavy: boolean;
  /** Display-only boost (e.g. Ember Stim). */
  boosted?: boolean;
  until: number;
};

/** Bigger strikes: more readable float, longer linger. */
export type VoidFieldMobHitPulse = {
  mobEntityId: string;
  until: number;
};

const SLASH_MS = 400;
const FLOAT_MS = 720;
const FLOAT_HEAVY_MS = 820;
const FLOAT_CRIT_MS = 920;
// Heavy is intentionally rare: most non-crit hits are in the ~30-50 range at low rank.
// We reserve "heavy" for the upper tail so it stays meaningful under multiplayer noise.
const HEAVY_DAMAGE_THRESHOLD = 40;
const MOB_HIT_PULSE_MS = 300;
const MOB_HIT_PULSE_STRONG_MS = 380;
const PRUNE_INTERVAL_MS = 90;
const PROCESSED_CAP = 48;
let slashCounter = 0;

/**
 * Optimistic slash on attack commit; floating damage from self combat_event rows.
 */
export function useVoidFieldCombatFeedback({
  selfClientId,
  recentCombatEvents,
  mobs,
  selfDamageFloatMultiplier = 1,
}: {
  selfClientId: string;
  recentCombatEvents: CombatEventMessage[];
  mobs: MobEntity[];
  /** Display-only multiplier for self damage floats (no backend impact). */
  selfDamageFloatMultiplier?: number;
}) {
  const mobsRef = useRef<MobEntity[]>(mobs);

  const [slashes, setSlashes] = useState<VoidFieldSlashFx[]>([]);
  const [floats, setFloats] = useState<VoidFieldDamageFloatFx[]>([]);
  const [hitPulses, setHitPulses] = useState<VoidFieldMobHitPulse[]>([]);
  const processedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    mobsRef.current = mobs;
  }, [mobs]);

  const pushMobHitPulse = useCallback(
    (mobEntityId: string, durationMs: number = MOB_HIT_PULSE_MS) => {
      setHitPulses((prev) => {
        const until = Date.now() + durationMs;
        const others = prev.filter((p) => p.mobEntityId !== mobEntityId);
        const cur = prev.find((p) => p.mobEntityId === mobEntityId);
        const mergedUntil = Math.max(cur?.until ?? 0, until);
        return [...others, { mobEntityId, until: mergedUntil }].slice(0, 32);
      });
    },
    [],
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setSlashes((s) => s.filter((x) => x.until > now));
      setFloats((f) => f.filter((x) => x.until > now));
      setHitPulses((h) => h.filter((x) => x.until > now));
    }, PRUNE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!selfClientId) return;
    const additions: VoidFieldDamageFloatFx[] = [];
    const pulses: Array<{ mobEntityId: string; ms: number }> = [];
    for (const ev of recentCombatEvents) {
      const key = `${ev.ts}-${ev.mobEntityId}-${ev.attackerClientId}`;
      if (processedKeysRef.current.has(key)) continue;
      processedKeysRef.current.add(key);
      if (processedKeysRef.current.size > PROCESSED_CAP) {
        processedKeysRef.current.clear();
      }

      const m = mobsRef.current.find((x) => x.mobEntityId === ev.mobEntityId);
      // If the mob isn't on-field anymore (or not yet spawned), don't render impacts.
      if (!m) continue;
      const showDmg = ev.effectiveDamage ?? ev.damage;
      const heavy = !ev.isCrit && showDmg >= HEAVY_DAMAGE_THRESHOLD;
      pulses.push({
        mobEntityId: ev.mobEntityId,
        ms: ev.isCrit || heavy ? MOB_HIT_PULSE_STRONG_MS : MOB_HIT_PULSE_MS,
      });

      if (ev.attackerClientId !== selfClientId) {
        continue;
      }

      const id = `dmg-${key}`;
      const duration = ev.isCrit
        ? FLOAT_CRIT_MS
        : heavy
          ? FLOAT_HEAVY_MS
          : FLOAT_MS;
      const boosted =
        typeof selfDamageFloatMultiplier === "number" &&
        selfDamageFloatMultiplier !== 1;
      const shownDamage = boosted
        ? Math.max(1, Math.round(showDmg * selfDamageFloatMultiplier))
        : showDmg;
      additions.push({
        id,
        xPct: m.x,
        yPct: Math.max(8, m.y - 9),
        damage: shownDamage,
        isCrit: ev.isCrit,
        heavy,
        boosted,
        until: Date.now() + duration,
      });
    }
    if (additions.length === 0 && pulses.length === 0) return;
    queueMicrotask(() => {
      if (additions.length > 0) {
        setFloats((prev) => [...additions, ...prev].slice(0, 18));
      }
      if (pulses.length > 0) {
        setHitPulses((prev) => {
          let next = [...prev];
          for (const { mobEntityId, ms } of pulses) {
            const until = Date.now() + ms;
            const others = next.filter((p) => p.mobEntityId !== mobEntityId);
            const cur = next.find((p) => p.mobEntityId === mobEntityId);
            const mergedUntil = Math.max(cur?.until ?? 0, until);
            next = [...others, { mobEntityId, until: mergedUntil }];
          }
          return next.slice(0, 32);
        });
      }
    });
  }, [recentCombatEvents, selfClientId, selfDamageFloatMultiplier]);

  const registerSlashForMob = useCallback(
    (mobEntityId: string) => {
      const m = mobsRef.current.find((x) => x.mobEntityId === mobEntityId);
      if (!m || m.hp <= 0) return;
      const id = `slash-${Date.now()}-${mobEntityId}-${++slashCounter}`;
      setSlashes((prev) => [
        ...prev,
        {
          id,
          xPct: m.x,
          yPct: m.y,
          until: Date.now() + SLASH_MS,
        },
      ]);
      pushMobHitPulse(mobEntityId, MOB_HIT_PULSE_MS);
    },
    [pushMobHitPulse],
  );

  /** Client-only shell / practice strikes (no server combat_event). */
  const pushLocalDamageFloat = useCallback(
    (mobEntityId: string, damage: number, isCrit = false) => {
      const m = mobsRef.current.find((x) => x.mobEntityId === mobEntityId);
      if (!m) return;
      const id = `dmg-local-${Date.now()}-${mobEntityId}`;
      const yPct = Math.max(8, m.y - 9);
      const heavy = !isCrit && damage >= HEAVY_DAMAGE_THRESHOLD;
      const duration = isCrit
        ? FLOAT_CRIT_MS
        : heavy
          ? FLOAT_HEAVY_MS
          : FLOAT_MS;
      setFloats((prev) =>
        [
          {
            id,
            xPct: m.x,
            yPct,
            damage,
            isCrit,
            heavy,
            boosted: false,
            until: Date.now() + duration,
          },
          ...prev,
        ].slice(0, 18),
      );
      pushMobHitPulse(
        mobEntityId,
        heavy || isCrit ? MOB_HIT_PULSE_STRONG_MS : MOB_HIT_PULSE_MS,
      );
    },
    [pushMobHitPulse],
  );

  return {
    slashes,
    floats,
    hitPulses,
    registerSlashForMob,
    pushLocalDamageFloat,
  };
}
