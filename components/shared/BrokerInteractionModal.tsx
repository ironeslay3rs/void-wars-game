"use client";

import { useCallback, useState } from "react";
import { useGame } from "@/features/game/gameContext";
import type { BrokerInteraction } from "@/features/lore/brokerInteractionData";
import type { BrokerEntry } from "@/features/lore/brokerData";
import type { PathType } from "@/features/game/gameTypes";
import {
  getDiscountedCost,
  getRapportDiscountPct,
} from "@/features/broker-dialogue/rapportDiscount";

const SCHOOL_ACCENT: Record<PathType | "neutral", { border: string; bg: string; btn: string }> = {
  bio: { border: "border-emerald-500/40", bg: "bg-emerald-950/95", btn: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25" },
  mecha: { border: "border-cyan-400/40", bg: "bg-slate-950/95", btn: "border-cyan-400/40 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25" },
  pure: { border: "border-amber-400/40", bg: "bg-amber-950/95", btn: "border-amber-400/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25" },
  neutral: { border: "border-white/20", bg: "bg-black/95", btn: "border-white/20 bg-white/10 text-white/90 hover:bg-white/15" },
};

type Props = {
  broker: BrokerEntry;
  interaction: BrokerInteraction;
  onClose: () => void;
};

export default function BrokerInteractionModal({ broker, interaction, onClose }: Props) {
  const { state, dispatch } = useGame();
  const [result, setResult] = useState<string | null>(null);
  const accent = SCHOOL_ACCENT[broker.school];

  const credits = state.player.resources.credits;
  const rapport = state.player.brokerRapport[broker.id] ?? 0;
  const discountPct = getRapportDiscountPct(rapport);
  const effectiveCost = getDiscountedCost(interaction.cost, rapport);
  const canAfford = credits >= effectiveCost;
  const lastUsed = state.player.brokerCooldowns[broker.id] ?? 0;
  const now = Date.now();
  const onCooldown = interaction.cooldownMs > 0 && now - lastUsed < interaction.cooldownMs;
  const cooldownRemaining = onCooldown
    ? Math.ceil((interaction.cooldownMs - (now - lastUsed)) / 60_000)
    : 0;

  const handleConfirm = useCallback(() => {
    if (!canAfford || onCooldown) return;
    dispatch({ type: "BROKER_INTERACT", payload: { brokerId: broker.id } });

    // Determine toast
    if (interaction.effect.kind === "show_tip") {
      const tips = interaction.effect.tipPool;
      const tip = tips[Math.floor(Math.random() * tips.length)];
      setResult(tip);
    } else {
      setResult(interaction.resultToast);
    }
  }, [broker.id, canAfford, dispatch, interaction, onCooldown]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-t-2xl border p-5 sm:rounded-2xl ${accent.bg} ${accent.border}`}>
        {/* Header */}
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          {broker.title}
        </div>
        <h3 className="mt-1 text-lg font-bold text-white">{broker.name}</h3>

        {result ? (
          /* Result state */
          <div className="mt-4 space-y-4">
            <p className="text-sm italic leading-relaxed text-white/70">
              &ldquo;{result}&rdquo;
            </p>
            <button
              type="button"
              onClick={onClose}
              className={`flex min-h-[48px] w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] transition ${accent.btn}`}
            >
              Done
            </button>
          </div>
        ) : (
          /* Confirm state */
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-relaxed text-white/65">
              {interaction.confirmText}
            </p>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <span className="text-xs text-white/50">Cost</span>
              {discountPct > 0 ? (
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <span className="text-xs text-white/40 line-through">
                    {interaction.cost}
                  </span>
                  <span>{effectiveCost} Sinful Coin</span>
                  <span className="rounded border border-emerald-400/40 bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-100">
                    −{discountPct}%
                  </span>
                </span>
              ) : (
                <span className="text-sm font-bold text-white">
                  {effectiveCost} Sinful Coin
                </span>
              )}
            </div>

            {onCooldown ? (
              <div className="rounded-xl border border-amber-400/25 bg-amber-500/8 px-4 py-3 text-xs text-amber-200/80">
                Come back later. ({cooldownRemaining} min remaining)
              </div>
            ) : !canAfford ? (
              <div className="rounded-xl border border-red-400/25 bg-red-500/8 px-4 py-3 text-xs text-red-200/80">
                Not enough Sinful Coin. You have {credits}.
              </div>
            ) : null}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canAfford || onCooldown}
                className={[
                  "flex min-h-[48px] flex-1 items-center justify-center rounded-xl border px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] transition",
                  canAfford && !onCooldown
                    ? accent.btn
                    : "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/30",
                ].join(" ")}
              >
                {interaction.actionLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
