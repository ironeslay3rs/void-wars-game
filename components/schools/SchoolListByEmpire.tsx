import Link from "next/link";

import type { Empire } from "@/features/empires/empireTypes";
import {
  getEmpireRoute,
  getSchoolRoute,
  getSchoolsByEmpire,
} from "@/features/schools/schoolSelectors";

type SchoolListByEmpireProps = {
  empire: Empire;
  /** When true, the empire heading also links to the empire detail page. */
  linkEmpireHeading?: boolean;
};

/**
 * Renders the schools owned by one empire as a stacked card group.
 * Used on the /schools index and /empires/[id] detail pages.
 */
export default function SchoolListByEmpire({
  empire,
  linkEmpireHeading = false,
}: SchoolListByEmpireProps) {
  const schools = getSchoolsByEmpire(empire.id);

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.32em]"
            style={{ color: `${empire.accentHex}cc` }}
          >
            {empire.doctrineWord}
          </p>
          {linkEmpireHeading ? (
            <Link
              href={getEmpireRoute(empire.id)}
              className="text-xl font-black uppercase tracking-[0.05em] text-white hover:text-white/80"
            >
              {empire.name}
            </Link>
          ) : (
            <h2 className="text-xl font-black uppercase tracking-[0.05em] text-white">
              {empire.name}
            </h2>
          )}
          <p className="mt-1 text-xs italic text-white/55">
            &ldquo;{empire.tagline}&rdquo;
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
          {schools.length} school{schools.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {schools.map((school) => (
          <Link
            key={school.id}
            href={getSchoolRoute(school.id)}
            className="group block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10"
            style={{ borderColor: `${school.accentHex}33` }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: school.accentHex }}
            >
              {school.sinDisplay} · {school.nation}
            </p>
            <p className="mt-1 text-base font-black uppercase tracking-[0.04em] text-white group-hover:text-white">
              {school.name}
            </p>
            <p className="mt-2 text-xs leading-5 text-white/55">
              {school.tagline}
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-white/35">
              Shadow face: {school.laneDisplay}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
