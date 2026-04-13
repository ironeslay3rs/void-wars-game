/**
 * Phase 2 Named Materials — registry.
 *
 * Pure export-only module. Metadata only, no side effects.
 *
 * Canon anchor: lore-canon/CLAUDE.md — Currency Hierarchy:
 *   - Apex materials: Bloodvein (Bio), Ironheart (Mecha), Ashveil (Pure),
 *     Meldheart (Black Market fusion)
 *   - Lesser forms: Veinshards, Heart-Iron, Veil Ash, Meldshards
 *
 * Phase 2 = the canonical lesser/shard forms. They sit above Phase 1
 * boss-drop mats (coilboundLattice / ashSynodRelic / vaultLatticeShard)
 * in lore weight but below the apex set in crafting yield. They are the
 * scarcity floor for the apex crafting ladder.
 *
 * Empire names in flavor copy use Verdant Coil / Chrome Synod / Ember
 * Vault. "Pure" is always "Pure" (never "Spirit").
 */

import type { PathType, ResourceKey } from "@/features/game/gameTypes";

export type Phase2School = PathType | "neutral";

export type Phase2MaterialEntry = {
  key: ResourceKey;
  displayName: string;
  school: Phase2School;
  tier: "phase2";
  /** Where the material legitimately drops / is fenced. */
  sourceHints: string[];
  /** Short in-world line — matches resourceFlavorData voice. */
  flavorLine: string;
  /** Canonical apex material this one is the lesser form of. */
  apexParent: "bloodvein" | "ironHeart" | "ashveil" | "meldheart";
};

export const PHASE2_MATERIALS: Phase2MaterialEntry[] = [
  {
    key: "veinshard",
    displayName: "Veinshard",
    school: "bio",
    tier: "phase2",
    sourceHints: [
      "Verdant Coil blood rites (failed vein-sealings)",
      "Hollowfang marrow pit drops",
      "Bonehowl remnant caches",
    ],
    flavorLine:
      "A chip of Bloodvein that never quite sealed. Still warm to the touch.",
    apexParent: "bloodvein",
  },
  {
    key: "heartIron",
    displayName: "Heart-Iron",
    school: "mecha",
    tier: "phase2",
    sourceHints: [
      "Chrome Synod rejected-forge slag",
      "Ash Relay wreck fields",
      "Pharos surplus convoys",
    ],
    flavorLine:
      "Ironheart that failed the forge — louder than the finished metal, and angrier about it.",
    apexParent: "ironHeart",
  },
  {
    key: "veilAsh",
    displayName: "Veil Ash",
    school: "pure",
    tier: "phase2",
    sourceHints: [
      "Ember Vault lower braziers",
      "Mouth of Inti acolyte sweepings",
      "Ash Synod relic sites",
    ],
    flavorLine:
      "Ashveil before the final skim. Carries the prayer but not yet the weight.",
    apexParent: "ashveil",
  },
  {
    key: "meldshard",
    displayName: "Meldshard",
    school: "neutral",
    tier: "phase2",
    sourceHints: [
      "Black Market fusion benches",
      "Blackcity cross-school fence stalls",
      "Rift Maw hybrid-mob drops",
    ],
    flavorLine:
      "A splinter of Meldheart. Three schools argue whose it is; the market keeps selling it anyway.",
    apexParent: "meldheart",
  },
];

export const PHASE2_MATERIAL_KEYS: ReadonlyArray<ResourceKey> =
  PHASE2_MATERIALS.map((m) => m.key);

export function getPhase2Material(
  key: ResourceKey,
): Phase2MaterialEntry | undefined {
  return PHASE2_MATERIALS.find((m) => m.key === key);
}

export function getPhase2MaterialsBySchool(
  school: Phase2School,
): Phase2MaterialEntry[] {
  return PHASE2_MATERIALS.filter((m) => m.school === school);
}

export function isPhase2Material(key: ResourceKey): boolean {
  return PHASE2_MATERIAL_KEYS.includes(key);
}
