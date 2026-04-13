/**
 * Task 3.3 — Crafting Core Loop: recipe registry facade.
 *
 * The full recipe catalogue already lives in `recipeData.ts` (kept as source
 * of truth). This module is the canonical import point for the Task 3.3
 * surface so Frontend / Tests have a single stable name to bind against.
 *
 * No recipe duplication — we re-export and provide lookup helpers only.
 * Pure Pure naming (no "Spirit" tokens).
 */

import {
  craftRecipes,
  craftingCategoryLabels,
  type CraftRecipe,
  type CraftedItem,
  type CraftingCategory,
  type MythicRecipeGate,
} from "@/features/crafting/recipeData";

export type {
  CraftRecipe,
  CraftedItem,
  CraftingCategory,
  MythicRecipeGate,
};

export { craftRecipes, craftingCategoryLabels };

/** Flat lookup by recipe id. */
export function getRecipeById(id: string): CraftRecipe | undefined {
  return craftRecipes.find((r) => r.id === id);
}

/** Filter recipes by category. */
export function getRecipesByCategory(category: CraftingCategory): CraftRecipe[] {
  return craftRecipes.filter((r) => r.category === category);
}

/** All recipe ids, stable order of definition. */
export function listRecipeIds(): string[] {
  return craftRecipes.map((r) => r.id);
}
