"use client";

/**
 * ContractDetailModal — focused view of a single shared contract.
 *
 * Shows the objective, progress, per-member split, reward bundle (with
 * rank-multiplier preview), and expiry. Renders a contribute CTA while
 * active + under cap, and a claim CTA when progress >= cap.
 *
 * Presentational. Host wires `onContribute` and `onClaimReward`.
 *
 * Canon copy: Pure never "Spirit".
 */

import type { ResourceKey } from "@/features/game/gameTypes";
import type {
  ContractObjective,
  GuildMember,
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
  const ms = expiresAt - now;
  if (ms <= 0) return "expired";
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export type ContractDetailModalProps = {
  contract: SharedContract;
  members: GuildMember[];
  now: number;
  /** Current rank reward multiplier (from rankRewardMultiplier). */
  rewardMultiplier: number;
  /** Default contribute amount from the CTA. */
  defaultContributeAmount?: number;
  onContribute?: (contractId: string, amount: number) => void;
  onClaimReward?: (contractId: string) => void;
  onClose?: () => void;
  className?: string;
};

export default function ContractDetailModal({
  contract,
  members,
  now,
  rewardMultiplier,
  defaultContributeAmount = 1,
  onContribute,
  onClaimReward,
  onClose,
  className,
}: ContractDetailModalProps) {
  const pct = Math.max(
    0,
    Math.min(100, Math.round((contract.progress / Math.max(1, contract.cap)) * 100)),
  );
  const ready = contract.status === "active" && contract.progress >= contract.cap;
  const nameById = new Map(members.map((m) => [m.id, m.displayName] as const));
  const splitEntries = Object.entries(contract.perMember)
    .map(([id, amount]) => ({
      id,
      name: nameById.get(id) ?? id,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  const resourceEntries = Object.entries(contract.reward.resources) as [
    ResourceKey,
    number,
  ][];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Contract · ${contract.title}`}
      className={`fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm ${className ?? ""}`}
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(14,16,26,0.96),rgba(7,9,15,0.98))] p-5 text-white shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
              Shared contract
            </div>
            <div className="mt-0.5 truncate text-lg font-black uppercase tracking-[0.06em] text-white">
              {contract.title}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/45">
              {objectiveSummary(contract.objective)}
            </div>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close contract detail"
              className="shrink-0 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/75 transition hover:border-white/25 hover:bg-white/[0.09]"
            >
              Close
            </button>
          ) : null}
        </div>

        <p className="mt-2 text-[12px] italic leading-relaxed text-violet-100/70">
          {contract.flavor}
        </p>

        <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Progress
            </span>
            <span className="text-[11px] font-bold tabular-nums text-white/85">
              {contract.progress} / {contract.cap}
            </span>
          </div>
          <div
            className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={contract.cap}
            aria-valuenow={contract.progress}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400/75 to-emerald-400/75"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between text-[10px] uppercase tracking-[0.14em] text-white/45">
            <span>{contract.status}</span>
            <span className="tabular-nums">
              {contract.status === "active"
                ? `${formatExpiry(contract.expiresAt, now)} left`
                : ""}
            </span>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/25 p-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Reward bundle
            </div>
            <div className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-amber-200/70">
              Rank multiplier x{rewardMultiplier.toFixed(2)} · split by share
            </div>
            <ul className="mt-2 space-y-1 text-[12px]" role="list">
              {resourceEntries.length === 0 ? (
                <li className="text-white/55">No resources attached.</li>
              ) : (
                resourceEntries.map(([k, v]) => (
                  <li
                    key={k}
                    className="flex items-baseline justify-between border-b border-white/5 pb-1 last:border-0"
                  >
                    <span className="text-white/75">{resourceLabel(k)}</span>
                    <span className="font-bold tabular-nums text-emerald-200">
                      +{Math.floor(v * rewardMultiplier)}
                    </span>
                  </li>
                ))
              )}
              <li className="flex items-baseline justify-between pt-1">
                <span className="text-white/75">Contribution</span>
                <span className="font-bold tabular-nums text-amber-200">
                  +{contract.reward.contributionGrant}
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/25 p-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Contributor split
            </div>
            {splitEntries.length === 0 ? (
              <p className="mt-2 text-[11px] text-white/55">
                No banked contribution yet. Be the first name on the wall.
              </p>
            ) : (
              <ul className="mt-2 space-y-1 text-[12px]" role="list">
                {splitEntries.map((s) => {
                  const share =
                    contract.progress > 0
                      ? Math.round((s.amount / contract.progress) * 100)
                      : 0;
                  return (
                    <li
                      key={s.id}
                      className="flex items-baseline justify-between gap-2"
                    >
                      <span className="truncate text-white/75">{s.name}</span>
                      <span className="shrink-0 tabular-nums text-white/60">
                        {s.amount} · {share}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {onContribute && contract.status === "active" && !ready ? (
            <button
              type="button"
              onClick={() => onContribute(contract.id, defaultContributeAmount)}
              className="flex-1 rounded-xl border border-white/15 bg-white/[0.06] py-2 text-[12px] font-bold uppercase tracking-[0.14em] text-white/85 transition hover:border-white/25 hover:bg-white/[0.09] active:scale-[0.98]"
            >
              Contribute +{defaultContributeAmount}
            </button>
          ) : null}
          {onClaimReward && ready ? (
            <button
              type="button"
              onClick={() => onClaimReward(contract.id)}
              className="flex-1 rounded-xl border border-emerald-400/40 bg-emerald-500/12 py-2 text-[12px] font-black uppercase tracking-[0.14em] text-emerald-100 transition hover:bg-emerald-500/20 active:scale-[0.98]"
            >
              Claim reward
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
