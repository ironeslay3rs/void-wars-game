"use client";

/**
 * EventClaimModal — confirm-claim dialog for a scheduled event. Shows the
 * resolved reward (from resolveScheduledReward) and fires `onConfirm` with
 * the instance id. Presentational; host owns dispatch.
 *
 * Canon copy: Pure (NEVER "Spirit").
 */

import type { ResourceKey } from "@/features/game/gameTypes";
import type { EventKind } from "@/features/events/eventRegistry";
import type { ScheduledEvent } from "@/features/events/eventSchedule";
import type { EventResolvedReward } from "@/features/events/eventRewards";

const KIND_LABEL: Record<EventKind, string> = {
  bounty: "Bounty",
  sale: "Flash Sale",
  "loot-boost": "Loot Surge",
  incursion: "Incursion",
};

const KIND_CHIP: Record<EventKind, string> = {
  bounty: "border-amber-400/40 bg-amber-500/14 text-amber-100",
  sale: "border-cyan-400/35 bg-cyan-500/12 text-cyan-100",
  "loot-boost": "border-violet-400/35 bg-violet-500/14 text-violet-100",
  incursion: "border-rose-400/40 bg-rose-500/14 text-rose-100",
};

const RESOURCE_LABEL: Partial<Record<ResourceKey, string>> = {
  credits: "Credits",
  scrapAlloy: "Scrap",
  emberCore: "Ember",
  runeDust: "Rune Dust",
  bioSamples: "Bio",
};

function resourceLabel(key: ResourceKey): string {
  return RESOURCE_LABEL[key] ?? key;
}

export type EventClaimModalProps = {
  open: boolean;
  event: ScheduledEvent | null;
  reward: EventResolvedReward | null;
  onConfirm?: (instanceId: string) => void;
  onDismiss?: () => void;
};

export default function EventClaimModal({
  open,
  event,
  reward,
  onConfirm,
  onDismiss,
}: EventClaimModalProps) {
  if (!open || !event || !reward) return null;

  const kind = event.definition.kind;
  const grants = Object.entries(reward.resourceGrants).filter(
    ([, v]) => typeof v === "number" && (v as number) > 0,
  ) as Array<[ResourceKey, number]>;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Claim ${event.definition.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(14,16,26,0.98),rgba(7,9,15,0.99))] p-5 text-white shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
              Confirm claim
            </div>
            <div className="mt-0.5 truncate text-base font-black uppercase tracking-[0.06em] text-white">
              {event.definition.title}
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${KIND_CHIP[kind]}`}
          >
            {KIND_LABEL[kind]}
          </span>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-white/60">
          {event.definition.flavor}
        </p>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            Reward
          </div>
          <div className="mt-1 text-sm font-black tracking-[0.04em] text-white/90">
            {reward.summary}
          </div>

          {grants.length > 0 ? (
            <ul
              className="mt-2 flex flex-wrap gap-1.5"
              aria-label="Resource grants"
            >
              {grants.map(([key, amount]) => (
                <li
                  key={key}
                  className="rounded-md border border-white/15 bg-black/25 px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em] text-white/80"
                >
                  {resourceLabel(key)} +{amount}
                </li>
              ))}
            </ul>
          ) : null}

          {reward.lootMultiplier > 1 ? (
            <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-violet-200/80">
              Loot multiplier x{reward.lootMultiplier} while window is open.
            </div>
          ) : null}
          {reward.discountPct > 0 ? (
            <div className="mt-2 text-[10px] uppercase tracking-[0.14em] text-cyan-200/80">
              Broker discount {Math.round(reward.discountPct * 100)}% while
              window is open.
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 rounded-xl border border-white/12 bg-transparent py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white/70 transition hover:border-white/25 hover:bg-white/[0.05] active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm?.(event.instanceId)}
            disabled={!onConfirm}
            className="flex-1 rounded-xl border border-white/25 bg-white/[0.12] py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:border-white/40 hover:bg-white/[0.18] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm claim
          </button>
        </div>
      </div>
    </div>
  );
}
