import type { ResourceKey } from "@/features/game/gameTypes";
import type { VoidZoneId, VoidZoneLootTheme } from "@/features/void-maps/zoneData";

export type CreatureRarity = "common" | "uncommon" | "rare";

export type CreatureDefinition = {
  id: string;
  name: string;
  zoneId: VoidZoneId | "any";
  lootTheme: VoidZoneLootTheme;
  rarity: CreatureRarity;
  hp: number;
  attack: number;
  defense: number;
  description: string;
  /** Optional extra guaranteed drops on victory (in addition to themed roll). */
  guaranteedDrops?: Partial<Record<ResourceKey, number>>;
};

export const creatures: CreatureDefinition[] = [
  {
    id: "rustfang",
    name: "Rustfang",
    zoneId: "any",
    lootTheme: "ash_mecha",
    rarity: "common",
    hp: 30,
    attack: 8,
    defense: 2,
    description:
      "A scavenger-beast plated in scrap and dust. Low danger, fast bites.",
    guaranteedDrops: { ironOre: 1 },
  },
  {
    id: "hollowed-drone",
    name: "Hollowed Drone",
    zoneId: "ash-relay",
    lootTheme: "ash_mecha",
    rarity: "uncommon",
    hp: 50,
    attack: 10,
    defense: 4,
    description:
      "A broken relay drone still obeying old directives. It hits harder than it looks.",
    guaranteedDrops: { scrapAlloy: 1 },
  },
  {
    id: "spore-crawler",
    name: "Spore Crawler",
    zoneId: "howling-scar",
    lootTheme: "bio_rot",
    rarity: "uncommon",
    hp: 44,
    attack: 9,
    defense: 3,
    description:
      "A wet-bodied crawler that sheds corrosive pods. Bio-zone staple threat.",
    guaranteedDrops: { bioSamples: 1 },
  },
  {
    id: "scrap-sentinel",
    name: "Scrap Sentinel",
    zoneId: "ash-relay",
    lootTheme: "ash_mecha",
    rarity: "rare",
    hp: 70,
    attack: 12,
    defense: 6,
    description:
      "A standing frame assembled from convoy remains. It does not retreat.",
    guaranteedDrops: { emberCore: 1 },
  },
  {
    id: "void-wisp",
    name: "Void Wisp",
    zoneId: "echo-ruins",
    lootTheme: "void_pure",
    rarity: "rare",
    hp: 42,
    attack: 14,
    defense: 2,
    description:
      "A Pure-saturated echo that lashes the mind. Rare, volatile, and valuable.",
    guaranteedDrops: { runeDust: 2 },
  },
];

export function pickCreatureForZone(zoneId: VoidZoneId, seed01: number) {
  const pool = creatures.filter(
    (c) => c.zoneId === "any" || c.zoneId === zoneId,
  );
  if (pool.length === 0) return creatures[0];
  const idx = Math.max(0, Math.min(pool.length - 1, Math.floor(seed01 * pool.length)));
  return pool[idx];
}

