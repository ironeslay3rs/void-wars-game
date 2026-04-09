import Link from "next/link";

import { getSchoolForLane, getSchoolRoute } from "@/features/schools/schoolSelectors";
import type { BlackMarketLaneId } from "@/features/schools/schoolTypes";

type OpenFaceLinkProps = {
  laneId: BlackMarketLaneId;
  /** Optional className override for layout. */
  className?: string;
};

/**
 * Cross-link from a black market lane (shadow face) to its open-face
 * school. Renders nothing if the lane id is unknown.
 *
 * Usage: drop into any lane screen header area to surface the dual face.
 */
export default function OpenFaceLink({ laneId, className }: OpenFaceLinkProps) {
  const school = getSchoolForLane(laneId);
  if (!school) return null;

  return (
    <Link
      href={getSchoolRoute(school.id)}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-xl border bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white/85 transition hover:bg-white/10"
      }
      style={{ borderColor: `${school.accentHex}55` }}
      title={`${school.name} — ${school.nation} (${school.pantheon})`}
    >
      <span aria-hidden style={{ color: school.accentHex }}>
        ↑
      </span>
      <span>
        Open face:{" "}
        <span className="text-white" style={{ color: school.accentHex }}>
          {school.shortName}
        </span>
      </span>
      <span className="text-white/45">· {school.nation}</span>
    </Link>
  );
}
