import type { PlayerState } from "@/features/game/gameTypes";
import { itemRankToNumeric } from "@/features/inventory/itemRanks";
import { getEquippedItem } from "@/features/player/loadoutState";

export type WeaponCombatProfile = {
  family: "melee" | "ranged";
  strikeRangePct: number;
  damageBonusPct: number;
};

export type ArmorCombatProfile = {
  mitigationPct: number;
};

const DEFAULT_WEAPON_PROFILE: WeaponCombatProfile = {
  family: "melee",
  strikeRangePct: 10,
  damageBonusPct: 0,
};

const WEAPON_PROFILE_BY_ID: Record<string, WeaponCombatProfile> = {
  "bio-sporeneedle-launcher": {
    family: "ranged",
    strikeRangePct: 16,
    damageBonusPct: 12,
  },
  "bio-mirefang-sidearm": {
    family: "ranged",
    strikeRangePct: 14,
    damageBonusPct: 7,
  },
  "mecha-synod-railcarbine": {
    family: "ranged",
    strikeRangePct: 18,
    damageBonusPct: 14,
  },
  "mecha-arc-welder-pistol": {
    family: "ranged",
    strikeRangePct: 13,
    damageBonusPct: 8,
  },
  "pure-emberglass-pike": {
    family: "melee",
    strikeRangePct: 11,
    damageBonusPct: 15,
  },
  "pure-whisper-coil": {
    family: "ranged",
    strikeRangePct: 15,
    damageBonusPct: 9,
  },
  "unbound-rustline-carbine": {
    family: "ranged",
    strikeRangePct: 15,
    damageBonusPct: 9,
  },
  "unbound-scrapburst-repeater": {
    family: "ranged",
    strikeRangePct: 12,
    damageBonusPct: 5,
  },
  "scrap-blade-t1": {
    family: "melee",
    strikeRangePct: 9,
    damageBonusPct: 6,
  },
  "scrap-blade-t2": {
    family: "melee",
    strikeRangePct: 10,
    damageBonusPct: 10,
  },
};

const ARMOR_PROFILE_BY_ID: Record<string, ArmorCombatProfile> = {
  "bio-carapace-weave": { mitigationPct: 12 },
  "mecha-servo-shell-harness": { mitigationPct: 13 },
  "pure-ashen-mantle": { mitigationPct: 11 },
  "unbound-patchwork-shell": { mitigationPct: 7 },
  "bone-plating-t1": { mitigationPct: 9 },
  "bone-plating-t2": { mitigationPct: 12 },
};

export function describeLoadoutItemCombatProfile(itemId: string): string | null {
  const weapon = WEAPON_PROFILE_BY_ID[itemId];
  if (weapon) {
    const family = weapon.family === "ranged" ? "Ranged" : "Melee";
    return `${family} weapon · range ${weapon.strikeRangePct}% · +${weapon.damageBonusPct}% strike`;
  }
  const armor = ARMOR_PROFILE_BY_ID[itemId];
  if (armor) {
    return `Armor core · -${armor.mitigationPct}% incoming damage`;
  }
  return null;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getEquippedWeaponProfile(player: PlayerState): WeaponCombatProfile {
  const weapon = getEquippedItem(
    player.loadoutSlots,
    "weapon",
    player.factionAlignment,
    player.craftedInventory,
  );
  if (!weapon) return DEFAULT_WEAPON_PROFILE;
  return WEAPON_PROFILE_BY_ID[weapon.id] ?? DEFAULT_WEAPON_PROFILE;
}

function getEquippedArmorMitigationPct(player: PlayerState) {
  const armor = getEquippedItem(
    player.loadoutSlots,
    "armor",
    player.factionAlignment,
    player.craftedInventory,
  );
  if (!armor) return 0;
  return ARMOR_PROFILE_BY_ID[armor.id]?.mitigationPct ?? 0;
}

export function getPlayerStrikeRangePct(player: PlayerState) {
  return getEquippedWeaponProfile(player).strikeRangePct;
}

export function getPlayerLoadoutCombatModifiers(player: PlayerState) {
  const weapon = getEquippedWeaponProfile(player);
  const equippedWeapon = getEquippedItem(
    player.loadoutSlots,
    "weapon",
    player.factionAlignment,
    player.craftedInventory,
  );
  const equippedArmor = getEquippedItem(
    player.loadoutSlots,
    "armor",
    player.factionAlignment,
    player.craftedInventory,
  );
  const weaponRank =
    equippedWeapon?.rankTier ? itemRankToNumeric(equippedWeapon.rankTier) : 1;
  const armorRank =
    equippedArmor?.rankTier ? itemRankToNumeric(equippedArmor.rankTier) : 1;
  const weaponRankBonusPct = (weaponRank - 1) * 6;
  const armorRankBonusPct = (armorRank - 1) * 4;
  const armorMitigationPct =
    getEquippedArmorMitigationPct(player) + armorRankBonusPct;
  const rangeWithRank = weapon.strikeRangePct + (weaponRank - 1) * 1.5;
  const damageWithRank = weapon.damageBonusPct + weaponRankBonusPct;
  return {
    weaponFamily: weapon.family,
    strikeRangePct: rangeWithRank,
    damageBonusPct: damageWithRank,
    armorMitigationPct,
    attackMultiplier: 1 + damageWithRank / 100,
    defenseMultiplier: 1 + armorMitigationPct / 100,
    incomingDamageMultiplier: clamp(1 - armorMitigationPct / 100, 0.65, 1),
    conditionCostMultiplier: clamp(1 - armorMitigationPct / 200, 0.75, 1),
  };
}

