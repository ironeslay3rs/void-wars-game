import Link from "next/link";

import type { MissionOriginTagId } from "@/features/game/gameTypes";
import { getOriginTag } from "@/features/missions/missionOriginTags";
import {
  getSchoolForOriginTag,
  getSchoolRoute,
} from "@/features/schools/schoolSelectors";

type MissionOriginBadgeProps = {
  originTagId: MissionOriginTagId;
  /** Show full label instead of short badge. */
  expanded?: boolean;
};

/**
 * Renders a mission's origin tag.
 *
 * If the origin tag resolves to a canonical school (per the dual-face
 * system), the badge becomes a clickable link to the school HQ. The
 * title attribute carries both the material flavor and the school
 * lineage so hover reveals the full origin chain.
 *
 * "black-market-local" has no canonical school and renders as a static span.
 */
export default function MissionOriginBadge({
  originTagId,
  expanded = false,
}: MissionOriginBadgeProps) {
  const tag = getOriginTag(originTagId);
  const school = getSchoolForOriginTag(originTagId);

  const baseClass = `inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ${tag.accentClass}`;
  const label = expanded ? tag.label : tag.badge;

  if (!school) {
    return (
      <span className={baseClass} title={tag.materialFlavor}>
        {label}
      </span>
    );
  }

  const title = `${school.name} — ${school.nation} (${school.pantheon}) · ${tag.materialFlavor}`;

  return (
    <Link
      href={getSchoolRoute(school.id)}
      className={`${baseClass} transition hover:brightness-125`}
      title={title}
    >
      {label}
    </Link>
  );
}
