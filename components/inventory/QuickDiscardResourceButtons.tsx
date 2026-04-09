"use client";

import { useGame } from "@/features/game/gameContext";
import { QUICK_DISCARD_CARGO_KEYS } from "@/features/resources/quickDiscardCargoKeys";

type Props = {
  wrapClassName?: string;
  buttonClassName?: string;
};

export default function QuickDiscardResourceButtons({
  wrapClassName = "flex flex-wrap gap-2",
  buttonClassName = "rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/75 hover:border-white/30 hover:bg-white/10",
}: Props) {
  const { state, dispatch } = useGame();

  return (
    <div className={wrapClassName}>
      {QUICK_DISCARD_CARGO_KEYS.map(({ key, label }) => {
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
            className={buttonClassName}
          >
            Discard {amount} {label}
          </button>
        );
      })}
    </div>
  );
}
