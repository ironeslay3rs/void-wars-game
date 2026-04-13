"use client";

/**
 * WarStatusBanner — list of active wars with momentum bar, phase chip,
 * and a Skirmish CTA. AFK Journey clarity: the player should be able to
 * read the state of every war in one glance.
 *
 * Presentational — onSkirmish is the only callback out.
 */

import type {
  Territory,
  War,
  WarPhase,
  TerritoryOwner,
} from "@/features/territory/territoryTypes";

export type WarStatusBannerProps = {
  wars: readonly War[];
  territories: readonly Territory[];
  onSkirmish?: (warId: string) => void;
  className?: string;
};

const PHASE_LABEL: Record<WarPhase, string> = {
  skirmish: "Skirmish",
  siege: "Siege",
  assault: "Assault",
  resolved: "Resolved",
};

const PHASE_CHIP: Record<WarPhase, string> = {
  skirmish: "border-white/20 bg-white/5 text-white/80",
  siege: "border-amber-400/35 bg-amber-500/12 text-amber-100",
  assault: "border-rose-500/45 bg-rose-500/15 text-rose-100",
  resolved: "border-emerald-400/35 bg-emerald-500/12 text-emerald-100",
};

const EMPIRE_LABEL: Record<string, string> = {
  "verdant-coil": "Verdant Coil",
  "chrome-synod": "Chrome Synod",
  "ember-vault": "Ember Vault",
  "black-city": "Black City",
};

function ownerLabel(o: TerritoryOwner): string {
  if (o.kind === "guild") return `Guild · ${o.id}`;
  return EMPIRE_LABEL[o.id] ?? o.id;
}

function findTerritoryName(
  territories: readonly Territory[],
  id: string,
): string {
  return territories.find((t) => t.id === id)?.name ?? id;
}

export default function WarStatusBanner({
  wars,
  territories,
  onSkirmish,
  className,
}: WarStatusBannerProps) {
  const active = wars.filter((w) => w.phase !== "resolved");

  return (
    <section
      aria-label="Active wars"
      className={`rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,16,20,0.94),rgba(10,8,14,0.97))] p-4 text-white shadow-[0_12px_28px_rgba(0,0,0,0.32)] backdrop-blur ${className ?? ""}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
            War Status
          </div>
          <div className="mt-0.5 text-base font-black uppercase tracking-[0.06em] text-white">
            {active.length === 0
              ? "Quiet on every front"
              : `${active.length} Active War${active.length === 1 ? "" : "s"}`}
          </div>
        </div>
        <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
          {wars.length} tracked
        </span>
      </div>

      {active.length === 0 ? (
        <p className="mt-3 text-[11px] italic leading-relaxed text-white/55">
          No banners raised. The Three Empires hold their lines — for now.
        </p>
      ) : (
        <ul role="list" className="mt-3 space-y-2.5">
          {active.map((w) => {
            const name = findTerritoryName(territories, w.territoryId);
            const momentumPct = Math.round(((w.momentum + 1) / 2) * 100);
            const favorAttacker = w.momentum > 0.05;
            const favorDefender = w.momentum < -0.05;
            return (
              <li
                key={w.id}
                className="rounded-xl border border-white/10 bg-black/30 p-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold uppercase tracking-[0.06em] text-white">
                      {name}
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/55">
                      {ownerLabel(w.attacker)} → {ownerLabel(w.defender)}
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] ${PHASE_CHIP[w.phase]}`}
                  >
                    {PHASE_LABEL[w.phase]} · T{w.ticks}
                  </span>
                </div>

                <div className="mt-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[9px] uppercase tracking-[0.16em] text-white/45">
                      Momentum
                    </span>
                    <span
                      className={`text-[11px] font-bold tabular-nums ${
                        favorAttacker
                          ? "text-rose-200"
                          : favorDefender
                            ? "text-emerald-200"
                            : "text-white/70"
                      }`}
                    >
                      {w.momentum >= 0 ? "+" : ""}
                      {w.momentum.toFixed(2)}
                    </span>
                  </div>
                  <div
                    className="relative mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10"
                    role="progressbar"
                    aria-valuenow={momentumPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="War momentum"
                  >
                    <div
                      className={`h-full ${favorAttacker ? "bg-rose-500/75" : favorDefender ? "bg-emerald-400/75" : "bg-white/40"}`}
                      style={{ width: `${momentumPct}%` }}
                    />
                    <div className="absolute inset-y-0 left-1/2 w-px bg-white/40" />
                  </div>
                  <div className="mt-1 flex justify-between text-[9px] uppercase tracking-[0.14em] text-white/35">
                    <span>Defender</span>
                    <span>Attacker</span>
                  </div>
                </div>

                {onSkirmish ? (
                  <button
                    type="button"
                    onClick={() => onSkirmish(w.id)}
                    className="mt-3 w-full rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-400/50 hover:bg-rose-500/20"
                  >
                    Run Skirmish
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
