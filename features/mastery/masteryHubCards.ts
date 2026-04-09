import type { PlayerState } from "@/features/game/gameTypes";
import type { StatCard } from "@/features/mastery/masteryScreenData";
import {
  MAX_MINORS_PER_SCHOOL,
  getExecutionalTier,
  maxRuneDepthAcrossSchools,
} from "@/features/mastery/runeMasteryLogic";
import { RUNE_SCHOOLS } from "@/features/mastery/runeMasteryTypes";

const MINORS_CAP = RUNE_SCHOOLS.length * MAX_MINORS_PER_SCHOOL;

/** Live stat row for `/mastery` hub cards (Wave C depth readout). */
export function getMasteryHubCards(player: PlayerState): StatCard[] {
  const rm = player.runeMastery;
  let totalMinors = 0;
  let l2 = 0;
  let l3 = 0;
  for (const s of RUNE_SCHOOLS) {
    totalMinors += rm.minorCountBySchool[s];
    const t = getExecutionalTier(rm, s);
    if (t >= 1) l2 += 1;
    if (t >= 2) l3 += 1;
  }
  const deepest = maxRuneDepthAcrossSchools(rm);

  let execValue: string;
  let execHint: string;
  if (l3 > 0) {
    execValue = l3 === 1 ? "1 path · L3" : `${l3} paths · L3`;
    execHint =
      "L3 (5–6 minors per school) is apex Executional tier for theme bonuses.";
  } else if (l2 > 0) {
    execValue = l2 === 1 ? "1 path · L2+" : `${l2} paths · L2+`;
    execHint =
      "L2+ unlocks theme-aligned field pickup scaling and some deploy gates.";
  } else {
    execValue = "—";
    execHint =
      "Three minors in one school unlock Executional L2 (set detection).";
  }

  return [
    {
      label: "Minors installed",
      value: `${totalMinors}/${MINORS_CAP}`,
      hint: "Bio / Mecha / Pure rails — each minor deepens one school and spends capacity.",
    },
    {
      label: "Deepest sevenfold",
      value: `L${deepest}`,
      hint: "Deepest-school depth gates the hardest void realms on the map.",
    },
    {
      label: "Executional sets",
      value: execValue,
      hint: execHint,
    },
  ];
}
