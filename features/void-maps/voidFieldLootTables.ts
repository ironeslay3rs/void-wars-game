import type { ResourceKey } from "@/features/game/gameTypes";
import type { VoidZoneLootTheme } from "@/features/void-maps/zoneData";

export type LootRarity = "common" | "uncommon" | "rare";

export type VoidFieldLootEntry = {
  resource: ResourceKey;
  weight: number;
  min: number;
  max: number;
  rarity: LootRarity;
};

export type VoidFieldLootTable = {
  normal: VoidFieldLootEntry[];
  bossBonus?: VoidFieldLootEntry[];
  /** Boss-only named materials (phase 2); rolled only when `isBoss`. */
  bossNamedMaterials?: VoidFieldLootEntry[];
};

export type VoidFieldLootProfileId =
  | "ash-scavenger"
  | "relay-husk"
  | "void-stalker"
  | "bio-scavenger"
  | "shell-default"
  | "shell-boss";

export function getVoidFieldLootProfileIdFromMobId(
  mobId: string,
): VoidFieldLootProfileId {
  // Realtime spawn ids (existing).
  if (mobId.startsWith("rt-")) return "relay-husk";
  if (mobId.startsWith("gc-")) return "void-stalker";
  if (mobId.startsWith("vf-")) return "ash-scavenger";
  if (mobId.startsWith("gr-")) return "void-stalker";

  // Shell mobs encode a profile, but keep a safe fallback.
  if (mobId.startsWith("shell-boss-")) return "shell-boss";
  if (mobId.startsWith("shell-")) return "shell-default";

  return "shell-default";
}

function clampEntry(e: VoidFieldLootEntry): VoidFieldLootEntry {
  const min = Math.max(0, Math.floor(e.min));
  const max = Math.max(min, Math.floor(e.max));
  return { ...e, min, max, weight: Math.max(0, e.weight) };
}

const ashMechaCommon = ([
  { resource: "scrapAlloy", weight: 55, min: 1, max: 3, rarity: "common" },
  { resource: "credits", weight: 35, min: 2, max: 6, rarity: "common" },
  { resource: "ironOre", weight: 20, min: 1, max: 3, rarity: "common" },
] satisfies VoidFieldLootEntry[]).map(clampEntry);

const ashMechaUncommon = ([
  { resource: "runeDust", weight: 45, min: 1, max: 2, rarity: "uncommon" },
  { resource: "scrapAlloy", weight: 25, min: 2, max: 4, rarity: "uncommon" },
  { resource: "credits", weight: 20, min: 6, max: 12, rarity: "uncommon" },
] satisfies VoidFieldLootEntry[]).map(clampEntry);

const ashMechaRare = ([
  { resource: "emberCore", weight: 55, min: 1, max: 1, rarity: "rare" },
  { resource: "runeDust", weight: 35, min: 2, max: 3, rarity: "rare" },
] satisfies VoidFieldLootEntry[]).map(clampEntry);

const bioRotCommon = ([
  { resource: "bioSamples", weight: 55, min: 1, max: 3, rarity: "common" },
  { resource: "credits", weight: 35, min: 2, max: 6, rarity: "common" },
  { resource: "mossRations", weight: 12, min: 1, max: 1, rarity: "common" },
] satisfies VoidFieldLootEntry[]).map(clampEntry);

const bioRotUncommon = ([
  { resource: "bioSamples", weight: 35, min: 2, max: 4, rarity: "uncommon" },
  { resource: "runeDust", weight: 35, min: 1, max: 2, rarity: "uncommon" },
  { resource: "credits", weight: 20, min: 6, max: 12, rarity: "uncommon" },
] satisfies VoidFieldLootEntry[]).map(clampEntry);

const bioRotRare = ([
  { resource: "emberCore", weight: 40, min: 1, max: 1, rarity: "rare" },
  { resource: "runeDust", weight: 45, min: 2, max: 3, rarity: "rare" },
] satisfies VoidFieldLootEntry[]).map(clampEntry);

const voidPureCommon = ([
  { resource: "runeDust", weight: 55, min: 1, max: 3, rarity: "common" },
  { resource: "credits", weight: 35, min: 2, max: 6, rarity: "common" },
  { resource: "emberCore", weight: 10, min: 1, max: 1, rarity: "common" },
] satisfies VoidFieldLootEntry[]).map(clampEntry);

const voidPureUncommon = ([
  { resource: "runeDust", weight: 45, min: 2, max: 4, rarity: "uncommon" },
  { resource: "emberCore", weight: 25, min: 1, max: 1, rarity: "uncommon" },
  { resource: "credits", weight: 20, min: 6, max: 12, rarity: "uncommon" },
] satisfies VoidFieldLootEntry[]).map(clampEntry);

const voidPureRare = ([
  { resource: "emberCore", weight: 45, min: 1, max: 2, rarity: "rare" },
  { resource: "runeDust", weight: 45, min: 3, max: 5, rarity: "rare" },
] satisfies VoidFieldLootEntry[]).map(clampEntry);

const bossNamedBio = (
  [
    {
      resource: "coilboundLattice",
      weight: 55,
      min: 1,
      max: 1,
      rarity: "rare" as const,
    },
    {
      resource: "ironHeart",
      weight: 42,
      min: 1,
      max: 1,
      rarity: "rare" as const,
    },
  ] satisfies VoidFieldLootEntry[]
).map(clampEntry);

const bossNamedMecha = (
  [
    {
      resource: "ashSynodRelic",
      weight: 55,
      min: 1,
      max: 1,
      rarity: "rare" as const,
    },
    {
      resource: "ironHeart",
      weight: 42,
      min: 1,
      max: 1,
      rarity: "rare" as const,
    },
  ] satisfies VoidFieldLootEntry[]
).map(clampEntry);

const bossNamedPure = (
  [
    {
      resource: "vaultLatticeShard",
      weight: 55,
      min: 1,
      max: 1,
      rarity: "rare" as const,
    },
    {
      resource: "ironHeart",
      weight: 42,
      min: 1,
      max: 1,
      rarity: "rare" as const,
    },
  ] satisfies VoidFieldLootEntry[]
).map(clampEntry);

export const voidFieldLootTablesByTheme: Record<
  VoidZoneLootTheme,
  VoidFieldLootTable
> = {
  ash_mecha: {
    normal: [...ashMechaCommon, ...ashMechaUncommon, ...ashMechaRare],
    bossBonus: [...ashMechaUncommon, ...ashMechaRare],
    bossNamedMaterials: bossNamedMecha,
  },
  bio_rot: {
    normal: [...bioRotCommon, ...bioRotUncommon, ...bioRotRare],
    bossBonus: [...bioRotUncommon, ...bioRotRare],
    bossNamedMaterials: bossNamedBio,
  },
  void_pure: {
    normal: [...voidPureCommon, ...voidPureUncommon, ...voidPureRare],
    bossBonus: [...voidPureUncommon, ...voidPureRare],
    bossNamedMaterials: bossNamedPure,
  },
};

