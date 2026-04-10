import type { PlayerState, ResourcesState } from "@/features/game/gameTypes";
import type { CreatureDefinition } from "@/features/combat/creatureData";
import { getPathAlignedFieldLootMultiplier } from "@/features/economy/pathGatheringYield";
import { rollVoidFieldLoot } from "@/features/void-maps/rollVoidFieldLoot";
import { getPlayerLoadoutCombatModifiers } from "@/features/combat/loadoutCombatStats";
import {
  getActiveShellDamageBonusPct,
  getActiveShellDamageReductionPct,
} from "@/features/combat/shellAbilities";

export type EncounterOutcome = "victory" | "defeat" | "retreat";

export type EncounterResolution = {
  outcome: EncounterOutcome;
  playerHpStart: number;
  playerHpEnd: number;
  creatureHpStart: number;
  creatureHpEnd: number;
  conditionCost: number;
  rankXpEarned: number;
  loot: Partial<ResourcesState>;
  narrative: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function rigBonus(player: PlayerState) {
  switch (player.fieldLoadoutProfile) {
    case "assault":
      return 0.08;
    case "breach":
      return 0.06;
    case "support":
      return 0.04;
    default:
      return 0;
  }
}

export function resolveEncounter(params: {
  player: PlayerState;
  creature: CreatureDefinition;
  seed: string;
  retreat?: boolean;
}): EncounterResolution {
  const { player, creature } = params;

  const playerHpStart = clamp(Math.round(player.condition), 0, 100);
  const creatureHpStart = creature.hp;

  if (params.retreat) {
    return {
      outcome: "retreat",
      playerHpStart,
      playerHpEnd: playerHpStart,
      creatureHpStart,
      creatureHpEnd: creatureHpStart,
      conditionCost: 0,
      rankXpEarned: 0,
      loot: {},
      narrative: "You withdrew before contact. No payout, no cost—just time lost.",
    };
  }

  const conditionFactor = clamp(playerHpStart / 100, 0.25, 1);
  const loadout = getPlayerLoadoutCombatModifiers(player);
  const careerBonus =
    player.careerFocus === "combat" ? 0.08 : player.careerFocus === "gathering" ? 0.03 : 0;
  // M3: active shell buffs apply to encounter combat as a flat power boost.
  // Surge (+50%) meaningfully improves the player's threat calc and win chance.
  const buffBonusPct = getActiveShellDamageBonusPct(
    player.activeShellBuffs ?? [],
    Date.now(),
  );
  const buffMult = 1 + buffBonusPct / 100;
  const power = (1 + rigBonus(player) + careerBonus) * loadout.attackMultiplier * buffMult;

  const playerAtk = 10 * power * conditionFactor;
  const playerDef = 6 * power * conditionFactor * loadout.defenseMultiplier;

  const creatureThreat = creature.attack * 1.1 + creature.defense * 1.4 + creature.hp * 0.22;
  const playerThreat = playerAtk * 1.6 + playerDef * 1.1 + playerHpStart * 0.08;

  const winChance = clamp(playerThreat / (playerThreat + creatureThreat), 0.1, 0.92);

  // Deterministic-ish roll from seed.
  let roll = 0;
  for (let i = 0; i < params.seed.length; i++) roll = (roll + params.seed.charCodeAt(i) * (i + 7)) % 1000;
  const roll01 = (roll % 1000) / 1000;

  const victory = roll01 <= winChance;

  // M3: Wolf-Leap (and future defensive buffs) reduce incoming condition
  // cost from creature encounters. The reduction % applies to the final
  // condition cost after all other multipliers.
  const defReductionPct = getActiveShellDamageReductionPct(
    player.activeShellBuffs ?? [],
    Date.now(),
  );
  const defMult = Math.max(0, 1 - defReductionPct / 100);

  const baseCost = creature.rarity === "rare" ? 12 : creature.rarity === "uncommon" ? 8 : 5;
  const conditionCost = clamp(
    Math.round(
      (baseCost + (1 - conditionFactor) * 8) *
        loadout.conditionCostMultiplier *
        defMult,
    ),
    3,
    25,
  );

  const playerHpEnd = clamp(playerHpStart - conditionCost, 0, 100);

  if (!victory) {
    return {
      outcome: "defeat",
      playerHpStart,
      playerHpEnd,
      creatureHpStart,
      creatureHpEnd: creatureHpStart,
      conditionCost,
      rankXpEarned: 0,
      loot: {},
      narrative:
        "The encounter went bad. You escaped, but it cost condition and confidence.",
    };
  }

  // Victory: 1–2 themed loot rolls + guaranteed drops.
  const rolled = rollVoidFieldLoot({
    zoneLootTheme: creature.lootTheme,
    mobId: `encounter-${creature.id}`,
    isBoss: false,
    seed: params.seed,
  });

  const pathLootMult = getPathAlignedFieldLootMultiplier(
    player.factionAlignment,
    creature.lootTheme,
  );
  const loot: Partial<ResourcesState> = { ...(creature.guaranteedDrops ?? {}) };
  for (const line of rolled) {
    const amt = Math.max(0, Math.round(line.amount * pathLootMult));
    loot[line.resource] = (loot[line.resource] ?? 0) + amt;
  }

  const rankXpEarned = creature.rarity === "rare" ? 18 : creature.rarity === "uncommon" ? 12 : 8;

  return {
    outcome: "victory",
    playerHpStart,
    playerHpEnd,
    creatureHpStart,
    creatureHpEnd: 0,
    conditionCost,
    rankXpEarned,
    loot,
    narrative: "Target down. Salvage secured. Return before the field takes more.",
  };
}

