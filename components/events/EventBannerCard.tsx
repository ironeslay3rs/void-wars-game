"use client";

/**
 * EventBannerCard — home-HUD card surfacing the currently active scheduled
 * event. Shows kind chip, canon flavor, closing countdown, and an optional
 * Claim CTA. Presentational only; consumes a `ScheduledEvent` plus `now`.
 *
 * Canon copy: Pure (NEVER "Spirit"). Empire names stay verbatim
 * (Verdant Coil / Chrome Synod / Ember Vault) from the registry.
 */

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

const KIND_ACCENT: Record<EventKind, string> = {
  bounty:
    "border-amber-400/30 bg-[linear-gradient(180deg,rgba(36,26,8,0.94),rgba(12,9,4,0.97))]",
  sale: "border-cyan-400/25 bg-[linear-gradient(180deg,rgba(10,22,30,0.94),rgba(6,10,14,0.97))]",
  "loot-boost":
    "border-violet-400/25 bg-[linear-gradient(180deg,rgba(22,12,36,0.94),rgba(9,6,14,0.97))]",
  incursion:
    "border-rose-400/30 bg-[linear-gradient(180deg,rgba(38,12,20,0.94),rgba(12,6,10,0.97))]",
};

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatCountdown(totalMinutes: number): string {
  const clamped = Math.max(0, Math.floor(totalMinutes));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${pad2(m)}m`;
}

function formatClock(minuteOfDay: number): string {
  const m = ((minuteOfDay % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${pad2(h)}:${pad2(mm)} UTC`;
}

export type EventBannerCardProps = {
  event: ScheduledEvent;
  /** Present time — passed in for determinism. */
  now: Date;
  /** Optional pre-resolved reward preview to show on the banner. */
  rewardPreview?: EventResolvedReward | null;
  onClaim?: (instanceId: string) => void;
  onViewDetails?: (instanceId: string) => void;
  className?: string;
};

export default function EventBannerCard({
  event,
  now,
  rewardPreview,
  onClaim,
  onViewDetails,
  className,
}: EventBannerCardProps) {
  const nowMinuteUtc = now.getUTCHours() * 60 + now.getUTCMinutes();
  const minutesLeft = Math.max(0, event.endMinuteUtc - nowMinuteUtc);
  const elapsed = Math.max(
    0,
    Math.min(
      event.definition.durationMinutes,
      event.definition.durationMinutes - minutesLeft,
    ),
  );
  const pct = Math.max(
    0,
    Math.min(
      100,
      (elapsed / Math.max(1, event.definition.durationMinutes)) * 100,
    ),
  );
  const kind = event.definition.kind;

  return (
    <section
      aria-label={`Active event · ${event.definition.title}`}
      className={`rounded-2xl border p-4 text-white shadow-[0_12px_32px_rgba(0,0,0,0.3)] backdrop-blur-md ${KIND_ACCENT[kind]} ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
            Event open · {event.dateKey}
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

      <p className="mt-3 text-[11px] leading-relaxed text-white/65">
        {event.definition.flavor}
      </p>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-[0.16em] text-white/45">
          Closes at {formatClock(event.endMinuteUtc)}
        </span>
        <span className="text-sm font-black tabular-nums text-white/90">
          {formatCountdown(minutesLeft)} left
        </span>
      </div>

      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/40"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={event.definition.durationMinutes}
        aria-valuenow={elapsed}
        aria-label="Event window elapsed"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-white/70 to-white/40 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      {rewardPreview ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            Reward preview
          </div>
          <div className="mt-0.5 text-[11px] font-semibold tracking-[0.04em] text-white/85">
            {rewardPreview.summary}
          </div>
        </div>
      ) : null}

      {(onClaim || onViewDetails) && (
        <div className="mt-3 flex gap-2">
          {onClaim ? (
            <button
              type="button"
              onClick={() => onClaim(event.instanceId)}
              className="flex-1 rounded-xl border border-white/20 bg-white/[0.08] py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white transition hover:border-white/35 hover:bg-white/[0.12] active:scale-[0.98]"
            >
              Claim
            </button>
          ) : null}
          {onViewDetails ? (
            <button
              type="button"
              onClick={() => onViewDetails(event.instanceId)}
              className="rounded-xl border border-white/12 bg-transparent px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/70 transition hover:border-white/25 hover:bg-white/[0.05] active:scale-[0.98]"
            >
              Details
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
