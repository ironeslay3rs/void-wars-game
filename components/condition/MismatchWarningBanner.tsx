/**
 * MismatchWarningBanner — surfaces loadout-level school mismatch.
 *
 * Props-in only. Consumers pass a `LoadoutMismatchReport` from
 * `getLoadoutMismatchReport(player)` plus the player's alignment label.
 * Renders nothing when severity is "none".
 */

import type { LoadoutMismatchReport } from "@/features/condition/mismatchSystem";

type MismatchWarningBannerProps = {
  report: LoadoutMismatchReport;
  /** Canon empire label for the player's alignment (e.g. "Verdant Coil"). */
  alignmentLabel: string;
  /** Optional — invoked when user requests the rebalance/loadout screen. */
  onRebalance?: () => void;
};

export default function MismatchWarningBanner({
  report,
  alignmentLabel,
  onRebalance,
}: MismatchWarningBannerProps) {
  const { penalty, hybridDepth, opposedDepth } = report;
  if (penalty.severity === "none") return null;

  const isMajor = penalty.severity === "major";
  const tone = isMajor
    ? "border-rose-400/50 bg-rose-500/10 text-rose-50"
    : "border-amber-400/40 bg-amber-500/10 text-amber-50";
  const headline = isMajor ? "Opposed-school rejection" : "Hybrid strain";
  const dmgPct = Math.round((penalty.dmgMult - 1) * 100);
  const craftPct = Math.round((penalty.craftSuccessMult - 1) * 100);

  return (
    <div
      className={`rounded-[20px] border ${tone} p-4 backdrop-blur`}
      role="alert"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] opacity-75">
            Loadout mismatch
          </div>
          <div className="mt-1 text-base font-black uppercase tracking-[0.1em]">
            {headline}
          </div>
          <p className="mt-2 max-w-xl text-sm leading-relaxed opacity-90">
            Your vessel is aligned to <span className="font-semibold">{alignmentLabel}</span>,
            but {opposedDepth > 0 ? `${opposedDepth} opposed-school rune${opposedDepth === 1 ? "" : "s"}` : null}
            {opposedDepth > 0 && hybridDepth > 0 ? " and " : null}
            {hybridDepth > 0 ? `${hybridDepth} hybrid rune${hybridDepth === 1 ? "" : "s"}` : null}
            {" "}remain installed. Every pulse burns translation cost.
          </p>
        </div>
        {onRebalance ? (
          <button
            type="button"
            onClick={onRebalance}
            className="rounded-xl border border-white/25 bg-black/30 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90 transition hover:bg-black/50"
          >
            Rebalance loadout
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.14em]">
        <span className="rounded-full border border-white/20 bg-black/25 px-2.5 py-1 font-semibold">
          Dmg {dmgPct === 0 ? "—" : `${dmgPct > 0 ? "+" : ""}${dmgPct}%`}
        </span>
        <span className="rounded-full border border-white/20 bg-black/25 px-2.5 py-1 font-semibold">
          Craft {craftPct === 0 ? "—" : `${craftPct > 0 ? "+" : ""}${craftPct}%`}
        </span>
        <span className="rounded-full border border-white/20 bg-black/25 px-2.5 py-1 font-semibold">
          +{penalty.corruptionPerInstall} corruption/install
        </span>
        <span className="rounded-full border border-white/20 bg-black/25 px-2.5 py-1 font-semibold opacity-80">
          {penalty.label}
        </span>
      </div>
    </div>
  );
}
