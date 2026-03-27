"use client";

import Link from "next/link";
import { useGame } from "@/features/game/gameContext";
import {
  computeInstallCost,
  getEffectiveCapacityMax,
  getExecutionalTier,
  HYBRID_CAP_SHRINK_PER_STACK,
  MAX_MINORS_PER_SCHOOL,
  maxRuneDepthAcrossSchools,
} from "@/features/mastery/runeMasteryLogic";
import {
  getMasteryAlignedPickupYieldMultiplier,
  MAX_ALIGNED_PICKUP_YIELD_MULT,
} from "@/features/mastery/masteryGameplayEffects";
import {
  RUNE_SCHOOLS,
  type RuneSchool,
  getPrimaryRuneSchool,
  schoolToCapacityPool,
} from "@/features/mastery/runeMasteryTypes";
import MasteryArcTimeline from "@/components/mastery/MasteryArcTimeline";
import MasteryTreeVisual from "@/components/mastery/MasteryTreeVisual";

const SCHOOL_LABEL: Record<RuneSchool, string> = {
  bio: "Bio",
  mecha: "Mecha",
  pure: "Pure",
};

const SCHOOL_ACCENT: Record<RuneSchool, string> = {
  bio: "from-emerald-500/30 to-emerald-900/10 border-emerald-500/25",
  mecha: "from-amber-500/25 to-amber-950/10 border-amber-400/25",
  pure: "from-violet-500/25 to-violet-950/10 border-violet-400/30",
};

function CapacityBar({
  label,
  cur,
  maxEff,
  barClass,
}: {
  label: string;
  cur: number;
  maxEff: number;
  barClass: string;
}) {
  const pct = maxEff > 0 ? Math.min(100, Math.round((cur / maxEff) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-white/50">
        <span>{label}</span>
        <span>
          {cur}/{maxEff}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/40">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function MasteryDepthPanel() {
  const { state, dispatch } = useGame();
  const { runeMastery, factionAlignment } = state.player;
  const effCap = getEffectiveCapacityMax(runeMastery);
  const primary = getPrimaryRuneSchool(factionAlignment);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_32px_rgba(0,0,0,0.35)]">
      <div className="text-[10px] uppercase tracking-[0.24em] text-amber-200/70">
        Mastery spine · Hour 20–40
      </div>
      <h2 className="mt-2 text-xl font-black uppercase tracking-[0.08em] text-white">
        Mastery tree · Sevenfold depth
      </h2>
      <p className="mt-2 text-sm text-white/60">
        Three parallel rails (Bio / Mecha / Pure). Blood / Frame / Resonance
        capacity pays for minor runes. Three minors in one school unlock the{" "}
        <span className="text-white/90">Executional set (L2)</span>.{" "}
        <span className="text-amber-200/85">
          Hybrid temptation: off-primary installs cost extra on every pool and
          add a permanent stack that shrinks all three ceilings by{" "}
          {HYBRID_CAP_SHRINK_PER_STACK} each.
        </span>{" "}
        Set{" "}
        <Link
          href="/character"
          className="text-cyan-200/90 underline decoration-cyan-400/35 underline-offset-2 hover:text-white"
        >
          career focus
        </Link>{" "}
        on Character for field and district modifiers.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <CapacityBar
          label="Blood (Bio)"
          cur={runeMastery.capacity.blood}
          maxEff={effCap.blood}
          barClass="from-rose-400/80 to-rose-200/40"
        />
        <CapacityBar
          label="Frame (Mecha)"
          cur={runeMastery.capacity.frame}
          maxEff={effCap.frame}
          barClass="from-amber-400/80 to-amber-200/35"
        />
        <CapacityBar
          label="Resonance (Pure)"
          cur={runeMastery.capacity.resonance}
          maxEff={effCap.resonance}
          barClass="from-violet-400/75 to-violet-200/35"
        />
      </div>

      {primary ? (
        <p className="mt-3 text-xs text-white/45">
          Primary path:{" "}
          <span className="text-white/75">{SCHOOL_LABEL[primary]}</span>
        </p>
      ) : (
        <p className="mt-3 text-xs text-white/45">
          Unbound alignment — installs use the neutral cost curve.
        </p>
      )}

      <p className="mt-1 text-xs text-white/40">
        Deepest school (zone depth gates):{" "}
        <span className="font-mono tabular-nums text-white/70">
          L{maxRuneDepthAcrossSchools(runeMastery)}
        </span>
      </p>

      {runeMastery.hybridDrainStacks > 0 ? (
        <p className="mt-1 text-xs text-amber-200/80">
          Hybrid drain stacks: {runeMastery.hybridDrainStacks} (−
          {runeMastery.hybridDrainStacks * HYBRID_CAP_SHRINK_PER_STACK} effective
          max per pool vs baseline ceilings)
        </p>
      ) : null}

      <div className="mt-5">
        <MasteryArcTimeline />
      </div>

      <div className="mt-5">
        <MasteryTreeVisual
          runeMastery={runeMastery}
          primarySchool={primary}
          masteryPoints={
            runeMastery.capacity.blood +
            runeMastery.capacity.frame +
            runeMastery.capacity.resonance
          }
          onInstallMinor={(school) =>
            dispatch({ type: "INSTALL_MINOR_RUNE", payload: { school } })
          }
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {RUNE_SCHOOLS.map((school) => {
              const minors = runeMastery.minorCountBySchool[school];
              const depth = runeMastery.depthBySchool[school];
              const tier = getExecutionalTier(runeMastery, school);
              const theme =
                school === "bio"
                  ? ("bio_rot" as const)
                  : school === "mecha"
                    ? ("ash_mecha" as const)
                    : ("void_pure" as const);
              const alignedPickupMult =
                getMasteryAlignedPickupYieldMultiplier(runeMastery, theme);
              const pctBonus = Math.round((alignedPickupMult - 1) * 100);
          const cost = computeInstallCost({ alignment: factionAlignment, school });
          const pool = schoolToCapacityPool(school);
          const affordable =
            runeMastery.capacity.blood >= cost.blood &&
            runeMastery.capacity.frame >= cost.frame &&
            runeMastery.capacity.resonance >= cost.resonance;
          const capped = minors >= MAX_MINORS_PER_SCHOOL;

          return (
            <div
              key={school}
              className={`flex flex-col rounded-xl border bg-gradient-to-b p-4 ${SCHOOL_ACCENT[school]}`}
            >
              <div className="text-xs font-black uppercase tracking-[0.2em] text-white/90">
                {SCHOOL_LABEL[school]}
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black tabular-nums text-white">
                  L{depth}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-white/45">
                  depth
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {Array.from({ length: MAX_MINORS_PER_SCHOOL }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      i < minors ? "bg-white/80" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-2 text-[11px] text-white/55">
                Minors {minors}/{MAX_MINORS_PER_SCHOOL}
              </div>
              {tier === 2 ? (
                <div className="mt-2 rounded-lg border border-emerald-400/35 bg-black/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200/90">
                  Executional L3
                </div>
              ) : tier === 1 ? (
                <div title="Three or more minors in this school — set tier L2">
                  <div className="mt-2 rounded-lg border border-white/15 bg-black/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200/90">
                    Executional L2
                  </div>
                </div>
              ) : null}
              {pctBonus > 0 ? (
                <div className="mt-2 text-[10px] text-cyan-200/75">
                  +{pctBonus}% pickups in{" "}
                  {theme === "bio_rot"
                    ? "Bio"
                    : theme === "ash_mecha"
                      ? "Mecha"
                      : "Pure"}{" "}
                  zones
                </div>
              ) : null}
              <div className="mt-3 flex-1" />
              <div className="text-[10px] text-white/40">
                Next cost · Blood {cost.blood} / Frame {cost.frame} / Resonance{" "}
                {cost.resonance}{" "}
                <span className="text-white/25">
                  ({pool} primary pool)
                </span>
              </div>
              <button
                type="button"
                disabled={capped || !affordable}
                onClick={() =>
                  dispatch({
                    type: "INSTALL_MINOR_RUNE",
                    payload: { school },
                  })
                }
                className="mt-3 rounded-lg border border-white/15 bg-white/[0.06] py-2 text-[11px] font-bold uppercase tracking-wider text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Install minor
              </button>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-white/40">
        M2 functional: capacity costs still gate installs; hybrid stacks cut
        ceilings. Matching a zone&apos;s loot theme (Bio / Mecha / Pure) scales
        field pickups and contract resource bonuses (cap ≈
        {Math.round((MAX_ALIGNED_PICKUP_YIELD_MULT - 1) * 100)}% before career
        Gathering). Deploy gates use deepest-school depth and, on some realms,
        Executional tier on the theme school.{" "}
        <span className="text-white/50">
          Boss kills can roll phase‑2 named materials (Coilbound Lattice, Ash
          Synod Relic, Vault Lattice Shard) for Crafting sinks.
        </span>
      </p>
    </div>
  );
}
