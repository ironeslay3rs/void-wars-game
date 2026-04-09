"use client";

import Link from "next/link";

import { useGame } from "@/features/game/gameContext";
import { getEmpireById } from "@/features/empires/empireSelectors";
import {
  getEmpireRoute,
  getSchoolRoute,
} from "@/features/schools/schoolSelectors";
import { SCHOOLS } from "@/features/schools/schoolData";
import type { SchoolId } from "@/features/schools/schoolTypes";

/**
 * Phase 6 / The Open World Awakens — surfaces the player's chosen school
 * affinity on the home command deck. Renders nothing for unbound players or
 * legacy saves that pre-date Phase 6 (no affinitySchoolId set yet).
 *
 * The badge is dual-linked: tap the school side to walk to its HQ, tap the
 * lane side to walk the shadow face inside Blackcity.
 */
export default function AffinityBadge() {
  const { state } = useGame();
  const affinityId = state.player.affinitySchoolId as SchoolId | null;
  if (!affinityId || !(affinityId in SCHOOLS)) return null;
  const school = SCHOOLS[affinityId];
  const empire = getEmpireById(school.empireId);

  return (
    <div
      className="rounded-2xl border bg-black/30 px-4 py-3"
      style={{ borderColor: `${school.accentHex}55` }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.22em]"
            style={{ color: school.accentHex }}
          >
            {school.sinDisplay} · {school.nation}
          </p>
          <Link
            href={getSchoolRoute(school.id)}
            className="mt-0.5 block text-sm font-black uppercase tracking-[0.04em] text-white hover:underline"
          >
            {school.shortName}
          </Link>
        </div>
        <Link
          href={getEmpireRoute(empire.id)}
          className="text-[10px] font-bold uppercase tracking-[0.18em] hover:underline"
          style={{ color: empire.accentHex }}
        >
          {empire.doctrineWord}
        </Link>
      </div>
      <Link
        href={school.laneRoute}
        className="mt-2 block text-[10px] uppercase tracking-[0.16em] text-white/55 hover:text-white/80"
      >
        Shadow face → {school.laneDisplay}
      </Link>
    </div>
  );
}
