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
  /** Sprite path under /assets/creatures/. If absent, falls back to faction sprite. */
  sprite?: string;
  /** Optional extra guaranteed drops on victory (in addition to themed roll). */
  guaranteedDrops?: Partial<Record<ResourceKey, number>>;
};

export const creatures: CreatureDefinition[] = [
  // ── ASH / MECHA zone creatures ──
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
    sprite: "/assets/creatures/creature-mech-spider.png",
    guaranteedDrops: { ironOre: 1 },
  },
  {
    id: "infernal-scorpion",
    name: "Infernal Scorpion",
    zoneId: "rift-maw",
    lootTheme: "ash_mecha",
    rarity: "common",
    hp: 34,
    attack: 9,
    defense: 3,
    description:
      "A heat-hardened predator that burrows through machine nests. Fast, armored tail.",
    sprite: "/assets/creatures/creature-infernal-scorpion.png",
    guaranteedDrops: { scrapAlloy: 1 },
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
    sprite: "/assets/creatures/creature-armored-crawler.png",
    guaranteedDrops: { scrapAlloy: 1 },
  },
  {
    id: "ember-brute",
    name: "Ember Brute",
    zoneId: "ash-relay",
    lootTheme: "ash_mecha",
    rarity: "uncommon",
    hp: 56,
    attack: 11,
    defense: 5,
    description:
      "A forge-scarred heavy. Slow but devastating at close range.",
    sprite: "/assets/creatures/creature-ember-brute.png",
    guaranteedDrops: { emberCore: 1, ironOre: 2 },
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
    sprite: "/assets/creatures/creature-iron-brute.png",
    guaranteedDrops: { emberCore: 1 },
  },
  {
    id: "elite-scorpion",
    name: "Scorpion Matriarch",
    zoneId: "rift-maw",
    lootTheme: "ash_mecha",
    rarity: "rare",
    hp: 65,
    attack: 13,
    defense: 5,
    description:
      "The brood mother. Faster than her children and twice as venomous.",
    sprite: "/assets/creatures/creature-infernal-scorpion-elite.png",
    guaranteedDrops: { scrapAlloy: 3, ironOre: 2 },
  },

  // ── BIO / ROT zone creatures ──
  {
    id: "ember-wolf",
    name: "Ember Wolf",
    zoneId: "howling-scar",
    lootTheme: "bio_rot",
    rarity: "common",
    hp: 28,
    attack: 9,
    defense: 2,
    description:
      "A pack hunter with embers in its fur. Alone it's nothing; in a group it's lethal.",
    sprite: "/assets/creatures/creature-ember-wolf.png",
    guaranteedDrops: { bioSamples: 1 },
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
    sprite: "/assets/creatures/creature-plague-toad.png",
    guaranteedDrops: { bioSamples: 1 },
  },
  {
    id: "shadow-wolf",
    name: "Shadow Wolf",
    zoneId: "howling-scar",
    lootTheme: "bio_rot",
    rarity: "rare",
    hp: 52,
    attack: 13,
    defense: 3,
    description:
      "An alpha predator. Hunts alone. Drops are worth the condition cost.",
    sprite: "/assets/creatures/creature-shadow-wolf.png",
    guaranteedDrops: { bioSamples: 3, runeDust: 1 },
  },
  {
    id: "plague-drake",
    name: "Plague Drake",
    zoneId: "howling-scar",
    lootTheme: "bio_rot",
    rarity: "rare",
    hp: 62,
    attack: 14,
    defense: 4,
    description:
      "A corrupted wyvern leaking spore clouds. The Bonehowl call them walking biohazards.",
    sprite: "/assets/creatures/creature-plague-drake.png",
    guaranteedDrops: { bioSamples: 4, emberCore: 1 },
  },

  // ── VOID / PURE zone creatures ──
  {
    id: "bat-lurker",
    name: "Bat Lurker",
    zoneId: "echo-ruins",
    lootTheme: "void_pure",
    rarity: "common",
    hp: 24,
    attack: 7,
    defense: 1,
    description:
      "A cave-dwelling echo feeder. Fragile but fast — hard to hit, easy to kill.",
    sprite: "/assets/creatures/creature-bat-lurker.png",
    guaranteedDrops: { runeDust: 1 },
  },
  {
    id: "frost-wolf",
    name: "Frost Wolf",
    zoneId: "echo-ruins",
    lootTheme: "void_pure",
    rarity: "uncommon",
    hp: 46,
    attack: 11,
    defense: 4,
    description:
      "A Pure-zone predator with ice-sheathed claws. Hits clean and cold.",
    sprite: "/assets/creatures/creature-frost-wolf.png",
    guaranteedDrops: { runeDust: 2 },
  },
  {
    id: "void-spider",
    name: "Void Spider",
    zoneId: "echo-ruins",
    lootTheme: "void_pure",
    rarity: "uncommon",
    hp: 40,
    attack: 10,
    defense: 3,
    description:
      "A web-spinning echo predator. It doesn't eat you — it absorbs your resonance.",
    sprite: "/assets/creatures/creature-void-spider.png",
    guaranteedDrops: { runeDust: 1, emberCore: 1 },
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

