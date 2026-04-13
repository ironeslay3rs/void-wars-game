"use client";

/**
 * SharedContractsPanel — list of the guild's active contracts with
 * progress bars, objective summaries, reward previews, and a per-contract
 * contribute CTA.
 *
 * Presentational: host wires `onContribute` and `onOpenContract`.
 *
 * Canon copy: Pure never "Spirit". Contract flavor comes straight from
 * the registry — no rewrites here.
 */

import type { ResourceKey } from "@/features/game/gameTypes";
import type {
  ContractObjective,
  SharedContract,
} from "@/features/guild/guildTypes";
import type { VoidZoneLootTheme } from "@/features/void-maps/zoneData";

const THEME_LABEL: Record<VoidZoneLootTheme, string> = {
  ash_mecha: "Ash · Mecha",
  bio_rot: "Bio · Rot",
  void_pure: "Void · Pure",
};

const RESOURCE_LABEL: Partial<Record<ResourceKey, string>> = {
  credits: "Credits",
  scrapAlloy: "Scrap Alloy",
  runeDust: "Rune Dust",
  emberCore: "Ember Core",
  bioSamples: "Bio Samples",
  veinshard: "Veinshard",
  heartIron: "Heart-Iron",
  veilAsh: "Veil Ash",
  meldshard: "Meldshard",
  bloodvein: "Bloodvein",
  ashveil: "Ashveil",
  ironHeart: "Ironheart",
  coilboundLattice: "Coilbound Lattice",
  ashSynodRelic: "Synod Relic",
  vaultLatticeShard: "Vault Lattice",
};

function resourceLabel(k: ResourceKey): string {
  return RESOURCE_LABEL[k] ?? k;
}

function objectiveSummary(obj: ContractObjective): string {
  switch (obj.kind) {
    case "hunt_zone_theme":
      return `Clear ${THEME_LABEL[obj.theme]} mobs`;
    case "collect_material":
      return `Collect ${resourceLabel(obj.materialKey)}`;
    case "clear_hollowfang":
      return "Clear Hollowfang settlements";
    case "boss_kills":
      return "Drop void-field bosses";
    case "craft_items":
      return "Craft any-school items";
  }
}

function formatExpiry(expiresAt: number, now: number): string {
  const ms = Math.max(0, expiresAt - now);
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

const STATUS_CHIP: Record<SharedContract["status"], string> = {
  active: "border-cyan-400/35 bg-cyan-500/10 text-cyan-100",
  completed: "border-emerald-400/40 bg-emerald-500/14 text-emerald-100",
  expired: "border-white/15 bg-white/5 text-white/55",
};

export type SharedContractsPanelProps = {
  contracts: SharedContract[];
  /** Caller clock (ms). */
  now: number;
  /** Slot usage (active contracts / cap). */
  activeCount: number;
  slotCap: number;
  onContribute?: (contractId: string, amount: number) => void;
  onOpenContract?: (contractId: string) => void;
  /** Default amount wired into the contribute CTA. */
  defaultContributeAmount?: number;
  className?: string;
};

export default function SharedContractsPanel({
  contracts,
  now,
  activeCount,
  slotCap,
  onContribute,
  onOpenContract,
  defaultContributeAmount = 1,
  className,
}: SharedContractsPanelProps) {
  return (
    <section
      aria-label="Shared contracts"
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-white ${className ?? ""}`}
    >
      <div className="mb-3 flex items-baseline justify-between">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-white/55">
          Shared contracts
        </div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">
          Slots {activeCount} / {slotCap}
        </div>
      </div>

      {contracts.length === 0 ? (
        <p className="text-[11px] leading-relaxed text-white/50">
          No contracts posted. Officers can claim one from the registry.
        </p>
      ) : (
        <ul className="space-y-2" role="list">
          {contracts.map((c) => {
            const pct = Math.max(
              0,
              Math.min(100, Math.round((c.progress / Math.max(1, c.cap)) * 100)),
            );
            const ready = c.status === "active" && c.progress >= c.cap;
            return (
              <li
                key={c.id}
                className="rounded-xl border border-white/10 bg-black/25 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[12px] font-black uppercase tracking-[0.06em] text-white">
                        {c.title}
                      </span>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] ${STATUS_CHIP[c.status]}`}
                      >
                        {ready ? "Ready" : c.status}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/45">
                      {objectiveSummary(c.objective)}
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-[10px] uppercase tracking-[0.14em] text-white/40">
                    {c.status === "active" ? formatExpiry(c.expiresAt, now) : ""}
                  </div>
                </div>

                <p className="mt-1.5 text-[11px] italic leading-relaxed text-violet-100/60">
                  {c.flavor}
                </p>

                <div className="mt-2">
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={c.cap}
                    aria-valuenow={c.progress}
                    aria-label={`${c.title} progress`}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400/70 to-emerald-400/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-baseline justify-between text-[10px] uppercase tracking-[0.14em] text-white/45">
                    <span className="tabular-nums text-white/60">
                      {c.progress} / {c.cap}
                    </span>
                    <span className="tabular-nums">{pct}%</span>
                  </div>
                </div>

                <RewardPreview
                  resources={c.reward.resources}
                  contributionGrant={c.reward.contributionGrant}
                />

                <div className="mt-2 flex gap-2">
                  {onContribute && c.status === "active" && !ready ? (
                    <button
                      type="button"
                      onClick={() => onContribute(c.id, defaultContributeAmount)}
                      className="flex-1 rounded-lg border border-white/15 bg-white/[0.06] py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 transition hover:border-white/25 hover:bg-white/[0.09] active:scale-[0.98]"
                    >
                      Contribute +{defaultContributeAmount}
                    </button>
                  ) : null}
                  {onOpenContract ? (
                    <button
                      type="button"
                      onClick={() => onOpenContract(c.id)}
                      className="flex-1 rounded-lg border border-cyan-400/30 bg-cyan-500/10 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:bg-cyan-500/15 active:scale-[0.98]"
                    >
                      {ready ? "Claim reward" : "Details"}
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function RewardPreview({
  resources,
  contributionGrant,
}: {
  resources: Partial<Record<ResourceKey, number>>;
  contributionGrant: number;
}) {
  const entries = Object.entries(resources) as [ResourceKey, number][];
  return (
    <div className="mt-2 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5">
      <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
        Reward · split by share
      </div>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {entries.map(([k, v]) => (
          <span
            key={k}
            className="rounded-md border border-white/12 bg-black/25 px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em] text-white/75"
          >
            {resourceLabel(k)} +{v}
          </span>
        ))}
        <span className="rounded-md border border-amber-300/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-100/90">
          +{contributionGrant} contribution
        </span>
      </div>
    </div>
  );
}
