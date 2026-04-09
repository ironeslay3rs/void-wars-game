"use client";

import type { WarFrontSnapshot } from "@/features/world/warFrontSnapshot";
import { voidZoneById } from "@/features/void-maps/zoneData";

type Props = {
  snapshot: WarFrontSnapshot;
  /** When false, omit zone title row (e.g. nested under a card that already names the sector). */
  showZoneTitle?: boolean;
  className?: string;
};

const EMPIRE: Record<NonNullable<WarFrontSnapshot["leadingEmpire"]>, string> = {
  bio: "Verdant Coil",
  mecha: "Chrome Synod",
  pure: "Ember Vault",
};

export default function WarFrontSnapshotCallout({
  snapshot,
  showZoneTitle = true,
  className = "",
}: Props) {
  const zoneLabel =
    voidZoneById[snapshot.zoneId as keyof typeof voidZoneById]?.label ??
    snapshot.zoneId;
  const leadLabel =
    snapshot.leadingEmpire != null
      ? EMPIRE[snapshot.leadingEmpire]
      : "No clear lead";

  return (
    <div
      className={[
        "rounded-xl border border-indigo-400/22 bg-indigo-950/20 px-3 py-2.5 text-indigo-50/92",
        className,
      ].join(" ")}
    >
      <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/45">
        War front snapshot
      </div>
      {showZoneTitle ? (
        <div className="mt-1 text-[10px] font-semibold text-white/80">
          Sector · {zoneLabel}
        </div>
      ) : null}
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-amber-200/85">
          Lead
        </span>
        <span className="text-[11px] font-semibold text-amber-50/95">
          {leadLabel}
        </span>
        <span className="text-[10px] tabular-nums text-white/45">
          margin {snapshot.pressureMargin}
        </span>
      </div>
      <p className="mt-1.5 text-[11px] font-semibold leading-snug text-rose-100/88">
        {snapshot.consequenceHeadline}
      </p>
      <p className="mt-1 text-[10px] leading-relaxed text-white/52">
        {snapshot.mechanicalEffectLine}
      </p>
      <p className="mt-1.5 border-t border-white/8 pt-1.5 text-[10px] leading-relaxed text-emerald-100/78">
        {snapshot.recommendedResponseLine}
      </p>
    </div>
  );
}
