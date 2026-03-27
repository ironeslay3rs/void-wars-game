"use client";

import Link from "next/link";
import { useGame } from "@/features/game/gameContext";
import type { ResourceKey } from "@/features/game/gameTypes";

const QUICK_DISCARD_KEYS: Array<{ key: ResourceKey; label: string }> = [
  { key: "ironOre", label: "Iron Ore" },
  { key: "scrapAlloy", label: "Scrap Alloy" },
  { key: "runeDust", label: "Rune Dust" },
  { key: "bioSamples", label: "Bio Samples" },
];

export default function OverloadWarning({
  message,
}: {
  message: string;
}) {
  const { state, dispatch } = useGame();

  return (
    <div className="mt-3 rounded-xl border border-red-400/35 bg-red-500/12 px-4 py-3 text-sm text-red-100">
      <div className="font-bold uppercase tracking-[0.12em]">Overloaded</div>
      <div className="mt-1 text-red-100/90">{message}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/market/war-exchange"
          className="rounded-lg border border-red-200/45 bg-black/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-red-50 hover:border-red-100/70"
        >
          Sell Surplus
        </Link>
        {QUICK_DISCARD_KEYS.map(({ key, label }) => {
          const owned = state.player.resources[key] ?? 0;
          if (owned <= 0) return null;
          const amount = Math.min(10, owned);
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                const ok = window.confirm(
                  `Discard ${amount} ${label}? This cannot be undone.`,
                );
                if (!ok) return;
                dispatch({
                  type: "SPEND_RESOURCE",
                  payload: { key, amount },
                });
              }}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/75 hover:border-white/30 hover:bg-white/10"
            >
              Discard {amount} {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

