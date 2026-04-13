"use client";

/**
 * Task 3.3 — Crafting Core Loop shell.
 *
 * Composes tabs + recipe list + detail + confirm modal. Presentational only;
 * parent supplies recipe data, affordance maps, and `onCraftConfirm(recipeId)`.
 * No dispatch, no feature imports beyond the Task 3.3 recipe surface.
 *
 * Pure-Empire naming (never "Spirit").
 */

import { useMemo, useState } from "react";
import type { ResourceKey } from "@/features/game/gameTypes";
import type { CraftRecipe } from "@/features/crafting/recipeRegistry";
import type { QualityTier } from "@/features/crafting/qualitySystem";
import CraftingCategoryTabs, {
  CRAFTING_TAB_ORDER,
  type CraftingTabCategory,
} from "./CraftingCategoryTabs";
import RecipeListPanel from "./RecipeListPanel";
import RecipeDetailCard from "./RecipeDetailCard";
import CraftConfirmModal from "./CraftConfirmModal";

export type CraftingCoreLoopProps = {
  /** All recipes eligible for display in the four canon tabs. */
  recipes: CraftRecipe[];
  /** Resources currently held, for per-material affordance badges. */
  heldByResource?: Partial<Record<ResourceKey, number>>;
  /** Effective success chance per recipe (after profession bonus). */
  effectiveSuccessChanceByRecipeId?: Partial<Record<string, number>>;
  /** Projected output quality per recipe. */
  projectedQualityByRecipeId?: Partial<Record<string, QualityTier>>;
  /** Recipe ids the player cannot currently afford. */
  unaffordableRecipeIds?: ReadonlySet<string>;
  /** Recipe ids still sealed by an unresolved mythic gate. */
  mythicLockedRecipeIds?: ReadonlySet<string>;
  /** Initial tab selection. Defaults to "organic". */
  initialCategory?: CraftingTabCategory;
  /** Fired when user confirms a craft from the modal. Parent dispatches. */
  onCraftConfirm: (recipeId: string) => void;
  className?: string;
};

export default function CraftingCoreLoop({
  recipes,
  heldByResource,
  effectiveSuccessChanceByRecipeId,
  projectedQualityByRecipeId,
  unaffordableRecipeIds,
  mythicLockedRecipeIds,
  initialCategory = "organic",
  onCraftConfirm,
  className,
}: CraftingCoreLoopProps) {
  const [activeCategory, setActiveCategory] =
    useState<CraftingTabCategory>(initialCategory);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const recipesInTabs = useMemo(
    () =>
      recipes.filter((r) =>
        (CRAFTING_TAB_ORDER as string[]).includes(r.category),
      ),
    [recipes],
  );

  const countsByCategory = useMemo(() => {
    const map: Partial<Record<CraftingTabCategory, number>> = {};
    for (const cat of CRAFTING_TAB_ORDER) map[cat] = 0;
    for (const r of recipesInTabs) {
      const cat = r.category as CraftingTabCategory;
      map[cat] = (map[cat] ?? 0) + 1;
    }
    return map;
  }, [recipesInTabs]);

  const visibleRecipes = useMemo(
    () => recipesInTabs.filter((r) => r.category === activeCategory),
    [recipesInTabs, activeCategory],
  );

  const selectedRecipe = useMemo(
    () => visibleRecipes.find((r) => r.id === selectedRecipeId) ?? null,
    [visibleRecipes, selectedRecipeId],
  );

  const effectiveChance = selectedRecipe
    ? (effectiveSuccessChanceByRecipeId?.[selectedRecipe.id] ??
      selectedRecipe.successChance)
    : undefined;

  const projectedQuality = selectedRecipe
    ? projectedQualityByRecipeId?.[selectedRecipe.id]
    : undefined;

  const selectedUnaffordable = selectedRecipe
    ? (unaffordableRecipeIds?.has(selectedRecipe.id) ?? false)
    : false;
  const selectedMythicLocked = selectedRecipe
    ? (mythicLockedRecipeIds?.has(selectedRecipe.id) ?? false)
    : false;

  const handleSelectCategory = (cat: CraftingTabCategory) => {
    setActiveCategory(cat);
    setSelectedRecipeId(null);
  };

  const handleConfirm = (recipeId: string) => {
    setConfirmOpen(false);
    onCraftConfirm(recipeId);
  };

  const disabledReason = selectedMythicLocked
    ? "Mythic ladder step unresolved — this recipe remains sealed."
    : selectedUnaffordable
      ? "Materials short — top up before confirming."
      : undefined;

  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      <CraftingCategoryTabs
        activeCategory={activeCategory}
        onSelect={handleSelectCategory}
        countsByCategory={countsByCategory}
      />

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <RecipeListPanel
          recipes={visibleRecipes}
          selectedRecipeId={selectedRecipeId}
          onSelectRecipe={setSelectedRecipeId}
          unaffordableIds={unaffordableRecipeIds}
          gatedLockedIds={mythicLockedRecipeIds}
        />
        <RecipeDetailCard
          recipe={selectedRecipe}
          heldByResource={heldByResource}
          effectiveSuccessChance={effectiveChance}
          projectedQuality={projectedQuality}
          mythicLocked={selectedMythicLocked}
          insufficientMaterials={selectedUnaffordable}
          onRequestCraft={() => setConfirmOpen(true)}
        />
      </div>

      <CraftConfirmModal
        open={confirmOpen}
        recipe={selectedRecipe}
        effectiveSuccessChance={effectiveChance}
        projectedQuality={projectedQuality}
        heldByResource={heldByResource}
        disabled={selectedUnaffordable || selectedMythicLocked}
        disabledReason={disabledReason}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
