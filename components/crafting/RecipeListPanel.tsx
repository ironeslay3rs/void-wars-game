"use client";

/**
 * Task 3.3 — Recipe list panel.
 *
 * Shows recipes for the current category as a selectable list. Presentational
 * only — props in, `onSelectRecipe` callback out. Pure-Empire naming.
 */

import type {
  CraftRecipe,
  MythicRecipeGate,
} from "@/features/crafting/recipeRegistry";

const GATE_LABEL: Record<MythicRecipeGate, string> = {
  l3RareRuneSet: "L3 Rare rune set",
  runeCrafterLicense: "Rune Crafter license",
};

function formatChance(chance: number): string {
  return `${Math.round(Math.min(1, Math.max(0, chance)) * 100)}%`;
}

function outputLabel(recipe: CraftRecipe): string {
  if (recipe.output.kind === "item") return recipe.output.item.name;
  const entries = Object.entries(recipe.output.grant).filter(
    ([, v]) => typeof v === "number" && (v ?? 0) > 0,
  );
  if (entries.length === 0) return "Resources";
  return entries.map(([k, v]) => `+${v} ${k}`).join(" · ");
}

export type RecipeListPanelProps = {
  recipes: CraftRecipe[];
  selectedRecipeId: string | null;
  onSelectRecipe: (recipeId: string) => void;
  /** Ids the viewer cannot currently afford. Used for soft-dimming only. */
  unaffordableIds?: ReadonlySet<string>;
  /** Ids gated by a mythic lock the viewer has not cleared. */
  gatedLockedIds?: ReadonlySet<string>;
  className?: string;
  bare?: boolean;
  emptyMessage?: string;
};

export default function RecipeListPanel({
  recipes,
  selectedRecipeId,
  onSelectRecipe,
  unaffordableIds,
  gatedLockedIds,
  className,
  bare = false,
  emptyMessage = "No recipes in this category yet.",
}: RecipeListPanelProps) {
  const body =
    recipes.length === 0 ? (
      <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-6 text-center text-xs text-white/50">
        {emptyMessage}
      </div>
    ) : (
      <ul className="space-y-2" role="listbox" aria-label="Recipe list">
        {recipes.map((recipe) => {
          const selected = recipe.id === selectedRecipeId;
          const locked = gatedLockedIds?.has(recipe.id) ?? false;
          const unaffordable = unaffordableIds?.has(recipe.id) ?? false;
          return (
            <li key={recipe.id}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onSelectRecipe(recipe.id)}
                className={[
                  "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                  selected
                    ? "border-amber-300/55 bg-amber-500/12"
                    : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]",
                  unaffordable && !selected ? "opacity-70" : "",
                ].join(" ")}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-bold text-white">
                    {recipe.name}
                  </span>
                  <span className="text-[11px] tabular-nums text-white/55">
                    {formatChance(recipe.successChance)}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-white/55">
                  {outputLabel(recipe)}
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-[0.14em]">
                  <span className="text-white/40">
                    {recipe.craftTimeSeconds}s cast
                  </span>
                  {locked && recipe.mythicGate ? (
                    <span className="rounded-full border border-rose-300/40 bg-rose-500/10 px-2 py-0.5 text-rose-100/85">
                      Locked · {GATE_LABEL[recipe.mythicGate]}
                    </span>
                  ) : null}
                  {unaffordable ? (
                    <span className="rounded-full border border-amber-300/30 bg-amber-500/10 px-2 py-0.5 text-amber-100/80">
                      Low mats
                    </span>
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    );

  if (bare) return <div className={className}>{body}</div>;

  return (
    <section
      aria-label="Recipes"
      className={`rounded-2xl border border-white/10 bg-white/[0.02] p-4 ${className ?? ""}`}
    >
      <div className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
        Recipes
      </div>
      {body}
    </section>
  );
}
