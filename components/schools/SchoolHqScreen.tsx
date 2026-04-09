"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import { getEmpireById } from "@/features/empires/empireSelectors";
import { useGame } from "@/features/game/gameContext";
import {
  getEmpireRoute,
  getSchoolRoute,
  getSchoolsByEmpire,
} from "@/features/schools/schoolSelectors";
import type { School } from "@/features/schools/schoolTypes";

type SchoolHqScreenProps = {
  school: School;
};

const PRESSURE_LABELS: Record<School["pressure"], string> = {
  escalation: "Escalation pressure — the longer you stay, the harder it hits.",
  consumption: "Consumption pressure — the region eats your supplies and buffs.",
  comparison: "Comparison pressure — the region adapts to your patterns.",
  temptation: "Temptation pressure — short-term boons cost long-term stability.",
  hoarding: "Hoarding pressure — carrying too much value gets punished.",
  exposure: "Exposure pressure — anything visible gets marked and hit.",
  delay: "Delay pressure — the region tries to make you late, then fatal.",
};

const COUNTERMEASURE_LABELS: Record<School["countermeasure"], string> = {
  "burst-sustain-disengage": "Burst sustain + disengage tools (heals, sprint, pursuit-break)",
  "efficiency-conversion": "Efficiency + conversion tools (rationing, sacrificial decoys)",
  "modular-swap": "Modular swap kits (anti-copy injectors, scramblers)",
  "cleansing-boon": "Cleansing + boon management (purity filters, anti-charm)",
  "compression-protect": "Compression + asset protection (stash insurance, anti-curse seals)",
  "shielding-anti-mark": "Shielding + anti-mark tech (reflectors, dampeners)",
  "tempo-restoration": "Tempo restoration (reset tools, queue interrupts)",
};

export default function SchoolHqScreen({ school }: SchoolHqScreenProps) {
  const { state, dispatch } = useGame();
  const empire = getEmpireById(school.empireId);
  const playerAlignment = state.player.factionAlignment;
  const isAligned = playerAlignment === school.empireId;

  // Phase 7 / convergence wire-up: visiting a school HQ whose empire is NOT
  // the player's alignment is a cross-school exposure event. The reducer
  // silently tracks it via the convergence seed and may fire a one-shot
  // anomaly toast on the very first off-school touch.
  const lastFiredForSchoolRef = useRef<string | null>(null);
  useEffect(() => {
    if (playerAlignment === "unbound") return;
    if (playerAlignment === school.empireId) return;
    if (lastFiredForSchoolRef.current === school.id) return;
    lastFiredForSchoolRef.current = school.id;
    dispatch({
      type: "RECORD_CROSS_SCHOOL_EVENT",
      payload: { school: school.empireId },
    });
  }, [dispatch, playerAlignment, school.empireId, school.id]);

  // Sister schools — others in the same empire
  const sisters = getSchoolsByEmpire(school.empireId).filter(
    (s) => s.id !== school.id,
  );

  return (
    <main
      className="min-h-screen px-6 py-10 text-white md:px-10"
      style={{
        background: `radial-gradient(circle at top, ${school.accentHex}33, rgba(5,8,20,1) 55%)`,
      }}
    >
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        <ScreenHeader
          eyebrow={`${school.sinDisplay} · ${school.nation} (${school.pantheon})`}
          title={school.name}
          subtitle={school.tagline}
          backHref="/schools"
          backLabel="Back to Schools"
        />

        {/* Empire breadcrumb + dual-face cross-link */}
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/55">
          <Link
            href={getEmpireRoute(empire.id)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/30 hover:bg-white/10"
            style={{ color: empire.accentHex }}
          >
            ↑ {empire.name}
          </Link>
          {isAligned ? (
            <span
              className="rounded-lg border bg-white/5 px-3 py-2"
              style={{
                borderColor: `${school.accentHex}66`,
                color: school.accentHex,
              }}
            >
              Your empire
            </span>
          ) : null}
          <Link
            href={school.laneRoute}
            className="ml-auto rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white/85 transition hover:border-white/35 hover:bg-black/50"
          >
            ↓ Visit the shadow face: {school.laneDisplay}
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <SectionCard
            title="Lore"
            description="What this school is and what it teaches."
          >
            <div className="space-y-4 text-sm leading-6 text-white/75">
              <p>{school.longForm}</p>
            </div>
          </SectionCard>

          <SectionCard
            title="Field doctrine"
            description="What you'll feel in their territory."
          >
            <div className="space-y-4 text-sm">
              <div
                className="rounded-xl border p-4"
                style={{
                  borderColor: `${school.accentHex}55`,
                  background: `${school.accentHex}14`,
                }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: school.accentHex }}
                >
                  Pressure identity
                </p>
                <p className="mt-1 text-lg font-bold capitalize text-white">
                  {school.pressure}
                </p>
                <p className="mt-2 text-xs leading-5 text-white/65">
                  {PRESSURE_LABELS[school.pressure]}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
                  Countermeasure prep
                </p>
                <p className="mt-2 text-xs leading-5 text-white/70">
                  {COUNTERMEASURE_LABELS[school.countermeasure]}
                </p>
              </div>

              <div className="rounded-xl border border-amber-300/20 bg-amber-500/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200/80">
                  Breakthrough condition
                </p>
                <p className="mt-2 text-xs leading-5 text-amber-50/80">
                  {school.breakthrough}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {sisters.length > 0 ? (
          <SectionCard
            title={`Sister schools of the ${empire.name}`}
            description="The other public faces this empire wears."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {sisters.map((sister) => (
                <Link
                  key={sister.id}
                  href={getSchoolRoute(sister.id)}
                  className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10"
                  style={{ borderColor: `${sister.accentHex}33` }}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.22em]"
                    style={{ color: sister.accentHex }}
                  >
                    {sister.sinDisplay} · {sister.nation}
                  </p>
                  <p className="mt-1 text-sm font-bold uppercase tracking-[0.04em] text-white">
                    {sister.shortName}
                  </p>
                </Link>
              ))}
            </div>
          </SectionCard>
        ) : null}
      </div>
    </main>
  );
}
