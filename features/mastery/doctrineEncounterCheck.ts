import type { PathType } from "@/features/game/gameTypes";
import type { PlayerRuneMasteryState } from "@/features/mastery/runeMasteryTypes";
import { RUNE_SCHOOLS } from "@/features/mastery/runeMasteryTypes";
import { getDoctrineMilestone, type DoctrineMilestone } from "@/features/mastery/doctrineData";

const STORAGE_KEY = "vw-seen-doctrine-depths";

type SeenDepths = Record<string, number>;

function loadSeenDepths(): SeenDepths {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SeenDepths) : {};
  } catch {
    return {};
  }
}

function saveSeenDepths(depths: SeenDepths) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(depths));
  } catch {
    // localStorage full or unavailable — silent fail
  }
}

export type PendingDoctrineEncounter = {
  school: PathType;
  milestone: DoctrineMilestone;
};

/**
 * Check if any school depth has increased beyond what the player has already seen.
 * Returns the first unseen doctrine milestone, or null if everything is current.
 */
export function checkForNewDoctrine(
  mastery: PlayerRuneMasteryState,
): PendingDoctrineEncounter | null {
  const seen = loadSeenDepths();

  for (const school of RUNE_SCHOOLS) {
    const currentDepth = mastery.depthBySchool[school];
    const lastSeen = seen[school] ?? 1; // depth 1 is the starting point, no milestone for it

    if (currentDepth > lastSeen) {
      // Find the milestone for the new depth
      const milestone = getDoctrineMilestone(school, currentDepth);
      if (milestone) {
        return { school, milestone };
      }
    }
  }

  return null;
}

/**
 * Mark a doctrine depth as seen so the overlay doesn't fire again.
 */
export function markDoctrineSeen(school: PathType, depth: number) {
  const seen = loadSeenDepths();
  const prev = seen[school] ?? 1;
  if (depth > prev) {
    seen[school] = depth;
    saveSeenDepths(seen);
  }
}
