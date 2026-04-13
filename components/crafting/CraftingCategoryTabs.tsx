"use client";

/**
 * Task 3.3 — Crafting category tab strip.
 *
 * Presentational. Renders the four canon crafting tabs (Organic, Structural,
 * Arcane, Hybrid) and reports selection via callback. Pure-Empire naming
 * (never "Spirit").
 */

import type { CraftingCategory } from "@/features/crafting/recipeRegistry";

export type CraftingTabCategory = Extract<
  CraftingCategory,
  "organic" | "structural" | "arcane" | "hybrid"
>;

export const CRAFTING_TAB_ORDER: CraftingTabCategory[] = [
  "organic",
  "structural",
  "arcane",
  "hybrid",
];

const TAB_LABEL: Record<CraftingTabCategory, string> = {
  organic: "Organic",
  structural: "Structural",
  arcane: "Arcane",
  hybrid: "Hybrid",
};

const TAB_BLURB: Record<CraftingTabCategory, string> = {
  organic: "Rations, serums, biomass binds",
  structural: "Blades, plating, frame channels",
  arcane: "Runes, sigils, obsidian cycles",
  hybrid: "Cross-school consumables",
};

export type CraftingCategoryTabsProps = {
  activeCategory: CraftingTabCategory;
  onSelect: (cat: CraftingTabCategory) => void;
  countsByCategory?: Partial<Record<CraftingTabCategory, number>>;
  className?: string;
  bare?: boolean;
};

export default function CraftingCategoryTabs({
  activeCategory,
  onSelect,
  countsByCategory,
  className,
  bare = false,
}: CraftingCategoryTabsProps) {
  const body = (
    <div
      role="tablist"
      aria-label="Crafting categories"
      className="flex flex-wrap gap-2"
    >
      {CRAFTING_TAB_ORDER.map((cat) => {
        const active = cat === activeCategory;
        const count = countsByCategory?.[cat];
        return (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={`${TAB_LABEL[cat]} recipes`}
            onClick={() => onSelect(cat)}
            className={[
              "rounded-xl border px-4 py-2 text-left transition-colors",
              active
                ? "border-amber-300/55 bg-amber-500/15 text-amber-50"
                : "border-white/12 bg-white/[0.03] text-white/70 hover:border-white/25 hover:text-white/90",
            ].join(" ")}
          >
            <div className="text-[11px] font-black uppercase tracking-[0.16em]">
              {TAB_LABEL[cat]}
              {typeof count === "number" ? (
                <span className="ml-2 text-[10px] font-normal tracking-normal text-white/50">
                  {count}
                </span>
              ) : null}
            </div>
            <div className="mt-0.5 text-[10px] leading-snug text-white/50">
              {TAB_BLURB[cat]}
            </div>
          </button>
        );
      })}
    </div>
  );

  if (bare) return <div className={className}>{body}</div>;

  return (
    <nav
      aria-label="Crafting category tabs"
      className={`rounded-2xl border border-white/10 bg-white/[0.02] p-3 ${className ?? ""}`}
    >
      {body}
    </nav>
  );
}
