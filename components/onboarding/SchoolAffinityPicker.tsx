"use client";

import type { PathType } from "@/features/game/gameTypes";
import { getSchoolsByEmpire } from "@/features/schools/schoolSelectors";
import type { SchoolId } from "@/features/schools/schoolTypes";

type SchoolAffinityPickerProps = {
  empire: PathType;
  value: SchoolId | null;
  onChange: (next: SchoolId) => void;
};

/**
 * Phase 6 / The Open World Awakens: after the player commits to an empire
 * (Bio / Mecha / Pure), this picker shows the 2-3 canonical schools that
 * empire owns. Picking one establishes the player's school affinity — the
 * "open face" of one of the seven sins they've adopted as their own.
 *
 * Each card surfaces:
 *  - the school name and short tagline
 *  - the sin and nation/pantheon anchoring
 *  - the paired black market lane (the shadow face the player will also walk)
 */
export default function SchoolAffinityPicker({
  empire,
  value,
  onChange,
}: SchoolAffinityPickerProps) {
  const schools = getSchoolsByEmpire(empire);

  return (
    <div className="space-y-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
        Step 2.5 — Choose your school
      </div>
      <p className="text-xs text-white/50">
        The deal opened a door inside your empire. Three schools (or two)
        train in this empire&apos;s tradition. Each one wears a different sin
        in the open. Pick the one whose shadow you can live with.
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        {schools.map((school) => {
          const active = value === school.id;
          return (
            <button
              key={school.id}
              type="button"
              onClick={() => onChange(school.id)}
              className="rounded-2xl border bg-black/30 p-5 text-left transition hover:bg-black/40"
              style={{
                borderColor: active
                  ? school.accentHex
                  : `${school.accentHex}33`,
                boxShadow: active
                  ? `0 0 32px ${school.accentHex}33`
                  : undefined,
              }}
            >
              <div
                className="text-[10px] font-bold uppercase tracking-[0.22em]"
                style={{ color: school.accentHex }}
              >
                {school.sinDisplay} · {school.nation}
              </div>
              <div className="mt-1 text-base font-black uppercase tracking-[0.04em] text-white">
                {school.shortName}
              </div>
              <p className="mt-2 text-xs leading-5 text-white/65">
                {school.tagline}
              </p>

              <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Shadow face
                </div>
                <p className="mt-1 text-[11px] text-white/65">
                  {school.laneDisplay}
                </p>
              </div>

              {active ? (
                <div className="mt-3 inline-flex rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                  Sworn
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
