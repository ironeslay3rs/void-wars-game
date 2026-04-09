import type { NextRunModifierId, PlayerState, ResourceKey } from "@/features/game/gameTypes";
import { formatResourceLabel } from "@/features/game/gameFeedback";
import {
  CRAFT_GATE_VOID_EXTRACT,
  getRecipeRuneRequirementHint,
  meetsRecipeRuneDepth,
} from "@/features/mastery/runeMasteryRecipeGates";
import { getDistrictCraftingCost } from "@/features/crafting-district/craftingProfession";
import { getNextRunModifierDefinitionById } from "@/features/crafting-district/nextRunModifiersData";

/** Null = can craft (resources + gates); otherwise player-facing blocker line. */
export function getNextRunModifierCraftBlocker(
  player: PlayerState,
  modifierId: NextRunModifierId,
): string | null {
  const def = getNextRunModifierDefinitionById(modifierId);
  if (!def) return "This kit is not available in this build.";

  if (
    modifierId === "void-extract" &&
    !meetsRecipeRuneDepth(player, CRAFT_GATE_VOID_EXTRACT)
  ) {
    return (
      getRecipeRuneRequirementHint(CRAFT_GATE_VOID_EXTRACT) ??
      "Rune depth too shallow for Void Extract."
    );
  }

  const cost = getDistrictCraftingCost(player, def.cost);
  const entries = Object.entries(cost).filter(
    (e): e is [ResourceKey, number] =>
      typeof e[1] === "number" && e[1] > 0,
  );
  for (const [key, amount] of entries) {
    const have = player.resources[key] ?? 0;
    if (have < amount) {
      return `Need ${amount} ${formatResourceLabel(key)} (have ${have}).`;
    }
  }
  return null;
}
