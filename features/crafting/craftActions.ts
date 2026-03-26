import type { PlayerState, ResourceKey, ResourcesState } from "@/features/game/gameTypes";
import { clamp } from "@/features/game/gameMissionUtils";
import type { CraftRecipe } from "@/features/crafting/recipeData";

export type CraftResult =
  | {
      ok: true;
      recipeId: string;
      recipeName: string;
      success: true;
      gainedResources: Partial<ResourcesState>;
      gainedItemId: string | null;
      message: string;
    }
  | {
      ok: false;
      recipeId: string;
      recipeName: string;
      reason: string;
    }
  | {
      ok: true;
      recipeId: string;
      recipeName: string;
      success: false;
      gainedResources: Partial<ResourcesState>;
      gainedItemId: string | null;
      message: string;
    };

function canAfford(player: PlayerState, materials: Partial<Record<ResourceKey, number>>) {
  return Object.entries(materials).every(([k, v]) => {
    const key = k as ResourceKey;
    const need = typeof v === "number" ? v : 0;
    if (need <= 0) return true;
    return (player.resources[key] ?? 0) >= need;
  });
}

function spendMaterials(resources: ResourcesState, materials: Partial<Record<ResourceKey, number>>) {
  const next = { ...resources };
  for (const [k, v] of Object.entries(materials)) {
    const key = k as ResourceKey;
    const need = typeof v === "number" ? v : 0;
    if (need <= 0) continue;
    next[key] = Math.max(0, (next[key] ?? 0) - need);
  }
  return next;
}

export function craftItem(params: {
  player: PlayerState;
  recipe: CraftRecipe;
  rng?: () => number;
}): { player: PlayerState; result: CraftResult } {
  const { player, recipe } = params;
  const rng = params.rng ?? Math.random;

  if (!canAfford(player, recipe.materials)) {
    return {
      player,
      result: {
        ok: false,
        recipeId: recipe.id,
        recipeName: recipe.name,
        reason: "Insufficient materials.",
      },
    };
  }

  const rolled = clamp(rng(), 0, 1);
  const success = rolled <= clamp(recipe.successChance, 0, 1);

  const nextResourcesAfterSpend = spendMaterials(player.resources, recipe.materials);

  let gainedResources: Partial<ResourcesState> = {};
  let gainedItemId: string | null = null;
  let nextCrafted = player.craftedInventory ?? {};

  if (success) {
    if (recipe.output.kind === "resources") {
      gainedResources = recipe.output.grant;
    } else {
      gainedItemId = recipe.output.item.id;
      nextCrafted = {
        ...nextCrafted,
        [gainedItemId]: (nextCrafted[gainedItemId] ?? 0) + 1,
      };
    }
  }

  const nextResources = { ...nextResourcesAfterSpend };
  for (const [k, v] of Object.entries(gainedResources)) {
    const key = k as ResourceKey;
    const amt = typeof v === "number" ? v : 0;
    if (amt <= 0) continue;
    nextResources[key] = (nextResources[key] ?? 0) + amt;
  }

  return {
    player: {
      ...player,
      resources: nextResources,
      craftedInventory: nextCrafted,
    },
    result: {
      ok: true,
      recipeId: recipe.id,
      recipeName: recipe.name,
      success,
      gainedResources,
      gainedItemId,
      message: success ? `${recipe.name} crafted.` : `${recipe.name} failed to bind.`,
    },
  };
}

