"use client";

/**
 * BlessingOfferModal — run-entry pick-three modal (Hades-style). Shows
 * three blessing cards (one per school) with a rare Black City fusion
 * swap replacing one slot. Cost preview is bold; the pick calls
 * `onChoose(blessingId)`. Presentational only.
 *
 * Canon copy: "Pure" (never "Spirit"); empire names already baked into
 * backend flavor strings — we pass them through verbatim.
 */
import type {
  Blessing,
  BlessingOffer,
  FusionBlessing,
} from "@/features/incursion/blessingTypes";
import { resolveOfferChoices } from "@/features/incursion/blessingOffer";
import BlessingDetailCard from "./BlessingDetailCard";

export type BlessingOfferModalProps = {
  offer: BlessingOffer;
  /** Fire when the player picks a card. */
  onChoose: (blessingId: string) => void;
  /** Optional skip action — if omitted, the skip button is hidden. */
  onSkip?: () => void;
  /** Optional close/backdrop dismissal. */
  onClose?: () => void;
  /** Disable CTAs during transition. */
  disabled?: boolean;
};

function isFusion(b: Blessing | FusionBlessing): b is FusionBlessing {
  return b.rarity === "fusion";
}

export default function BlessingOfferModal({
  offer,
  onChoose,
  onSkip,
  onClose,
  disabled = false,
}: BlessingOfferModalProps) {
  const choices = resolveOfferChoices(offer);
  const hasFusion = choices.some(isFusion);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Void Incursion blessings"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-white/10 bg-slate-950/95 p-5 sm:rounded-2xl">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          Void Incursion
        </div>
        <h3 className="mt-1 text-lg font-bold text-white">
          Claim a blessing before you step in
        </h3>
        <p className="mt-1 text-xs text-white/55">
          Pick one. The buff is yours for this run; the cost stays on your
          flesh.
        </p>

        {hasFusion ? (
          <div className="mt-3 rounded-xl border border-fuchsia-400/30 bg-fuchsia-950/30 p-2 text-[11px] text-fuchsia-200">
            Black City fusion in the offer — higher ceiling, doubled cost.
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {choices.map((b, i) => (
            <BlessingDetailCard
              key={`${b.id}-${i}`}
              blessing={b}
              onChoose={onChoose}
              chooseLabel="Pick"
              disabled={disabled}
            />
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          {onSkip ? (
            <button
              type="button"
              onClick={onSkip}
              disabled={disabled}
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Enter Unblessed
            </button>
          ) : null}
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white/70 transition hover:bg-white/10"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
