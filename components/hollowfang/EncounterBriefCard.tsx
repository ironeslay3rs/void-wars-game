/**
 * EncounterBriefCard — Hollowfang boss profile + phase telegraph preview.
 *
 * Surfaces the HOLLOWFANG_PROFILE phases with their tells so players can
 * read the fight before engaging. Darkest-Dungeon pillar: the danger is
 * legible; misreads are punished fairly.
 *
 * Canon: empire names (Verdant Coil / Chrome Synod / Ember Vault) render
 * verbatim from the profile flavor strings.
 */

import type {
  HollowfangPhase,
  HollowfangProfile,
} from "@/features/hollowfang/hollowfangProfile";
import type { RewardTier } from "@/features/hollowfang/encounterResolver";

export type EncounterBriefCardProps = {
  profile: HollowfangProfile;
  /**
   * Preview tier — what the UI believes the player WILL earn if they engage
   * now. Usually "victory" when readiness is high, else "partial" / "wipe".
   */
  previewTier?: RewardTier;
  className?: string;
};

const TIER_LABEL: Record<RewardTier, string> = {
  victory: "Victory Tier",
  partial: "Partial Tier",
  wipe: "Wipe Tier",
};

const TIER_TONE: Record<RewardTier, string> = {
  victory: "border-emerald-400/40 bg-emerald-500/12 text-emerald-100",
  partial: "border-amber-400/35 bg-amber-500/12 text-amber-100",
  wipe: "border-rose-400/45 bg-rose-500/12 text-rose-100",
};

const TIER_BLURB: Record<RewardTier, string> = {
  victory:
    "Apex materials, Black-Mark-adjacent scrip, full reward roll. Engage with discipline.",
  partial:
    "Reduced pull — credits and lesser forms. The pit keeps the rest.",
  wipe: "Scraps only. Full corruption tax plus condition damage.",
};

function dangerTone(budget: number): string {
  if (budget >= 8) return "border-rose-400/45 bg-rose-500/12 text-rose-100";
  if (budget >= 6) return "border-orange-400/35 bg-orange-500/12 text-orange-100";
  if (budget >= 4) return "border-amber-400/35 bg-amber-500/12 text-amber-100";
  return "border-white/15 bg-white/5 text-white/75";
}

function PhaseRow({ phase }: { phase: HollowfangPhase }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
            Phase {phase.order}
          </div>
          <div className="mt-0.5 text-[15px] font-black uppercase tracking-[0.08em] text-white">
            {phase.name}
          </div>
        </div>
        <div className="shrink-0 text-right text-[10px] uppercase tracking-[0.16em] text-white/50">
          <div>Turn cap · {phase.turnCap}</div>
          <div>Base dmg · {phase.baseDamage}</div>
        </div>
      </div>
      <p className="mt-2 text-[11px] italic leading-relaxed text-violet-100/70">
        {phase.flavor}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {phase.tells.map((t) => (
          <span
            key={t.id}
            title={t.flavor}
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${dangerTone(t.dangerBudget)}`}
          >
            {t.label} · {t.dangerBudget}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function EncounterBriefCard({
  profile,
  previewTier,
  className,
}: EncounterBriefCardProps) {
  return (
    <section
      aria-label={`Encounter brief · ${profile.displayName}`}
      className={`rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,16,26,0.94),rgba(7,9,15,0.97))] p-5 text-white shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/45">
            Encounter Brief · Prestige
          </div>
          <div className="mt-1 text-xl font-black uppercase tracking-[0.08em] text-white">
            {profile.displayName}
          </div>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-violet-200/55">
            Rec rank · {profile.recommendedRankLevel} · HP {profile.maxHp} ·
            Corruption tax {profile.baseCorruptionTax}
          </p>
        </div>
        {previewTier ? (
          <span
            className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${TIER_TONE[previewTier]}`}
          >
            {TIER_LABEL[previewTier]}
          </span>
        ) : null}
      </div>

      {previewTier ? (
        <p className="mt-3 text-[12px] leading-relaxed text-white/70">
          {TIER_BLURB[previewTier]}
        </p>
      ) : null}

      <div className="mt-4 space-y-2">
        {profile.phases.map((p) => (
          <PhaseRow key={p.id} phase={p} />
        ))}
      </div>
    </section>
  );
}
