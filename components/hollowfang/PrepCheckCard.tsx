/**
 * PrepCheckCard — Hollowfang prestige boss readiness card.
 *
 * Darkest-Dungeon prep-tension: shows a readiness meter and a per-requirement
 * pass/fail ledger (materials / condition / corruption / rank). Pure
 * presentational — consumes outputs from `features/hollowfang/prepRequirements`.
 *
 * Canon copy: "Pure" (never "Spirit"). Empire names stay verbatim.
 */

import type {
  PrepBlocker,
  PrepCheck,
} from "@/features/hollowfang/prepRequirements";
import type { ResourceKey } from "@/features/game/gameTypes";

export type PrepCheckCardProps = {
  prep: PrepCheck;
  /** Readiness score in 0..1 (from `readinessScore`). UI renders as 0–100. */
  readiness: number;
  /** Player's current condition scalar (0–100). */
  condition: number;
  /** Player's corruption percentage (0–100, high = tainted). */
  corruptionPct: number;
  /** Player's rank level. */
  rankLevel: number;
  /** Player's resource stockpile (read-only). */
  resources: Partial<Record<ResourceKey, number>>;
  className?: string;
};

const RESOURCE_LABEL: Partial<Record<ResourceKey, string>> = {
  bloodvein: "Bloodvein",
  ashveil: "Ashveil",
  ironHeart: "Ironheart",
  runeDust: "Rune Dust",
  emberCore: "Ember Core",
  scrapAlloy: "Scrap Alloy",
  credits: "Credits",
};

function resourceLabel(k: ResourceKey): string {
  return RESOURCE_LABEL[k] ?? k;
}

type Row = {
  id: string;
  label: string;
  pass: boolean;
  detail: string;
  flavor?: string;
};

function buildRows(props: PrepCheckCardProps): Row[] {
  const { prep, condition, corruptionPct, rankLevel, resources } = props;
  const req = prep.requirements;
  const blockerMap = new Map<string, PrepBlocker>();
  for (const b of prep.blockers) {
    if (b.kind === "material") blockerMap.set(`material:${b.key}`, b);
    else blockerMap.set(b.kind, b);
  }

  const rows: Row[] = [];

  rows.push({
    id: "rank",
    label: "Rank",
    pass: !blockerMap.has("rank"),
    detail: `Lv ${rankLevel} / ${req.minRankLevel}`,
  });
  rows.push({
    id: "condition",
    label: "Condition",
    pass: !blockerMap.has("condition"),
    detail: `${Math.round(condition)} / ${req.minCondition}`,
  });
  rows.push({
    id: "corruption",
    label: "Corruption",
    pass: !blockerMap.has("corruption"),
    detail: `${Math.round(corruptionPct)} / ${req.maxCorruption} max`,
  });
  for (const m of req.materials) {
    const have = resources[m.key] ?? 0;
    const pass = have >= m.amount;
    rows.push({
      id: `mat-${m.key}`,
      label: resourceLabel(m.key),
      pass,
      detail: `${have} / ${m.amount}`,
      flavor: m.flavor,
    });
  }

  return rows;
}

function toneFor(pct: number): { bar: string; frame: string; label: string } {
  if (pct >= 90)
    return {
      bar: "from-emerald-400 to-cyan-400",
      frame: "border-emerald-400/40",
      label: "Fully Prepped",
    };
  if (pct >= 70)
    return {
      bar: "from-emerald-500/80 to-amber-400/80",
      frame: "border-emerald-400/30",
      label: "Ready",
    };
  if (pct >= 45)
    return {
      bar: "from-amber-400/85 to-orange-500/80",
      frame: "border-amber-400/30",
      label: "Thin",
    };
  if (pct >= 20)
    return {
      bar: "from-orange-500/85 to-rose-500/80",
      frame: "border-orange-400/35",
      label: "Dangerous",
    };
  return {
    bar: "from-rose-500/90 to-fuchsia-500/85",
    frame: "border-rose-500/45",
    label: "Un-Prepped",
  };
}

export default function PrepCheckCard(props: PrepCheckCardProps) {
  const { prep, readiness, className } = props;
  const pct = Math.max(0, Math.min(100, Math.round(readiness * 100)));
  const tone = toneFor(pct);
  const rows = buildRows(props);

  return (
    <section
      aria-label="Hollowfang prep check"
      className={`rounded-[22px] border ${tone.frame} bg-[linear-gradient(135deg,rgba(30,10,40,0.4),rgba(8,10,18,0.94))] p-5 text-white shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/45">
            Prep Check · Hollowfang
          </div>
          <div className="mt-1 text-lg font-black uppercase tracking-[0.1em] text-white">
            {tone.label}
          </div>
          <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-violet-200/55">
            The pit does not forgive under-prep.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
            Readiness
          </div>
          <div className="mt-1 text-2xl font-black tabular-nums text-white">
            {pct}
            <span className="text-sm font-semibold text-white/45"> / 100</span>
          </div>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/40">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone.bar} transition-[width] duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-4 space-y-1.5" role="list">
        {rows.map((r) => (
          <li
            key={r.id}
            className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-2 text-[12px] ${
              r.pass
                ? "border-emerald-400/25 bg-emerald-500/5"
                : "border-rose-400/30 bg-rose-500/8"
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={`inline-block h-2 w-2 rounded-full ${
                    r.pass ? "bg-emerald-300" : "bg-rose-400"
                  }`}
                />
                <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-white">
                  {r.label}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase tracking-[0.16em] ${
                    r.pass ? "text-emerald-200/80" : "text-rose-200/90"
                  }`}
                >
                  {r.pass ? "Pass" : "Fail"}
                </span>
              </div>
              {r.flavor ? (
                <p className="mt-0.5 text-[11px] italic text-white/55">
                  {r.flavor}
                </p>
              ) : null}
            </div>
            <div className="shrink-0 text-[12px] font-semibold tabular-nums text-white/80">
              {r.detail}
            </div>
          </li>
        ))}
      </ul>

      <div
        className={`mt-4 rounded-xl border px-3 py-2 text-[12px] ${
          prep.ok
            ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
            : "border-rose-400/30 bg-rose-500/10 text-rose-100"
        }`}
        role="status"
      >
        {prep.ok
          ? "All gates clear. Engage when ready."
          : `${prep.blockers.length} gate${prep.blockers.length === 1 ? "" : "s"} blocking — resolve before engaging.`}
      </div>
    </section>
  );
}
