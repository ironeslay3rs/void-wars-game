/**
 * War Resolver — seeded, deterministic siege tick.
 *
 * Pure module. Given a territory + an attacker owner + current War state +
 * seed, advance the siege one tick and return a SiegeOutcome.
 *
 * RNG pattern mirrors features/arena/combatResolver.ts (mulberry32).
 *
 * Canon: The Three Empires.md — "the war between them never fully ends."
 * Empire-facing flavor strings use canon names (Verdant Coil, Chrome Synod,
 * Ember Vault), never "Bio/Mecha/Pure."
 */

import type {
  SiegeOutcome,
  Territory,
  TerritoryOwner,
  War,
  WarPhase,
} from "./territoryTypes";

// ─────────────────────────────────────────────────────
// Deterministic RNG — Mulberry32 (reused pattern)
// ─────────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Minimum garrison a defender can be driven down to before flipping. */
const GARRISON_FLOOR = 0;

/** Ticks at which the war phase auto-escalates. */
function nextPhase(current: WarPhase, ticks: number): WarPhase {
  if (current === "resolved") return current;
  if (ticks >= 6) return "assault";
  if (ticks >= 3) return "siege";
  return "skirmish";
}

function ownersEqual(a: TerritoryOwner, b: TerritoryOwner): boolean {
  return a.kind === b.kind && a.id === b.id;
}

function ownerLabel(o: TerritoryOwner): string {
  if (o.kind === "guild") return `Guild:${o.id}`;
  switch (o.id) {
    case "verdant-coil":
      return "Verdant Coil";
    case "chrome-synod":
      return "Chrome Synod";
    case "ember-vault":
      return "Ember Vault";
    case "black-city":
      return "Black City";
  }
}

/**
 * Advance one siege tick. Pure: no mutation of inputs. Returns the outcome
 * plus a new momentum; callers apply deltas to their own state.
 */
export function resolveSiegeTick(
  territory: Territory,
  war: War,
  seed: number,
): SiegeOutcome {
  const rand = mulberry32(seed + war.ticks * 0x9e3779b1);

  const phase = nextPhase(war.phase, war.ticks);

  // Attacker strength scales up with phase; defender strength scales with
  // garrison + stability. Both get a small seeded jitter.
  const phaseAggression =
    phase === "assault" ? 1.25 : phase === "siege" ? 1.05 : 0.9;
  const attackerRoll = (0.5 + rand() * 0.5) * phaseAggression;
  const defenderRoll =
    (0.4 + rand() * 0.4) * (0.6 + territory.stability * 0.8) *
    (0.8 + Math.min(territory.garrison, 200) / 200);

  const delta = attackerRoll - defenderRoll;
  // momentum carries across ticks, nudged by this exchange.
  const momentum = clamp(war.momentum * 0.6 + delta * 0.4, -1, 1);

  // Damage to garrison this tick — higher momentum = more damage.
  const baseDmg = 4 + Math.round(rand() * 6);
  const damage = Math.max(
    0,
    Math.round(baseDmg * (0.5 + Math.max(0, momentum) * 1.5)),
  );

  // Stability always erodes during a siege; erosion sharpens with momentum.
  const stabilityDelta = -clamp(0.02 + Math.max(0, momentum) * 0.08, 0, 0.2);

  // Tribute swing — attacker bleeds tribute from defender proportionally.
  const tributeSwing = clamp(Math.max(0, momentum) * 0.35, 0, 0.5);

  // Did this tick win the siege?
  const projectedGarrison = territory.garrison - damage;
  const projectedStability = territory.stability + stabilityDelta;
  const flip =
    phase === "assault" &&
    (projectedGarrison <= GARRISON_FLOOR || projectedStability <= 0.05) &&
    momentum > 0.15;

  // Attacker fully routed if momentum collapses hard during assault.
  const routed = phase === "assault" && momentum < -0.6;

  const resolved = flip || routed;
  const newOwner: TerritoryOwner | null = flip ? { ...war.attacker } : null;

  const winner: TerritoryOwner | null =
    delta > 0.05 ? war.attacker : delta < -0.05 ? war.defender : null;

  const attackerName = ownerLabel(war.attacker);
  const defenderName = ownerLabel(war.defender);
  const flavor = flip
    ? `${attackerName} takes ${territory.name}; ${defenderName} banners fall.`
    : routed
    ? `${attackerName} is routed from ${territory.name}; ${defenderName} holds the line.`
    : winner
    ? `${ownerLabel(winner)} gains ground at ${territory.name} (${phase}).`
    : `Stalemate at ${territory.name} (${phase}).`;

  return {
    winner,
    damage,
    stabilityDelta,
    tributeSwing,
    momentum,
    resolved,
    newOwner,
    flavor,
  };
}

/** Start a new war record. Pure helper. */
export function openWar(
  territoryId: string,
  attacker: TerritoryOwner,
  defender: TerritoryOwner,
  idSeed: number,
): War {
  if (ownersEqual(attacker, defender)) {
    throw new Error("openWar: attacker and defender must differ");
  }
  return {
    id: `war-${territoryId}-${idSeed >>> 0}`,
    territoryId,
    attacker: { ...attacker },
    defender: { ...defender },
    phase: "skirmish",
    ticks: 0,
    momentum: 0,
  };
}

/**
 * Apply a resolved siege tick to produce the next War + next Territory state.
 * Pure — returns new objects. Caller decides whether to keep the war record
 * when it resolves.
 */
export function applySiegeOutcome(
  territory: Territory,
  war: War,
  outcome: SiegeOutcome,
): { territory: Territory; war: War } {
  const nextTicks = war.ticks + 1;
  const nextPhaseVal = outcome.resolved
    ? "resolved"
    : nextPhase(war.phase, nextTicks);

  const nextWar: War = {
    ...war,
    ticks: nextTicks,
    phase: nextPhaseVal,
    momentum: outcome.momentum,
  };

  const nextTerritory: Territory = {
    ...territory,
    owner: outcome.newOwner ? { ...outcome.newOwner } : { ...territory.owner },
    garrison: Math.max(0, territory.garrison - outcome.damage),
    stability: clamp(territory.stability + outcome.stabilityDelta, 0, 1),
    tributeRate: { ...territory.tributeRate },
  };

  return { territory: nextTerritory, war: nextWar };
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
