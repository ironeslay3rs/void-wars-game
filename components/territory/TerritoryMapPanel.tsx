"use client";

/**
 * TerritoryMapPanel — world-state surface for Task 4.6 Territory War.
 *
 * Renders the 8 canonical territories (three empire seats + Black City +
 * four Black Market lanes) as a responsive grid. Each card shows: canonical
 * name, current owner badge, stability gauge, tribute rate chips, and any
 * active-war indicator. Presentational only — no dispatch, no useGame.
 *
 * Canon: "Pure" (never "Spirit"). Territory names come verbatim from the
 * backend registry; this component never invents labels.
 */

import type {
  Territory,
  TerritoryOwner,
  War,
} from "@/features/territory/territoryTypes";
import type { ResourceKey } from "@/features/game/gameTypes";
import { selectTerritoryPressure } from "@/features/territory/economyPressure";

export type TerritoryMapPanelProps = {
  territories: readonly Territory[];
  wars: readonly War[];
  /** Highlighted territory (e.g. currently focused in a parent screen). */
  activeTerritoryId?: string | null;
  /** Host wires this to start/open a skirmish on this territory. */
  onSelectTerritory?: (territoryId: string) => void;
  /** Host wires this to run a raid tick against this territory. */
  onRaid?: (territoryId: string) => void;
  className?: string;
};

const EMPIRE_LABEL: Record<string, string> = {
  "verdant-coil": "Verdant Coil",
  "chrome-synod": "Chrome Synod",
  "ember-vault": "Ember Vault",
  "black-city": "Black City",
};

const EMPIRE_CHIP: Record<string, string> = {
  "verdant-coil": "border-emerald-400/35 bg-emerald-500/12 text-emerald-100",
  "chrome-synod": "border-cyan-400/35 bg-cyan-500/12 text-cyan-100",
  "ember-vault": "border-amber-400/40 bg-amber-500/14 text-amber-100",
  "black-city": "border-violet-400/35 bg-violet-500/12 text-violet-100",
};

const RESOURCE_LABEL: Partial<Record<ResourceKey, string>> = {
  credits: "Credits",
  scrapAlloy: "Scrap",
  emberCore: "Ember",
  bioSamples: "Bio",
  runeDust: "Rune",
  bloodvein: "Bloodvein",
  ironHeart: "Ironheart",
  ashveil: "Ashveil",
  veilAsh: "Veil Ash",
  meldshard: "Meldshard",
  mossRations: "Moss Rations",
};

function resourceShort(k: ResourceKey): string {
  return RESOURCE_LABEL[k] ?? k;
}

function ownerBadge(owner: TerritoryOwner): { label: string; chip: string } {
  if (owner.kind === "guild") {
    return {
      label: `Guild · ${owner.id}`,
      chip: "border-white/20 bg-white/8 text-white/80",
    };
  }
  return {
    label: EMPIRE_LABEL[owner.id] ?? owner.id,
    chip: EMPIRE_CHIP[owner.id] ?? "border-white/15 bg-white/5 text-white/80",
  };
}

function stabilityTone(stability: number): { bar: string; text: string } {
  if (stability >= 0.7)
    return { bar: "bg-emerald-400/75", text: "text-emerald-200" };
  if (stability >= 0.45)
    return { bar: "bg-amber-400/75", text: "text-amber-200" };
  return { bar: "bg-rose-500/80", text: "text-rose-200" };
}

export default function TerritoryMapPanel({
  territories,
  wars,
  activeTerritoryId,
  onSelectTerritory,
  onRaid,
  className,
}: TerritoryMapPanelProps) {
  return (
    <section
      aria-label="Territory map"
      className={`rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,16,26,0.94),rgba(7,9,15,0.97))] p-4 text-white shadow-[0_12px_32px_rgba(0,0,0,0.32)] backdrop-blur ${className ?? ""}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
            World Map · Territory War
          </div>
          <div className="mt-0.5 text-base font-black uppercase tracking-[0.06em] text-white">
            {territories.length} Contested Zones
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
          Three Empires · Black City
        </div>
      </div>

      <ul
        role="list"
        className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {territories.map((t) => {
          const badge = ownerBadge(t.owner);
          const stabPct = Math.round(t.stability * 100);
          const tone = stabilityTone(t.stability);
          const pressure = selectTerritoryPressure(t, wars);
          const isActive = activeTerritoryId === t.id;
          const tributeEntries = Object.entries(t.tributeRate).filter(
            ([, v]) => typeof v === "number" && (v as number) > 0,
          );

          return (
            <li key={t.id}>
              <div
                className={`rounded-2xl border p-3 transition ${
                  isActive
                    ? "border-white/30 bg-white/[0.06]"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold uppercase tracking-[0.06em] text-white">
                      {t.name}
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-white/45">
                      {EMPIRE_LABEL[t.anchorEmpire] ?? t.anchorEmpire}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] ${badge.chip}`}
                    aria-label={`Owner ${badge.label}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="mt-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[9px] uppercase tracking-[0.16em] text-white/45">
                      Stability
                    </span>
                    <span
                      className={`text-[11px] font-bold tabular-nums ${tone.text}`}
                    >
                      {stabPct}%
                    </span>
                  </div>
                  <div
                    className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10"
                    role="progressbar"
                    aria-valuenow={stabPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={`h-full ${tone.bar}`}
                      style={{ width: `${stabPct}%` }}
                    />
                  </div>
                </div>

                {tributeEntries.length > 0 ? (
                  <ul className="mt-2.5 flex flex-wrap gap-1">
                    {tributeEntries.map(([k, v]) => (
                      <li
                        key={k}
                        className="rounded-md border border-white/12 bg-black/25 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.04em] text-white/70"
                      >
                        {resourceShort(k as ResourceKey)} +{v}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-2 flex flex-wrap gap-1">
                  {pressure.underSiege ? (
                    <span className="rounded-full border border-rose-400/40 bg-rose-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-rose-100">
                      Under Siege
                    </span>
                  ) : null}
                  {pressure.activeWars > 0 ? (
                    <span className="rounded-full border border-amber-400/35 bg-amber-500/12 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-100">
                      Wars {pressure.activeWars}
                    </span>
                  ) : null}
                  <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/60">
                    Raid risk {Math.round(pressure.raidRisk * 100)}%
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-[10.5px] leading-relaxed text-white/55">
                  {t.flavor}
                </p>

                {(onSelectTerritory || onRaid) ? (
                  <div className="mt-3 flex gap-2">
                    {onSelectTerritory ? (
                      <button
                        type="button"
                        onClick={() => onSelectTerritory(t.id)}
                        className="flex-1 rounded-lg border border-white/15 bg-white/[0.05] px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80 transition hover:border-white/25 hover:bg-white/[0.09]"
                      >
                        Focus
                      </button>
                    ) : null}
                    {onRaid ? (
                      <button
                        type="button"
                        onClick={() => onRaid(t.id)}
                        className="flex-1 rounded-lg border border-rose-400/30 bg-rose-500/10 px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-rose-100 transition hover:border-rose-400/50 hover:bg-rose-500/20"
                      >
                        Raid
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
