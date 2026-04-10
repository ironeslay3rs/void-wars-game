import Link from "next/link";

import PantheonBlessingPanel from "@/components/pantheons/PantheonBlessingPanel";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import { getEmpireById } from "@/features/empires/empireSelectors";
import type { Pantheon } from "@/features/pantheons/pantheonTypes";
import {
  getPantheonRoute,
  getPantheonsForEmpire,
} from "@/features/pantheons/pantheonSelectors";
import { SCHOOLS } from "@/features/schools/schoolData";
import {
  getEmpireRoute,
  getSchoolRoute,
} from "@/features/schools/schoolSelectors";

type PantheonHqScreenProps = {
  pantheon: Pantheon;
};

export default function PantheonHqScreen({ pantheon }: PantheonHqScreenProps) {
  const school = SCHOOLS[pantheon.schoolId];
  const empire = getEmpireById(school.empireId);

  // Sister pantheons — others within the same parent empire.
  const sisters = getPantheonsForEmpire(empire.id).filter(
    (p) => p.id !== pantheon.id,
  );

  return (
    <main
      className="min-h-screen px-6 py-10 text-white md:px-10"
      style={{
        background: `radial-gradient(circle at top, ${pantheon.accentHex}33, rgba(5,8,20,1) 55%)`,
      }}
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        <ScreenHeader
          eyebrow={`Pantheon · ${pantheon.region}`}
          title={`${pantheon.name} pantheon`}
          subtitle={pantheon.remnant}
          backHref="/pantheons"
          backLabel="Back to Pantheons"
        />

        {/* Inheritor breadcrumb + cross-links */}
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/55">
          <Link
            href={getEmpireRoute(empire.id)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/30 hover:bg-white/10"
            style={{ color: empire.accentHex }}
          >
            ↑ {empire.name}
          </Link>
          <Link
            href={getSchoolRoute(school.id)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/30 hover:bg-white/10"
            style={{ color: school.accentHex }}
          >
            → {school.shortName} (school of {school.sinDisplay})
          </Link>
          <span
            className="ml-auto rounded-lg border bg-black/30 px-3 py-2"
            style={{
              borderColor: `${pantheon.accentHex}66`,
              color: pantheon.accentHex,
            }}
            title={
              pantheon.canonSource === "book"
                ? "Confirmed in master canon"
                : pantheon.canonSource === "puppy-spinoff"
                  ? "Confirmed in the Puppy spinoff"
                  : "Game-side cultural framing — see VOID_WARS_CANON_GAPS.md"
            }
          >
            {pantheon.canonSource === "game-specific" ? "Game lore" : "Canon"}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionCard
            title="The shattered remnants"
            description="What this pantheon's surviving practice carries forward."
          >
            <div className="space-y-4 text-sm leading-6 text-white/75">
              <p>{pantheon.longForm}</p>
            </div>
          </SectionCard>

          <SectionCard
            title="Cultural anchors"
            description="Where the practice came from and what it teaches."
          >
            <div className="space-y-3 text-sm">
              <div
                className="rounded-xl border p-4"
                style={{
                  borderColor: `${pantheon.accentHex}55`,
                  background: `${pantheon.accentHex}14`,
                }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: pantheon.accentHex }}
                >
                  Domain
                </p>
                <p className="mt-2 text-xs leading-5 text-white/80">
                  {pantheon.domain}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
                  Region
                </p>
                <p className="mt-2 text-xs leading-5 text-white/70">
                  {pantheon.region}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
                  Era
                </p>
                <p className="mt-2 text-xs leading-5 text-white/70">
                  {pantheon.era}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <PantheonBlessingPanel pantheon={pantheon} />

        <SectionCard
          title="The school that inherited the discipline"
          description="Which open-face institution carries this pantheon's surviving practice."
        >
          <Link
            href={getSchoolRoute(school.id)}
            className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10"
            style={{ borderColor: `${school.accentHex}33` }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: school.accentHex }}
            >
              {school.sinDisplay} · {school.nation}
            </p>
            <p className="mt-1 text-base font-black uppercase tracking-[0.04em] text-white">
              {school.name}
            </p>
            <p className="mt-2 text-xs leading-5 text-white/55">
              {school.tagline}
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-white/35">
              Shadow face: {school.laneDisplay}
            </p>
          </Link>
        </SectionCard>

        {sisters.length > 0 ? (
          <SectionCard
            title={`Sister pantheons of the ${empire.name}`}
            description="The other cultural traditions this empire absorbed."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {sisters.map((sister) => {
                const sisterSchool = SCHOOLS[sister.schoolId];
                return (
                  <Link
                    key={sister.id}
                    href={getPantheonRoute(sister.id)}
                    className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10"
                    style={{ borderColor: `${sister.accentHex}33` }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.22em]"
                      style={{ color: sister.accentHex }}
                    >
                      {sister.region}
                    </p>
                    <p className="mt-1 text-sm font-bold uppercase tracking-[0.04em] text-white">
                      {sister.name} pantheon
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-white/40">
                      Inheritor: {sisterSchool.shortName}
                    </p>
                  </Link>
                );
              })}
            </div>
          </SectionCard>
        ) : null}
      </div>
    </main>
  );
}
