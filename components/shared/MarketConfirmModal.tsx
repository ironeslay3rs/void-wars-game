"use client";

type Props = {
  title: string;
  description: string;
  priceLabel: string;
  price: number;
  originalPrice?: number;
  discountPct?: number;
  currencyLabel?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function MarketConfirmModal({
  title,
  description,
  priceLabel,
  price,
  originalPrice,
  discountPct,
  currencyLabel = "Sinful Coin",
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: Props) {
  const showDiscount = discountPct != null && discountPct > 0 && originalPrice != null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-t-2xl border border-fuchsia-400/30 bg-fuchsia-950/95 p-5 sm:rounded-2xl">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          {priceLabel}
        </div>
        <h3 className="mt-1 text-lg font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/65">{description}</p>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
          <span className="text-xs text-white/50">Total</span>
          {showDiscount ? (
            <span className="flex items-center gap-2 text-sm font-bold text-white">
              <span className="text-xs text-white/40 line-through">{originalPrice}</span>
              <span>{price} {currencyLabel}</span>
              <span className="rounded border border-emerald-400/40 bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-100">
                &minus;{discountPct}%
              </span>
            </span>
          ) : (
            <span className="text-sm font-bold text-white">
              {price} {currencyLabel}
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/15 px-4 py-3 text-sm font-bold uppercase tracking-[0.1em] text-fuchsia-100 transition hover:bg-fuchsia-500/25"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
