import Link from "next/link";

import type { MissionOriginTagId } from "@/features/game/gameTypes";
import { getInstitutionById } from "@/features/institutions/institutionSelectors";
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
 * title attribute carries the FULL origin chain — institution → school
 * → nation/pantheon → material flavor — so hover reveals exactly which
 * org leaked the contract.
 *
 * "black-market-local" has no canonical school OR institution and
 * renders as a static span.
 */
export default function MissionOriginBadge({
  originTagId,
  expanded = false,
}: MissionOriginBadgeProps) {
  const tag = getOriginTag(originTagId);
  const school = getSchoolForOriginTag(originTagId);
  const institution = tag.institutionId
    ? getInstitutionById(tag.institutionId)
    : null;

  const baseClass = `inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ${tag.accentClass}`;
  const label = expanded ? tag.label : tag.badge;

  if (!school) {
    return (
      <span className={baseClass} title={tag.materialFlavor}>
        {label}
      </span>
    );
  }

  // Phase 9 unlock 2: institution lineage leads the title chain when set,
  // so hovering shows "Bonehowl Syndicate → Bonehowl of Fenrir — Norway
  // (Norse) · [material flavor]". Falls back to the school-only title
  // if a tag somehow resolves to a school but not an institution.
  const title = institution
    ? `${institution.name} → ${school.name} — ${school.nation} (${school.pantheon}) · ${tag.materialFlavor}`
    : `${school.name} — ${school.nation} (${school.pantheon}) · ${tag.materialFlavor}`;

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
