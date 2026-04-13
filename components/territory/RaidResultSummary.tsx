"use client";

/**
 * RaidResultSummary — post-raid summary card.
 *
 * Shows attacker/defender, seed, landed/missed state, resource swing,
 * and stability loss. Host wires `onDismiss` (optional).
 */

import type {
  RaidOutcome,
  Territory,
  TerritoryOwner,
} from "@/features/territory/territoryTypes";
import type { ResourceKey } from "@/features/game/gameTypes";

export type RaidResultSummaryProps = {
  outcome: RaidOutcome;
  territory: Territory;
  attacker: TerritoryOwner;
  defender: TerritoryOwner;
  /** Seed the raid tick was resolved at (display only). */
  seed: number;
  onDismiss?: () => void;
  className?: string;
};

const EMPIRE_LABEL: Record<string, string> = {
  "verdant-coil": "Verdant Coil",
  "chrome-synod": "Chrome Synod",
  "ember-vault": "Ember Vault",
  "black-city": "Black City",
};

const RESOURCE_LABEL: Partial<Record<ResourceKey, string>> = {
  credits: "Credits",
  scrapAlloy: "Scrap Alloy",
  emberCore: "Ember Core",
  bioSamples: "Bio Samples",
  runeDust: "Rune Dust",
  bloodvein: "Bloodvein",
  ironHeart: "Ironheart",
  ashveil: "Ashveil",
  veilAsh: "Veil Ash",
  meldshard: "Meldshard",
  mossRations: "Moss Rations",
};

function ownerLabel(o: TerritoryOwner): string {
  if (o.kind === "guild") return `Guild · ${o.id}`;
  return EMPIRE_LABEL[o.id] ?? o.id;
}

function resourceLabel(k: ResourceKey): string {
  return RESOURCE_LABEL[k] ?? k;
}

export default function RaidResultSummary({
  outcome,
  territory,
  attacker,
  defender,
  seed,
  onDismiss,
  className,
}: RaidResultSummaryProps) {
  const landed = outcome.landed;
  const lootEntries = Object.entries(outcome.loot).filter(
    ([, v]) => typeof v === "number" && (v as number) > 0,
  );

  const frame = landed
    ? "border-rose-500/45"
    : "border-white/15";
  const chip = landed
    ? "border-rose-400/40 bg-rose-500/15 text-rose-100"
    : "border-white/20 bg-white/5 text-white/75";

  return (
    <section
      aria-label={`Raid result · ${territory.name}`}
      className={`rounded-[22px] border ${frame} bg-[linear-gradient(180deg,rgba(14,16,26,0.94),rgba(7,9,15,0.97))] p-4 text-white shadow-[0_12px_28px_rgba(0,0,0,0.32)] backdrop-blur ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
            Raid Result
          </div>
          <div className="mt-0.5 text-lg font-black uppercase tracking-[0.06em] text-white">
            {territory.name}
          </div>
          <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/55">
            {ownerLabel(attacker)} → {ownerLabel(defender)}
          </div>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${chip}`}
        >
          {landed ? "Landed" : "Turned Away"}
        </span>
      </div>

      <p className="mt-3 text-[12px] italic leading-relaxed text-white/70">
        {outcome.flavor}
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
            Resource Swing
          </div>
          {!landed || lootEntries.length === 0 ? (
            <p className="mt-2 text-[12px] text-white/55">
              No tribute taken.
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-[12px]" role="list">
              {lootEntries.map(([k, v]) => (
                <li
                  key={k}
                  className="flex items-baseline justify-between border-b border-white/5 pb-1 last:border-0"
                >
                  <span className="text-white/75">
                    {resourceLabel(k as ResourceKey)}
                  </span>
                  <span className="font-bold tabular-nums text-rose-200">
                    -{v}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-rose-400/25 bg-rose-500/8 p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-rose-200/75">
            Defender Losses
          </div>
          <ul className="mt-2 space-y-1 text-[12px]" role="list">
            <li className="flex items-baseline justify-between">
              <span className="text-white/75">Stability loss</span>
              <span className="font-bold tabular-nums text-rose-200">
                -{(outcome.stabilityLoss * 100).toFixed(1)}%
              </span>
            </li>
            <li className="flex items-baseline justify-between">
              <span className="text-white/75">Seed</span>
              <span className="font-mono text-[11px] tabular-nums text-white/70">
                {seed}
              </span>
            </li>
          </ul>
          <p className="mt-2 text-[10px] text-white/50">
            Raids do not flip territories — they bleed them.
          </p>
        </div>
      </div>

      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold uppercase tracking-[0.12em] text-white/80 transition hover:bg-white/10"
        >
          Dismiss
        </button>
      ) : null}
    </section>
  );
}
