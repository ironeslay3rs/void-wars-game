"use client";

/**
 * Task 3.3 — Recipe detail card.
 *
 * Materials + success chance + quality preview for the selected recipe.
 * Presentational only. Fires `onRequestCraft(recipeId)` — parent opens the
 * confirm modal. Pure-Empire naming (never "Spirit").
 */

import type { ResourceKey } from "@/features/game/gameTypes";
import type {
  CraftRecipe,
  MythicRecipeGate,
} from "@/features/crafting/recipeRegistry";
import {
  qualityLabels,
  type QualityTier,
} from "@/features/crafting/qualitySystem";

const GATE_LABEL: Record<MythicRecipeGate, string> = {
  l3RareRuneSet: "L3 Rare rune set",
  runeCrafterLicense: "Rune Crafter license",
};

function formatPercent(v: number): string {
  return `${Math.round(Math.min(1, Math.max(0, v)) * 100)}%`;
}

function outputLine(recipe: CraftRecipe): string {
  if (recipe.output.kind === "item") {
    const it = recipe.output.item;
    return `${it.name} (${it.rarity} ${it.kind} · ${it.rankTier})`;
  }
  const entries = Object.entries(recipe.output.grant).filter(
    ([, v]) => typeof v === "number" && (v ?? 0) > 0,
  );
  if (entries.length === 0) return "Resources";
  return entries.map(([k, v]) => `+${v} ${k}`).join(" · ");
}

export type RecipeDetailCardProps = {
  recipe: CraftRecipe | null;
  /** Per-material amount currently held by the player (for affordance display). */
  heldByResource?: Partial<Record<ResourceKey, number>>;
  /** Effective success chance after profession bonus. Defaults to recipe base. */
  effectiveSuccessChance?: number;
  /** Projected output quality for the craft. */
  projectedQuality?: QualityTier;
  /** True if this recipe is currently gated by an unresolved mythic lock. */
  mythicLocked?: boolean;
  /** True if the player cannot currently afford this recipe. */
  insufficientMaterials?: boolean;
  onRequestCraft: (recipeId: string) => void;
  className?: string;
  bare?: boolean;
};

export default function RecipeDetailCard({
  recipe,
  heldByResource,
  effectiveSuccessChance,
  projectedQuality,
  mythicLocked = false,
  insufficientMaterials = false,
  onRequestCraft,
  className,
  bare = false,
}: RecipeDetailCardProps) {
  if (!recipe) {
    const emptyBody = (
      <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-10 text-center text-xs text-white/45">
        Select a recipe to see materials and success odds.
      </div>
    );
    if (bare) return <div className={className}>{emptyBody}</div>;
    return (
      <section
        aria-label="Recipe detail"
        className={`rounded-2xl border border-white/10 bg-white/[0.02] p-4 ${className ?? ""}`}
      >
        {emptyBody}
      </section>
    );
  }

  const baseChance = recipe.successChance;
  const effective = effectiveSuccessChance ?? baseChance;
  const bonusDelta = effective - baseChance;
  const disabled = mythicLocked || insufficientMaterials;

  const materialRows = Object.entries(recipe.materials)
    .filter(([, v]) => typeof v === "number" && (v ?? 0) > 0)
    .map(([k, v]) => {
      const key = k as ResourceKey;
      const need = v as number;
      const held = heldByResource?.[key] ?? undefined;
      const short =
        typeof held === "number" ? held < need : undefined;
      return { key, need, held, short };
    });

  const body = (
    <div className="space-y-4">
      <header>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
          {recipe.category}
        </div>
        <h3 className="mt-1 text-base font-black uppercase tracking-[0.06em] text-white">
          {recipe.name}
        </h3>
        <div className="mt-1 text-xs text-white/60">{outputLine(recipe)}</div>
      </header>

      <dl className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-[0.14em] text-white/45">
            Success chance
          </dt>
          <dd className="mt-1 flex items-baseline gap-2 text-white">
            <span className="text-lg font-black tabular-nums">
              {formatPercent(effective)}
            </span>
            {bonusDelta > 0.0005 ? (
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200/85">
                +{formatPercent(bonusDelta)} profession
              </span>
            ) : null}
          </dd>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
          <dt className="text-[10px] uppercase tracking-[0.14em] text-white/45">
            Cast time
          </dt>
          <dd className="mt-1 text-lg font-black tabular-nums text-white">
            {recipe.craftTimeSeconds}s
          </dd>
        </div>
      </dl>

      <div>
        <div className="mb-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
          Materials
        </div>
        <ul className="space-y-1">
          {materialRows.map((row) => (
            <li
              key={row.key}
              className={[
                "flex items-baseline justify-between rounded-md border px-3 py-1.5 text-xs",
                row.short
                  ? "border-rose-300/30 bg-rose-500/5 text-rose-100/90"
                  : "border-white/10 bg-white/[0.03] text-white/80",
              ].join(" ")}
            >
              <span className="capitalize">{row.key}</span>
              <span className="tabular-nums">
                {typeof row.held === "number" ? (
                  <>
                    <span
                      className={row.short ? "text-rose-200" : "text-white/70"}
                    >
                      {row.held}
                    </span>
                    <span className="text-white/35"> / </span>
                  </>
                ) : null}
                <span>{row.need}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {projectedQuality ? (
        <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/75">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
            Projected quality
          </span>
          <span className="ml-2 font-bold text-white">
            {qualityLabels[projectedQuality]}
          </span>
        </div>
      ) : null}

      {mythicLocked && recipe.mythicGate ? (
        <div className="rounded-lg border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-100/90">
          Gated: {GATE_LABEL[recipe.mythicGate]}. Clear the mythic ladder step
          before this recipe accepts a craft order.
        </div>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        onClick={() => onRequestCraft(recipe.id)}
        className="w-full rounded-xl border border-amber-300/45 bg-amber-500/15 px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-amber-50 hover:border-amber-200/65 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {mythicLocked
          ? "Mythic lock"
          : insufficientMaterials
            ? "Insufficient materials"
            : "Craft"}
      </button>
    </div>
  );

  if (bare) return <div className={className}>{body}</div>;

  return (
    <section
      aria-label={`Recipe detail: ${recipe.name}`}
      className={`rounded-2xl border border-white/10 bg-white/[0.02] p-5 ${className ?? ""}`}
    >
      {body}
    </section>
  );
}
