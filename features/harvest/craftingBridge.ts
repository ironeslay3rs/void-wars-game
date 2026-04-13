/**
 * Block 4 Task 4.2 — crafting bridge.
 *
 * Parts feed crafting without expanding the ResourceKey union yet
 * (inventory expansion deferred to a later task). This module:
 *   1. Maps part → ResourceKey where a close materialized analogue
 *      already exists (e.g. Bio organ → bioSamples).
 *   2. Exposes a side-band consume helper: consumePartsForCraft(player, parts)
 *      which returns a patch describing resources to bank and parts
 *      that remain as "inventory IOUs" the UI can surface later.
 *
 * Pure: no state mutation. Returns a patch the caller applies.
 */

import type { PlayerState, ResourceKey } from "@/features/game/gameTypes";
import type { CraftingCategory } from "@/features/crafting/recipeRegistry";
import type {
  CreaturePart,
  CreaturePartKind,
  HarvestedPart,
} from "@/features/harvest/trophyTypes";
import { getPartById } from "@/features/harvest/creaturePartRegistry";

// ────────────────────────────────────────────────────────────────
// Part → crafting category routing
// ────────────────────────────────────────────────────────────────

/**
 * Route a part to a crafting tab. Bio → organic, Mecha → structural,
 * Pure → arcane. Hybrid left for multi-school fusion content later.
 */
export function partToCraftingCategory(
  part: Pick<CreaturePart, "school">,
): CraftingCategory {
  switch (part.school) {
    case "bio":
      return "organic";
    case "mecha":
      return "structural";
    case "pure":
      return "arcane";
  }
}

// ────────────────────────────────────────────────────────────────
// Part → ResourceKey (when a clean analogue exists)
// ────────────────────────────────────────────────────────────────

/**
 * Map a part kind + school to an existing ResourceKey when possible.
 * Returns null if no existing resource key fits — caller should keep
 * the part as a side-band IOU.
 */
export function partToResourceKey(
  part: Pick<CreaturePart, "school" | "kind">,
): ResourceKey | null {
  const { school, kind } = part;
  // Bio kinds materialize to bioSamples.
  if (school === "bio") {
    const bioKinds: CreaturePartKind[] = [
      "organ",
      "gland",
      "blood",
      "hide",
      "fang",
      "bone",
    ];
    if (bioKinds.includes(kind)) return "bioSamples";
  }
  // Mecha kinds materialize to scrapAlloy (plates/circuits) or emberCore (cores).
  if (school === "mecha") {
    if (kind === "core") return "emberCore";
    const mechaKinds: CreaturePartKind[] = [
      "circuit",
      "plate",
      "shard",
    ];
    if (mechaKinds.includes(kind)) return "scrapAlloy";
  }
  // Pure kinds materialize to runeDust (dust/pearl/fragment) or emberCore (crystal/essence).
  if (school === "pure") {
    if (kind === "crystal" || kind === "essence") return "emberCore";
    const pureKinds: CreaturePartKind[] = ["dust", "pearl", "fragment"];
    if (pureKinds.includes(kind)) return "runeDust";
  }
  return null;
}

// ────────────────────────────────────────────────────────────────
// Consume helper (side-band; pure)
// ────────────────────────────────────────────────────────────────

/** How much a part of this rarity is worth when folded into a resource. */
const RARITY_AMOUNT: Record<HarvestedPart["rarity"], number> = {
  common: 1,
  uncommon: 2,
  rare: 4,
  epic: 8,
  legendary: 16,
};

export type CraftBridgePatch = {
  /** Amounts to bank into existing ResourceKey counters. */
  resourceDelta: Partial<Record<ResourceKey, number>>;
  /**
   * Parts that had no materialized analogue. UI should track these as
   * IOUs until the inventory expansion lands (Task 4.2 scope ends at
   * routing; expansion deferred).
   */
  sidebandParts: HarvestedPart[];
  /** Short, human-readable notes for a toast / log. */
  notes: string[];
};

/**
 * Pure: given the player + harvested parts, compute the patch. Caller
 * dispatches ADD_RESOURCE actions for each resourceDelta entry and stores
 * sidebandParts in UI state.
 */
export function consumePartsForCraft(
  _player: Pick<PlayerState, "resources">,
  parts: HarvestedPart[],
): CraftBridgePatch {
  const resourceDelta: Partial<Record<ResourceKey, number>> = {};
  const sidebandParts: HarvestedPart[] = [];
  const notes: string[] = [];

  for (const p of parts) {
    const def = getPartById(p.partId);
    const key = def ? partToResourceKey(def) : null;
    const amount = RARITY_AMOUNT[p.rarity];
    // Unique boss trophies always stay side-band (they're trophies, not ore).
    if (def?.uniqueTrophy || key === null) {
      sidebandParts.push(p);
      notes.push(`${p.displayName} kept as trophy (side-band).`);
      continue;
    }
    resourceDelta[key] = (resourceDelta[key] ?? 0) + amount;
    notes.push(`${p.displayName} → +${amount} ${key}.`);
  }

  return { resourceDelta, sidebandParts, notes };
}
