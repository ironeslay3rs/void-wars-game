import type { BossDefinition, BossLootEntry } from "@/features/combat/bossData";
import type { PlayerState, ResourceKey, ResourcesState } from "@/features/game/gameTypes";
import { getPlayerLoadoutCombatModifiers } from "@/features/combat/loadoutCombatStats";

export type BossPhase = "normal" | "frenzy";

export type BossFightState = {
  startedAt: number;
  startedCondition: number;
  playerCondition: number;
  bossHp: number;
  phase: BossPhase;
  nextPlayerAttackAt: number;
  nextBossAttackAt: number;
  nextHowlAt: number;
  fearDebuffUntil: number;
  dodgeWindowUntil: number;
  howlTriggers: number;
  isResolved: boolean;
  outcome: "victory" | "defeat" | null;
};

export type BossFightResult = {
  outcome: "victory" | "defeat";
  rankXp: number;
  influenceGain: number;
  conditionLoss: number;
  lootDrops: BossLootEntry[];
  resourcePayout: Partial<ResourcesState>;
  lootLost: Partial<ResourcesState>;
  narrative: string;
};

const PLAYER_ATTACK_INTERVAL_MS = 1200;
const BOSS_ATTACK_INTERVAL_MS = 1800;
const FRENZY_BOSS_ATTACK_INTERVAL_MS = 900;
const DODGE_REDUCTION = 0.35;
const FEAR_DAMAGE_MULT = 0.75;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hash01(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

function mergeResources(
  base: Partial<ResourcesState>,
  add: Partial<ResourcesState>,
): Partial<ResourcesState> {
  const next: Partial<ResourcesState> = { ...base };
  (Object.entries(add) as Array<[ResourceKey, number]>).forEach(([k, v]) => {
    if (!v || v <= 0) return;
    next[k] = (next[k] ?? 0) + v;
  });
  return next;
}

function currentPhase(boss: BossDefinition, bossHp: number): BossPhase {
  return bossHp <= boss.hp * boss.frenzyThresholdPct ? "frenzy" : "normal";
}

function playerDamagePerHit(
  player: PlayerState,
  state: BossFightState,
  now: number,
) {
  const loadout = getPlayerLoadoutCombatModifiers(player);
  const rigBonus =
    player.fieldLoadoutProfile === "assault"
      ? 8
      : player.fieldLoadoutProfile === "breach"
        ? 6
        : 4;
  const loadoutCount = Object.values(player.loadoutSlots).filter(Boolean).length;
  const loadoutBonus = loadoutCount * 2;
  const careerBonus = player.careerFocus === "combat" ? 6 : 2;
  const fearMult = state.fearDebuffUntil > now ? FEAR_DAMAGE_MULT : 1;
  const conditionMult = clamp(player.condition / 100, 0.4, 1);
  return Math.max(
    6,
    Math.round(
      (18 + rigBonus + loadoutBonus + careerBonus) *
        conditionMult *
        fearMult *
        loadout.attackMultiplier,
    ),
  );
}

function bossDamagePerHit(
  boss: BossDefinition,
  state: BossFightState,
  now: number,
  player: PlayerState,
) {
  const loadout = getPlayerLoadoutCombatModifiers(player);
  const phaseMult = state.phase === "frenzy" ? 1.15 : 1;
  const dodgeMult = now <= state.dodgeWindowUntil ? DODGE_REDUCTION : 1;
  return Math.max(
    5,
    Math.round(
      boss.attack * phaseMult * dodgeMult * loadout.incomingDamageMultiplier,
    ),
  );
}

export function createBossFightState(
  player: PlayerState,
  boss: BossDefinition,
  now: number,
): BossFightState {
  return {
    startedAt: now,
    startedCondition: player.condition,
    playerCondition: player.condition,
    bossHp: boss.hp,
    phase: "normal",
    nextPlayerAttackAt: now + PLAYER_ATTACK_INTERVAL_MS,
    nextBossAttackAt: now + BOSS_ATTACK_INTERVAL_MS,
    nextHowlAt: now + boss.howlCooldownMs,
    fearDebuffUntil: 0,
    dodgeWindowUntil: 0,
    howlTriggers: 0,
    isResolved: false,
    outcome: null,
  };
}

export function activateDodgeWindow(state: BossFightState, now: number) {
  return {
    ...state,
    dodgeWindowUntil: now + 900,
  };
}

export function tickBossFight(params: {
  state: BossFightState;
  player: PlayerState;
  boss: BossDefinition;
  now: number;
  autoAttackEnabled: boolean;
}) {
  const { player, boss, now, autoAttackEnabled } = params;
  const next = { ...params.state };
  if (next.isResolved) return next;

  if (now >= next.nextHowlAt) {
    next.fearDebuffUntil = now + 3000;
    next.nextHowlAt = now + boss.howlCooldownMs;
    next.howlTriggers += 1;
  }

  if (autoAttackEnabled && now >= next.nextPlayerAttackAt) {
    const dmg = Math.max(1, playerDamagePerHit(player, next, now) - boss.defense);
    next.bossHp = clamp(next.bossHp - dmg, 0, boss.hp);
    next.nextPlayerAttackAt = now + PLAYER_ATTACK_INTERVAL_MS;
  }

  next.phase = currentPhase(boss, next.bossHp);

  const bossAttackInterval =
    next.phase === "frenzy" ? FRENZY_BOSS_ATTACK_INTERVAL_MS : BOSS_ATTACK_INTERVAL_MS;

  if (now >= next.nextBossAttackAt) {
    const dmg = bossDamagePerHit(boss, next, now, player);
    next.playerCondition = clamp(next.playerCondition - dmg, 0, 100);
    next.nextBossAttackAt = now + bossAttackInterval;
  }

  if (next.bossHp <= 0) {
    next.isResolved = true;
    next.outcome = next.startedCondition > 30 ? "victory" : "defeat";
  } else if (next.playerCondition <= 0) {
    next.isResolved = true;
    next.outcome = "defeat";
  }

  return next;
}

export function resolveBossLoot(boss: BossDefinition, seed: string) {
  const drops: BossLootEntry[] = [];
  let payout: Partial<ResourcesState> = {};
  boss.lootTable.forEach((entry, idx) => {
    const roll = hash01(`${seed}:${entry.id}:${idx}`);
    if (roll <= entry.chance) {
      drops.push(entry);
      payout = mergeResources(payout, entry.resourceGrants ?? {});
    }
  });
  return { drops, payout };
}

export function buildBossFightResult(params: {
  state: BossFightState;
  player: PlayerState;
  boss: BossDefinition;
  seed: string;
}): BossFightResult {
  const { state, player, boss, seed } = params;
  const conditionLoss = Math.max(0, Math.round(state.startedCondition - state.playerCondition));

  if (state.outcome !== "victory") {
    const lootLost: Partial<ResourcesState> = {};
    (Object.entries(player.fieldLootGainedThisRun ?? {}) as Array<[ResourceKey, number]>).forEach(
      ([key, amount]) => {
        if (!amount || amount <= 0) return;
        lootLost[key] = Math.max(1, Math.floor(amount * 0.35));
      },
    );
    return {
      outcome: "defeat",
      rankXp: 0,
      influenceGain: 0,
      conditionLoss: Math.max(15, conditionLoss),
      lootDrops: [],
      resourcePayout: {},
      lootLost,
      narrative:
        "Hollowfang overwhelms the lane. You withdraw with heavy strain and lose part of your carried salvage.",
    };
  }

  const { drops, payout } = resolveBossLoot(boss, seed);
  return {
    outcome: "victory",
    rankXp: 120,
    influenceGain: 12,
    conditionLoss,
    lootDrops: drops,
    resourcePayout: payout,
    lootLost: {},
    narrative:
      "Hollowfang falls. The field goes quiet long enough for extraction and prestige payout.",
  };
}

