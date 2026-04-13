"use client";

/**
 * Task 3.3 — Craft confirmation modal.
 *
 * Lightweight overlay that restates materials + chance + projected quality and
 * awaits confirmation. Presentational only — emits `onConfirm(recipeId)` and
 * `onCancel()`. Pure-Empire naming (never "Spirit").
 */

import { useEffect } from "react";
import type { ResourceKey } from "@/features/game/gameTypes";
import type { CraftRecipe } from "@/features/crafting/recipeRegistry";
import {
  qualityLabels,
  type QualityTier,
} from "@/features/crafting/qualitySystem";

function formatPercent(v: number): string {
  return `${Math.round(Math.min(1, Math.max(0, v)) * 100)}%`;
}

export type CraftConfirmModalProps = {
  open: boolean;
  recipe: CraftRecipe | null;
  effectiveSuccessChance?: number;
  projectedQuality?: QualityTier;
  heldByResource?: Partial<Record<ResourceKey, number>>;
  disabled?: boolean;
  disabledReason?: string;
  onConfirm: (recipeId: string) => void;
  onCancel: () => void;
};

export default function CraftConfirmModal({
  open,
  recipe,
  effectiveSuccessChance,
  projectedQuality,
  heldByResource,
  disabled = false,
  disabledReason,
  onConfirm,
  onCancel,
}: CraftConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open || !recipe) return null;

  const chance = effectiveSuccessChance ?? recipe.successChance;
  const materialRows = Object.entries(recipe.materials).filter(
    ([, v]) => typeof v === "number" && (v ?? 0) > 0,
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Confirm craft: ${recipe.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-amber-300/30 bg-neutral-950 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-200/70">
          Confirm craft
        </div>
        <h2 className="mt-1 text-lg font-black uppercase tracking-[0.06em] text-white">
          {recipe.name}
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">
              Chance
            </div>
            <div className="mt-1 text-base font-black tabular-nums text-white">
              {formatPercent(chance)}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">
              Cast
            </div>
            <div className="mt-1 text-base font-black tabular-nums text-white">
              {recipe.craftTimeSeconds}s
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
            Materials consumed
          </div>
          <ul className="space-y-1 text-xs">
            {materialRows.map(([k, v]) => {
              const key = k as ResourceKey;
              const need = v as number;
              const held = heldByResource?.[key];
              const short = typeof held === "number" && held < need;
              return (
                <li
                  key={key}
                  className={[
                    "flex items-baseline justify-between rounded-md border px-3 py-1.5",
                    short
                      ? "border-rose-300/30 bg-rose-500/5 text-rose-100/90"
                      : "border-white/10 bg-white/[0.03] text-white/80",
                  ].join(" ")}
                >
                  <span className="capitalize">{key}</span>
                  <span className="tabular-nums">
                    {typeof held === "number" ? (
                      <>
                        <span className={short ? "text-rose-200" : "text-white/70"}>
                          {held}
                        </span>
                        <span className="text-white/35"> / </span>
                      </>
                    ) : null}
                    <span>{need}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {projectedQuality ? (
          <div className="mt-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/80">
            Projected quality:{" "}
            <span className="font-bold text-white">
              {qualityLabels[projectedQuality]}
            </span>
          </div>
        ) : null}

        {disabled && disabledReason ? (
          <div className="mt-3 rounded-lg border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-100/90">
            {disabledReason}
          </div>
        ) : null}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/75 hover:border-white/25"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onConfirm(recipe.id)}
            className="flex-1 rounded-xl border border-amber-300/50 bg-amber-500/20 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-amber-50 hover:border-amber-200/65 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Confirm craft
          </button>
        </div>
      </div>
    </div>
  );
}
