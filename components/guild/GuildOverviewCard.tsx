"use client";

/**
 * GuildOverviewCard — top-of-screen banner for the active guild.
 *
 * Shows name, allegiance, current rank, progress to next rank, and the
 * rank's active perks. Presentational only: props in, no dispatch.
 *
 * Canon copy: Pure (NEVER "Spirit"). Empires: Verdant Coil / Chrome
 * Synod / Ember Vault. Ranks verbatim from features/guild/guildRanks.
 */

import type {
  Guild,
  GuildPerk,
  GuildRank,
} from "@/features/guild/guildTypes";

const ALLEGIANCE_LABEL: Record<Guild["allegiance"], string> = {
  verdant_coil: "Verdant Coil",
  chrome_synod: "Chrome Synod",
  ember_vault: "Ember Vault",
  black_city: "Black City",
};

const ALLEGIANCE_CHIP: Record<Guild["allegiance"], string> = {
  verdant_coil: "border-emerald-400/35 bg-emerald-500/12 text-emerald-100",
  chrome_synod: "border-cyan-400/35 bg-cyan-500/12 text-cyan-100",
  ember_vault: "border-amber-400/35 bg-amber-500/12 text-amber-100",
  black_city: "border-white/20 bg-white/5 text-white/80",
};

export type GuildOverviewCardProps = {
  guild: Guild;
  rank: GuildRank;
  nextRank: GuildRank | null;
  perks: GuildPerk[];
  className?: string;
};

export default function GuildOverviewCard({
  guild,
  rank,
  nextRank,
  perks,
  className,
}: GuildOverviewCardProps) {
  const allegianceLabel = ALLEGIANCE_LABEL[guild.allegiance];
  const allegianceChip = ALLEGIANCE_CHIP[guild.allegiance];

  const total = guild.totalContribution;
  const base = rank.threshold;
  const ceiling = nextRank?.threshold ?? base;
  const span = Math.max(1, ceiling - base);
  const into = Math.max(0, total - base);
  const pct = nextRank
    ? Math.max(0, Math.min(100, Math.round((into / span) * 100)))
    : 100;

  return (
    <section
      aria-label={`Guild overview · ${guild.name}`}
      className={`rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(14,16,26,0.94),rgba(7,9,15,0.97))] p-4 text-white shadow-[0_12px_32px_rgba(0,0,0,0.3)] backdrop-blur-md ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
            Guild · {allegianceLabel}
          </div>
          <div className="mt-0.5 truncate text-lg font-black uppercase tracking-[0.06em] text-white">
            {guild.name}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${allegianceChip}`}
        >
          {allegianceLabel}
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
              Standing
            </div>
            <div className="mt-0.5 text-sm font-black uppercase tracking-[0.08em] text-white">
              {rank.label}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-[0.16em] text-white/40">
              Contribution
            </div>
            <div className="text-sm font-bold tabular-nums text-white/90">
              {total.toLocaleString()}
            </div>
          </div>
        </div>

        <p className="mt-2 text-[11px] italic leading-relaxed text-violet-100/70">
          {rank.flavor}
        </p>

        <div className="mt-3">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label="Progress to next rank"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400/70 to-violet-400/70"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 flex items-baseline justify-between text-[10px] uppercase tracking-[0.14em] text-white/45">
            <span>
              {nextRank
                ? `Next · ${nextRank.label}`
                : "Blackcrown · apex standing"}
            </span>
            <span className="tabular-nums text-white/60">
              {nextRank
                ? `${total.toLocaleString()} / ${ceiling.toLocaleString()}`
                : `${total.toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>

      {perks.length > 0 ? (
        <div className="mt-3">
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            Active perks
          </div>
          <ul className="mt-1.5 space-y-1.5" role="list">
            {perks.map((p) => (
              <li
                key={p.key}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/85">
                    {p.label}
                  </span>
                  {p.rewardMultiplier != null ? (
                    <span className="text-[10px] font-bold tabular-nums text-amber-200">
                      x{p.rewardMultiplier.toFixed(2)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-white/55">
                  {p.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 text-[11px] leading-relaxed text-white/50">
          No perks unlocked yet. Bank contribution to climb to Bonded
          Contractor.
        </p>
      )}
    </section>
  );
}
