import Link from "next/link";

import type { Empire } from "@/features/empires/empireTypes";
import { getEmpireRoute } from "@/features/schools/schoolSelectors";

type EmpireOverviewCardProps = {
  empire: Empire;
  /** Highlight as the player's current alignment. */
  isAligned?: boolean;
};

export default function EmpireOverviewCard({
  empire,
  isAligned = false,
}: EmpireOverviewCardProps) {
  return (
    <Link
      href={getEmpireRoute(empire.id)}
      className="group block rounded-2xl border bg-white/5 p-5 transition hover:bg-white/10"
      style={{
        borderColor: isAligned
          ? `${empire.accentHex}cc`
          : `${empire.accentHex}44`,
        boxShadow: isAligned
          ? `0 0 0 1px ${empire.accentHex}55 inset`
          : undefined,
      }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-[0.32em]"
        style={{ color: empire.accentHex }}
      >
        {empire.doctrineWord}
      </p>
      <h3 className="mt-1 text-2xl font-black uppercase tracking-[0.05em] text-white">
        {empire.name}
      </h3>
      <p className="mt-1 text-sm italic text-white/65">"{empire.tagline}"</p>
      <p className="mt-3 text-sm leading-6 text-white/65">
        {empire.philosophy}
      </p>

      <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-white/40">
        <span>{empire.schoolIds.length} schools</span>
        {isAligned ? (
          <span style={{ color: empire.accentHex }}>You stand here</span>
        ) : (
          <span>Walk this empire →</span>
        )}
      </div>
    </Link>
  );
}
