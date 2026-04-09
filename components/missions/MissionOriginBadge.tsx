import type { MissionOriginTagId } from "@/features/game/gameTypes";
import { getOriginTag } from "@/features/missions/missionOriginTags";

type MissionOriginBadgeProps = {
  originTagId: MissionOriginTagId;
  /** Show full label instead of short badge. */
  expanded?: boolean;
};

export default function MissionOriginBadge({
  originTagId,
  expanded = false,
}: MissionOriginBadgeProps) {
  const tag = getOriginTag(originTagId);

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ${tag.accentClass}`}
      title={tag.materialFlavor}
    >
      {expanded ? tag.label : tag.badge}
    </span>
  );
}
