/**
 * Event Rewards — pure reward resolver applied when a player claims a
 * completed/active event. Returns a delta structure the caller layers
 * onto PlayerState (via ADD_RESOURCE / multiplier hooks / discount hooks).
 *
 * No mutation. No randomness. Deterministic for a given (event, context).
 */

import type { ResourceKey } from "@/features/game/gameTypes";
import type {
  EventDefinition,
  EventKind,
  EventRewardHint,
} from "@/features/events/eventRegistry";
import type { ScheduledEvent } from "@/features/events/eventSchedule";

export type EventClaimContext = {
  /** Minutes the player actually participated (bounded to window duration). */
  participationMinutes?: number;
  /** Mobs cleared or objectives hit during the window (incursion/bounty). */
  objectivesCleared?: number;
  /** Optional tier multiplier (e.g. rapport/keepsake). */
  rewardMultiplier?: number;
};

export type EventResolvedReward = {
  eventId: string;
  kind: EventKind;
  /** Resources to credit via ADD_RESOURCE. Empty when reward is stateless. */
  resourceGrants: Partial<Record<ResourceKey, number>>;
  /** Loot multiplier to apply while window open (loot-boost only). */
  lootMultiplier: number;
  /** Broker discount fraction 0..1 (sale only). */
  discountPct: number;
  /** Human-readable summary for UI toast. */
  summary: string;
};

const EMPTY_GRANTS: Partial<Record<ResourceKey, number>> = {};

function clampMultiplier(ctx: EventClaimContext): number {
  const m = ctx.rewardMultiplier ?? 1;
  if (!Number.isFinite(m) || m <= 0) return 1;
  return Math.min(m, 5);
}

function scaleByParticipation(
  hint: EventRewardHint,
  ctx: EventClaimContext,
  def: EventDefinition,
): number {
  if (ctx.participationMinutes == null) return 1;
  const capped = Math.max(
    0,
    Math.min(ctx.participationMinutes, def.durationMinutes),
  );
  if (def.durationMinutes <= 0) return 1;
  // Minimum 25% if any participation registered, to avoid degenerate zero claims.
  const frac = capped / def.durationMinutes;
  if (capped > 0 && frac < 0.25) return 0.25;
  return frac;
}

function objectiveBoost(ctx: EventClaimContext): number {
  const n = ctx.objectivesCleared ?? 0;
  if (n <= 0) return 1;
  // +10% per objective up to +100%.
  return 1 + Math.min(1, n * 0.1);
}

function scaleGrants(
  pool: Partial<Record<ResourceKey, number>>,
  scalar: number,
): Partial<Record<ResourceKey, number>> {
  const out: Partial<Record<ResourceKey, number>> = {};
  for (const [k, v] of Object.entries(pool) as [ResourceKey, number][]) {
    if (v == null) continue;
    const scaled = Math.floor(v * scalar);
    if (scaled > 0) out[k] = scaled;
  }
  return out;
}

export function resolveEventReward(
  def: EventDefinition,
  ctx: EventClaimContext = {},
): EventResolvedReward {
  const baseScalar =
    scaleByParticipation(def.reward, ctx, def) *
    objectiveBoost(ctx) *
    clampMultiplier(ctx);

  const hint = def.reward;
  switch (hint.kind) {
    case "resource": {
      const amount = Math.max(0, Math.floor(hint.amount * baseScalar));
      const grants =
        amount > 0 ? ({ [hint.key]: amount } as Partial<Record<ResourceKey, number>>) : EMPTY_GRANTS;
      return {
        eventId: def.id,
        kind: def.kind,
        resourceGrants: grants,
        lootMultiplier: 1,
        discountPct: 0,
        summary: amount > 0 ? `+${amount} ${hint.key}` : "No reward",
      };
    }
    case "bounty-pool": {
      const grants = scaleGrants(hint.pool, baseScalar);
      const parts = Object.entries(grants).map(([k, v]) => `+${v} ${k}`);
      return {
        eventId: def.id,
        kind: def.kind,
        resourceGrants: grants,
        lootMultiplier: 1,
        discountPct: 0,
        summary: parts.length > 0 ? parts.join(", ") : "No reward",
      };
    }
    case "multiplier": {
      // Stateless — applied while the window is open. Context doesn't reshape it.
      return {
        eventId: def.id,
        kind: def.kind,
        resourceGrants: EMPTY_GRANTS,
        lootMultiplier: hint.lootMultiplier,
        discountPct: 0,
        summary: `Loot x${hint.lootMultiplier}`,
      };
    }
    case "discount": {
      return {
        eventId: def.id,
        kind: def.kind,
        resourceGrants: EMPTY_GRANTS,
        lootMultiplier: 1,
        discountPct: hint.discountPct,
        summary: `${Math.round(hint.discountPct * 100)}% off`,
      };
    }
  }
}

/** Resolve from a ScheduledEvent directly (UI path). */
export function resolveScheduledReward(
  scheduled: ScheduledEvent,
  ctx: EventClaimContext = {},
): EventResolvedReward {
  return resolveEventReward(scheduled.definition, ctx);
}

/** Merge resource grants from multiple resolved rewards (e.g. simultaneous claims). */
export function mergeResourceGrants(
  rewards: EventResolvedReward[],
): Partial<Record<ResourceKey, number>> {
  const out: Partial<Record<ResourceKey, number>> = {};
  for (const r of rewards) {
    for (const [k, v] of Object.entries(r.resourceGrants) as [
      ResourceKey,
      number,
    ][]) {
      if (v == null) continue;
      out[k] = (out[k] ?? 0) + v;
    }
  }
  return out;
}
