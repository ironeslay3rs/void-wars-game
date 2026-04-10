import Link from "next/link";

import type { Empire } from "@/features/empires/empireTypes";
import {
  getPantheonRoute,
  getPantheonsForEmpire,
} from "@/features/pantheons/pantheonSelectors";
import { getEmpireRoute } from "@/features/schools/schoolSelectors";
import { SCHOOLS } from "@/features/schools/schoolData";

type PantheonListByEmpireProps = {
  empire: Empire;
  /** When true, the empire heading also links to the empire detail page. */
  linkEmpireHeading?: boolean;
};

/**
 * Renders the pantheons whose schools belong to one empire as a stacked card
 * group. Used on the /pantheons index page.
 */
export default function PantheonListByEmpire({
  empire,
  linkEmpireHeading = false,
}: PantheonListByEmpireProps) {
  const pantheons = getPantheonsForEmpire(empire.id);

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
          {pantheons.length} pantheon{pantheons.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {pantheons.map((pantheon) => {
          const school = SCHOOLS[pantheon.schoolId];
          return (
            <Link
              key={pantheon.id}
              href={getPantheonRoute(pantheon.id)}
              className="group block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10"
              style={{ borderColor: `${pantheon.accentHex}33` }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: pantheon.accentHex }}
              >
                {pantheon.region}
              </p>
              <p className="mt-1 text-base font-black uppercase tracking-[0.04em] text-white group-hover:text-white">
                {pantheon.name} pantheon
              </p>
              <p className="mt-2 text-xs leading-5 text-white/55">
                {pantheon.domain}
              </p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-white/35">
                Inheritor: {school.shortName} · {school.sinDisplay}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
