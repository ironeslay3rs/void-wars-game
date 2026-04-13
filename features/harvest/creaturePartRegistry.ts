/**
 * Block 4 Task 4.2 — seed registry of harvestable creature parts.
 *
 * ~25 parts across three schools + Hollowfang boss trophies.
 *
 * Canon citations:
 *   - lore-canon/01 Master Canon/Schools/The Three Evolution Schools.md
 *     "Bio: flesh, DNA, hunting, mutation, living power."
 *     "Mecha: precision, enhancement, cybernetics, analysis, engineered perfection."
 *     "Pure: memory, spirit, fire, wisdom, inner law."
 *   - lore-canon/CLAUDE.md — Verdant Coil / Chrome Synod / Ember Vault.
 *   - features/hollowfang/hollowfangProfile.ts — Void-adapted predator;
 *     Hollowfang trophies are epic/legendary unique drops.
 */

import type { CreaturePart } from "@/features/harvest/trophyTypes";

// ────────────────────────────────────────────────────────────────
// Verdant Coil (Bio) — organs, blood vials, mutation glands, fangs
// ────────────────────────────────────────────────────────────────

const bioParts: CreaturePart[] = [
  {
    id: "bio-stalker-fang",
    displayName: "Stalker Fang",
    school: "bio",
    kind: "fang",
    rarity: "common",
    sourceCreature: "verdant-stalker",
    bodyRegion: "head",
    flavor: "A curved predator fang, still wet with Verdant Coil musk.",
  },
  {
    id: "bio-stalker-gland",
    displayName: "Mutation Gland",
    school: "bio",
    kind: "gland",
    rarity: "uncommon",
    sourceCreature: "verdant-stalker",
    bodyRegion: "organs",
    flavor: "The gland that writes new instincts into flesh.",
    minProfessionRank: 2,
  },
  {
    id: "bio-broodling-organ",
    displayName: "Broodling Heart-Organ",
    school: "bio",
    kind: "organ",
    rarity: "uncommon",
    sourceCreature: "coil-broodling",
    bodyRegion: "organs",
    flavor: "Still twitching — Verdant Coil broodlings die loud.",
  },
  {
    id: "bio-broodling-hide",
    displayName: "Broodling Hide",
    school: "bio",
    kind: "hide",
    rarity: "common",
    sourceCreature: "coil-broodling",
    bodyRegion: "torso",
    flavor: "Tough skin pocked with spawn-scars.",
  },
  {
    id: "bio-boar-blood",
    displayName: "Blood Tithe Vial",
    school: "bio",
    kind: "blood",
    rarity: "uncommon",
    sourceCreature: "blood-tithe-boar",
    bodyRegion: "torso",
    flavor: "Warm Verdant Coil blood — a living instinct in a vial.",
    requiredKillMethod: "clean",
  },
  {
    id: "bio-boar-rare-gland",
    displayName: "Apex Mutation Gland",
    school: "bio",
    kind: "gland",
    rarity: "rare",
    sourceCreature: "blood-tithe-boar",
    bodyRegion: "organs",
    flavor: "Only finishers leave the gland intact.",
    requiredKillMethod: "finisher",
    minProfessionRank: 4,
  },
];

// ────────────────────────────────────────────────────────────────
// Chrome Synod (Mecha) — circuits, power cores, alloy plates, data shards
// ────────────────────────────────────────────────────────────────

const mechaParts: CreaturePart[] = [
  {
    id: "mecha-sentry-circuit",
    displayName: "Sentry Circuit",
    school: "mecha",
    kind: "circuit",
    rarity: "common",
    sourceCreature: "synod-sentry",
    bodyRegion: "torso",
    flavor: "Chrome Synod standard-issue — still hums when warm.",
  },
  {
    id: "mecha-sentry-plate",
    displayName: "Alloy Plate",
    school: "mecha",
    kind: "plate",
    rarity: "common",
    sourceCreature: "synod-sentry",
    bodyRegion: "limbs",
    flavor: "Engineered perfection, chipped at the seams.",
  },
  {
    id: "mecha-scuttler-core",
    displayName: "Power Core",
    school: "mecha",
    kind: "core",
    rarity: "uncommon",
    sourceCreature: "chrome-scuttler",
    bodyRegion: "torso",
    flavor: "A chest-core pulsing with Chrome Synod precision.",
    minProfessionRank: 2,
  },
  {
    id: "mecha-scuttler-shard",
    displayName: "Data Shard",
    school: "mecha",
    kind: "shard",
    rarity: "uncommon",
    sourceCreature: "chrome-scuttler",
    bodyRegion: "head",
    flavor: "Shredded memory lattice — read before it decays.",
    requiredKillMethod: "clean",
  },
  {
    id: "mecha-archon-core",
    displayName: "Archon Power Core",
    school: "mecha",
    kind: "core",
    rarity: "rare",
    sourceCreature: "synod-archon",
    bodyRegion: "torso",
    flavor: "Synod command-core. Overloads if not finished cleanly.",
    requiredKillMethod: "finisher",
    minProfessionRank: 4,
  },
  {
    id: "mecha-archon-shard",
    displayName: "Archon Data Shard",
    school: "mecha",
    kind: "shard",
    rarity: "epic",
    sourceCreature: "synod-archon",
    bodyRegion: "head",
    flavor: "Its last thought, crystallised.",
    requiredKillMethod: "finisher",
    minProfessionRank: 6,
  },
];

// ────────────────────────────────────────────────────────────────
// Ember Vault (Pure) — soul fragments, echo pearls, resonance crystals, prayer dust
// ────────────────────────────────────────────────────────────────

const pureParts: CreaturePart[] = [
  {
    id: "pure-echo-dust",
    displayName: "Prayer Dust",
    school: "pure",
    kind: "dust",
    rarity: "common",
    sourceCreature: "ashveil-echo",
    bodyRegion: "torso",
    flavor: "Ember Vault prayer-ash, still whispering.",
  },
  {
    id: "pure-echo-pearl",
    displayName: "Echo Pearl",
    school: "pure",
    kind: "pearl",
    rarity: "uncommon",
    sourceCreature: "ashveil-echo",
    bodyRegion: "head",
    flavor: "A pearl of compressed sound — a memory held by Ember Vault.",
    minProfessionRank: 2,
  },
  {
    id: "pure-wisp-fragment",
    displayName: "Soul Fragment",
    school: "pure",
    kind: "fragment",
    rarity: "uncommon",
    sourceCreature: "vault-wisp",
    bodyRegion: "organs",
    flavor: "A splinter of lived pattern, Pure through and through.",
    requiredKillMethod: "clean",
  },
  {
    id: "pure-wisp-crystal",
    displayName: "Resonance Crystal",
    school: "pure",
    kind: "crystal",
    rarity: "rare",
    sourceCreature: "vault-wisp",
    bodyRegion: "organs",
    flavor: "It hums at the pitch of the Ember Vault.",
    minProfessionRank: 3,
  },
  {
    id: "pure-oracle-fragment",
    displayName: "Oracle Soul Fragment",
    school: "pure",
    kind: "fragment",
    rarity: "rare",
    sourceCreature: "ember-oracle",
    bodyRegion: "organs",
    flavor: "Ember Vault oracle-shard — carries a prophecy worth a coin.",
    requiredKillMethod: "finisher",
    minProfessionRank: 4,
  },
  {
    id: "pure-oracle-crystal",
    displayName: "Oracle Resonance Crystal",
    school: "pure",
    kind: "crystal",
    rarity: "epic",
    sourceCreature: "ember-oracle",
    bodyRegion: "head",
    flavor: "Pure wisdom, crystallised the moment its song broke.",
    requiredKillMethod: "finisher",
    minProfessionRank: 6,
  },
];

// ────────────────────────────────────────────────────────────────
// Hollowfang boss — unique trophies.
// Anchors: features/hollowfang/hollowfangProfile.ts (Void-adapted predator
// that survived a Verdant Coil purge by hollowing its own marrow).
// ────────────────────────────────────────────────────────────────

const hollowfangParts: CreaturePart[] = [
  {
    id: "hollowfang-fang",
    displayName: "Hollowfang Fang",
    school: "bio",
    kind: "fang",
    rarity: "rare",
    sourceCreature: "hollowfang",
    bodyRegion: "head",
    flavor: "Hollow at the root — the marrow left on its own.",
    uniqueTrophy: true,
    minProfessionRank: 5,
  },
  {
    id: "hollowfang-hide",
    displayName: "Hollowfang Hide",
    school: "bio",
    kind: "hide",
    rarity: "epic",
    sourceCreature: "hollowfang",
    bodyRegion: "torso",
    flavor: "Still carrying Verdant Coil purge-marks — worn like a crown.",
    uniqueTrophy: true,
    requiredKillMethod: "finisher",
    minProfessionRank: 6,
  },
  {
    id: "hollowfang-essence",
    displayName: "Hollowfang Essence",
    school: "pure",
    kind: "essence",
    rarity: "legendary",
    sourceCreature: "hollowfang",
    bodyRegion: "organs",
    flavor: "Void-adapted essence. Ember Vault resonance reads it as a wound.",
    uniqueTrophy: true,
    requiredKillMethod: "finisher",
    minProfessionRank: 8,
  },
];

// ────────────────────────────────────────────────────────────────
// Full registry + selectors
// ────────────────────────────────────────────────────────────────

export const CREATURE_PARTS: readonly CreaturePart[] = [
  ...bioParts,
  ...mechaParts,
  ...pureParts,
  ...hollowfangParts,
];

export function getPartById(id: string): CreaturePart | undefined {
  return CREATURE_PARTS.find((p) => p.id === id);
}

export function getPartsForCreature(
  creatureId: CreaturePart["sourceCreature"],
): CreaturePart[] {
  return CREATURE_PARTS.filter((p) => p.sourceCreature === creatureId);
}

export function getPartsForRegion(
  creatureId: CreaturePart["sourceCreature"],
  region: CreaturePart["bodyRegion"],
): CreaturePart[] {
  return CREATURE_PARTS.filter(
    (p) => p.sourceCreature === creatureId && p.bodyRegion === region,
  );
}
