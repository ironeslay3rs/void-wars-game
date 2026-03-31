export type ArenaEnemyArchetypeId = "warden" | "skirmisher" | "bulwark";

export type ArenaEnemyProfile = {
  id: ArenaEnemyArchetypeId;
  name: string;
  tagline: string;
  maxHp: number;
  minDamage: number;
  maxDamage: number;
  critChance: number;
  critMultiplier: number;
};

/** Uniform pick — roll again on arena reset for variety. */
export function rollArenaEnemyArchetype(): ArenaEnemyArchetypeId {
  const r = Math.random();
  if (r < 1 / 3) return "warden";
  if (r < 2 / 3) return "skirmisher";
  return "bulwark";
}

/** Ranked/tournament SR swing on victory (bulwark = longer duel). */
export function getArenaVictorySrDelta(archetype: ArenaEnemyArchetypeId): number {
  if (archetype === "bulwark") return 18;
  if (archetype === "skirmisher") return 12;
  return 15;
}

/** Negative values — scaled loss magnitude (skirmisher = punisher if you slip). */
export function getArenaDefeatSrDelta(archetype: ArenaEnemyArchetypeId): number {
  if (archetype === "bulwark") return -10;
  if (archetype === "skirmisher") return -14;
  return -12;
}

/** Victory payout multiplier applied after practice scaling (ranked full-weight fights). */
export function getArenaArchetypePayoutMult(archetype: ArenaEnemyArchetypeId): number {
  if (archetype === "bulwark") return 1.08;
  if (archetype === "skirmisher") return 0.94;
  return 1;
}

/** Every Nth enemy counter is telegraphed and hits harder (combat log + prep readability). */
export const ARENA_ENEMY_TELEGRAPH_INTERVAL = 3;
export const ARENA_ENEMY_TELEGRAPH_DAMAGE_MULT = 1.22;

export function getArenaEnemyProfile(
  rankLevel: number,
  archetype: ArenaEnemyArchetypeId,
): ArenaEnemyProfile {
  const L = rankLevel;
  if (archetype === "warden") {
    return {
      id: "warden",
      name: "Arena Warden",
      tagline: "Balanced enforcement — the baseline duel",
      maxHp: 360 + L * 34,
      minDamage: 20 + L * 4,
      maxDamage: 34 + L * 5,
      critChance: 0.08,
      critMultiplier: 1.35,
    };
  }
  if (archetype === "skirmisher") {
    return {
      id: "skirmisher",
      name: "Ripwire Skirmisher",
      tagline: "Glass cannon — outspeeds, shatters under focus",
      maxHp: 300 + L * 28,
      minDamage: 24 + L * 4,
      maxDamage: 40 + L * 5,
      critChance: 0.11,
      critMultiplier: 1.42,
    };
  }
  return {
    id: "bulwark",
    name: "Linebreaker Bulwark",
    tagline: "Plated bruiser — fewer spikes, longer grind",
    maxHp: 440 + L * 38,
    minDamage: 16 + L * 4,
    maxDamage: 28 + L * 5,
    critChance: 0.06,
    critMultiplier: 1.3,
  };
}
