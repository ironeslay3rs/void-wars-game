"use client";

/**
 * EventListPanel — timeboxed list of active + upcoming scheduled events
 * for the home HUD. Presentational only; consumes derived state from
 * `features/events/eventSchedule` (typically getEventScheduleStatus plus
 * an optional tomorrow peek for the upcoming column).
 *
 * Canon copy: Pure (NEVER "Spirit").
 */

import type { EventKind } from "@/features/events/eventRegistry";
import type { ScheduledEvent } from "@/features/events/eventSchedule";

const KIND_LABEL: Record<EventKind, string> = {
  bounty: "Bounty",
  sale: "Flash Sale",
  "loot-boost": "Loot Surge",
  incursion: "Incursion",
};

const KIND_CHIP: Record<EventKind, string> = {
  bounty: "border-amber-400/40 bg-amber-500/12 text-amber-100",
  sale: "border-cyan-400/35 bg-cyan-500/10 text-cyan-100",
  "loot-boost": "border-violet-400/35 bg-violet-500/12 text-violet-100",
  incursion: "border-rose-400/40 bg-rose-500/12 text-rose-100",
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

function minutesUntil(nowMinuteUtc: number, targetMinuteUtc: number): number {
  let delta = targetMinuteUtc - nowMinuteUtc;
  if (delta < 0) delta += 24 * 60;
  return delta;
}

export type EventListPanelProps = {
  active: ScheduledEvent[];
  upcoming: ScheduledEvent[];
  now: Date;
  onSelectEvent?: (instanceId: string) => void;
  className?: string;
};

export default function EventListPanel({
  active,
  upcoming,
  now,
  onSelectEvent,
  className,
}: EventListPanelProps) {
  const nowMinuteUtc = now.getUTCHours() * 60 + now.getUTCMinutes();
  const hasAny = active.length > 0 || upcoming.length > 0;

  return (
    <section
      aria-label="Scheduled events"
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${className ?? ""}`}
    >
      <div className="mb-3 flex items-baseline justify-between">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-white/55">
          Events queue
        </div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-white/35">
          Active · Upcoming
        </div>
      </div>

      {!hasAny ? (
        <p className="text-[11px] leading-relaxed text-white/50">
          No scheduled events in the current window. Check back after the next
          anchor rotates.
        </p>
      ) : null}

      {active.length > 0 ? (
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            Live now
          </div>
          <ul className="mt-1.5 space-y-1.5">
            {active.map((e) => {
              const left = Math.max(0, e.endMinuteUtc - nowMinuteUtc);
              return (
                <li key={e.instanceId}>
                  <Row
                    event={e}
                    chipLabel={KIND_LABEL[e.definition.kind]}
                    chipClass={KIND_CHIP[e.definition.kind]}
                    primary={`Closes ${formatClock(e.endMinuteUtc)}`}
                    trailing={`${formatCountdown(left)} left`}
                    onSelect={onSelectEvent}
                    tone="live"
                  />
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {upcoming.length > 0 ? (
        <div className={active.length > 0 ? "mt-3" : ""}>
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            Upcoming
          </div>
          <ul className="mt-1.5 space-y-1.5">
            {upcoming.map((e) => {
              const until = minutesUntil(nowMinuteUtc, e.startMinuteUtc);
              return (
                <li key={e.instanceId}>
                  <Row
                    event={e}
                    chipLabel={KIND_LABEL[e.definition.kind]}
                    chipClass={KIND_CHIP[e.definition.kind]}
                    primary={`Opens ${formatClock(e.startMinuteUtc)} · ${e.definition.durationMinutes}m`}
                    trailing={`in ${formatCountdown(until)}`}
                    onSelect={onSelectEvent}
                    tone="queued"
                  />
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

type RowProps = {
  event: ScheduledEvent;
  chipLabel: string;
  chipClass: string;
  primary: string;
  trailing: string;
  onSelect?: (instanceId: string) => void;
  tone: "live" | "queued";
};

function Row({
  event,
  chipLabel,
  chipClass,
  primary,
  trailing,
  onSelect,
  tone,
}: RowProps) {
  const base =
    tone === "live"
      ? "border-white/18 bg-white/[0.06]"
      : "border-white/10 bg-black/20";
  const content = (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 ${base}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] ${chipClass}`}
          >
            {chipLabel}
          </span>
          <span className="truncate text-[12px] font-bold tracking-[0.04em] text-white/90">
            {event.definition.title}
          </span>
        </div>
        <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/45">
          {primary}
        </div>
      </div>
      <span className="shrink-0 text-[11px] font-black tabular-nums text-white/85">
        {trailing}
      </span>
    </div>
  );

  if (!onSelect) return content;
  return (
    <button
      type="button"
      onClick={() => onSelect(event.instanceId)}
      className="block w-full text-left transition hover:opacity-90 active:scale-[0.99]"
      aria-label={`${chipLabel} · ${event.definition.title} · ${primary}`}
    >
      {content}
    </button>
  );
}
