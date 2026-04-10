import Link from "next/link";

import {
  getPantheonForSchool,
  getPantheonRoute,
} from "@/features/pantheons/pantheonSelectors";
import type { SchoolId } from "@/features/schools/schoolTypes";

type PantheonChipProps = {
  schoolId: SchoolId;
};

/**
 * Compact link chip — surfaces a school's pantheon with a one-click jump
 * into the pantheon HQ. Used by SchoolHqScreen to wire the
 * school → pantheon cross-link without bloating the header eyebrow.
 */
export default function PantheonChip({ schoolId }: PantheonChipProps) {
  const pantheon = getPantheonForSchool(schoolId);
  if (!pantheon) return null;

  return (
    <Link
      href={getPantheonRoute(pantheon.id)}
      className="inline-flex items-center gap-2 rounded-lg border bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.18em] transition hover:border-white/30 hover:bg-white/10"
      style={{
        borderColor: `${pantheon.accentHex}66`,
        color: pantheon.accentHex,
      }}
      title={`${pantheon.name} pantheon — ${pantheon.region}`}
    >
      <span aria-hidden>↻</span>
      <span>{pantheon.name} pantheon</span>
    </Link>
  );
}
