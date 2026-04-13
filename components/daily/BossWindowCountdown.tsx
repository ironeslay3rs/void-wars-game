"use client";

/**
 * BossWindowCountdown — time-to-next-window (or time-remaining in active window)
 * strip for the home HUD. Pure presentation: takes `now` as a prop so the
 * component is deterministic and testable.
 *
 * Canon copy: Pure (NEVER "Spirit").
 */

import type {
  BossScheduleStatus,
  BossWindow,
} from "@/features/daily/bossSchedule";

const TIER_CHIP: Record<BossWindow["tier"], string> = {
  standard: "border-white/20 bg-white/5 text-white/80",
  apex: "border-rose-400/40 bg-rose-500/14 text-rose-100",
};

const TIER_LABEL: Record<BossWindow["tier"], string> = {
  standard: "Standard window",
  apex: "Apex window",
};

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatClock(minuteOfDay: number): string {
  const m = ((minuteOfDay % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${pad2(h)}:${pad2(mm)} UTC`;
}

/**
 * Minutes remaining from `now` until the given window's reference minute.
 * Handles the "next window is tomorrow" case by treating the delta as up to
 * 24h (matches `getBossScheduleStatusAt` peek-tomorrow behavior).
 */
function minutesUntil(nowMinuteUtc: number, targetMinuteUtc: number): number {
  let delta = targetMinuteUtc - nowMinuteUtc;
  if (delta < 0) delta += 24 * 60;
  return delta;
}

function formatCountdown(totalMinutes: number): string {
  const clamped = Math.max(0, Math.floor(totalMinutes));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${pad2(m)}m`;
}

export type BossWindowCountdownProps = {
  status: BossScheduleStatus;
  /** Present time — passed in so component stays deterministic/testable. */
  now: Date;
  /** Optional callback fired when the operator jumps to the boss zone. */
  onEnterBoss?: (zoneId: string) => void;
  className?: string;
};

export default function BossWindowCountdown({
  status,
  now,
  onEnterBoss,
  className,
}: BossWindowCountdownProps) {
  const { activeWindow, nextWindow } = status;
  // Derive minutes-of-UTC-day from the provided `now` prop — never from
  // `new Date()` inside the component body.
  const nowMinuteUtc = now.getUTCHours() * 60 + now.getUTCMinutes();

  if (activeWindow) {
    const minutesLeft = minutesUntil(nowMinuteUtc, activeWindow.endMinuteUtc);
    const pct = Math.max(
      0,
      Math.min(
        100,
        ((activeWindow.durationMinutes - minutesLeft) /
          Math.max(1, activeWindow.durationMinutes)) *
          100,
      ),
    );
    return (
      <section
        aria-label={`Boss window open · ${activeWindow.zoneLabel}`}
        className={`rounded-2xl border border-rose-400/30 bg-[linear-gradient(180deg,rgba(40,12,20,0.92),rgba(14,6,10,0.96))] p-4 text-white shadow-[0_12px_32px_rgba(0,0,0,0.3)] backdrop-blur-md ${className ?? ""}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-rose-200/75">
              Boss window open
            </div>
            <div className="mt-0.5 truncate text-base font-black uppercase tracking-[0.06em] text-white">
              {activeWindow.zoneLabel}
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${TIER_CHIP[activeWindow.tier]}`}
          >
            {TIER_LABEL[activeWindow.tier]}
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-[0.16em] text-white/45">
            Closes at {formatClock(activeWindow.endMinuteUtc)}
          </span>
          <span className="text-sm font-black tabular-nums text-rose-100">
            {formatCountdown(minutesLeft)} left
          </span>
        </div>
        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-rose-900/40"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={activeWindow.durationMinutes}
          aria-valuenow={activeWindow.durationMinutes - minutesLeft}
          aria-label="Boss window elapsed"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400 transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        {onEnterBoss ? (
          <button
            type="button"
            onClick={() => onEnterBoss(activeWindow.zoneId)}
            className="mt-3 w-full rounded-xl border border-rose-300/40 bg-rose-500/15 py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-rose-50 transition hover:border-rose-200/60 hover:bg-rose-500/25 active:scale-[0.98]"
          >
            Engage boss
          </button>
        ) : null}
      </section>
    );
  }

  if (nextWindow) {
    const minutesLeft = minutesUntil(nowMinuteUtc, nextWindow.startMinuteUtc);
    return (
      <section
        aria-label={`Next boss window · ${nextWindow.zoneLabel}`}
        className={`rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(14,16,26,0.94),rgba(7,9,15,0.97))] p-4 text-white shadow-[0_12px_32px_rgba(0,0,0,0.3)] backdrop-blur-md ${className ?? ""}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
              Next boss window
            </div>
            <div className="mt-0.5 truncate text-base font-black uppercase tracking-[0.06em] text-white">
              {nextWindow.zoneLabel}
            </div>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${TIER_CHIP[nextWindow.tier]}`}
          >
            {TIER_LABEL[nextWindow.tier]}
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-[0.16em] text-white/45">
            Opens at {formatClock(nextWindow.startMinuteUtc)} · {nextWindow.durationMinutes}m
          </span>
          <span className="text-sm font-black tabular-nums text-white/85">
            in {formatCountdown(minutesLeft)}
          </span>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="No scheduled boss windows"
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-white/60 ${className ?? ""}`}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
        Boss schedule
      </div>
      <p className="mt-1 text-[11px] leading-relaxed">
        No scheduled boss windows queued. Zone-level spawns still roll as normal.
      </p>
    </section>
  );
}
