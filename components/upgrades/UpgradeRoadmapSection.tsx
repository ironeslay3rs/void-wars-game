import Link from "next/link";
import {
  futureUpgradeBeats,
  upgradeDesignPillarCopy,
  upgradeHorizonLabels,
  upgradeRoadmapScreenCopy,
} from "@/features/upgrades/upgradeRoadmapData";

const PILLAR_DOT: Record<string, string> = {
  pressure: "bg-orange-400",
  economy: "bg-amber-400",
  identity: "bg-violet-400",
  field: "bg-cyan-400",
  social: "bg-rose-400",
};

export default function UpgradeRoadmapSection() {
  return (
    <section className="space-y-4 border-t border-white/10 pt-8">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
          {upgradeRoadmapScreenCopy.eyebrow}
        </div>
        <h2 className="mt-1 text-lg font-bold text-white">
          {upgradeRoadmapScreenCopy.title}
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-white/45">
          {upgradeRoadmapScreenCopy.subtitle}
        </p>
      </div>

      {/* Design pillars — compact reference for pacing */}
      <div className="grid gap-2 sm:grid-cols-2">
        {(
          Object.entries(upgradeDesignPillarCopy) as [
            keyof typeof upgradeDesignPillarCopy,
            (typeof upgradeDesignPillarCopy)["pressure"],
          ][]
        ).map(([key, v]) => (
          <div
            key={key}
            className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${PILLAR_DOT[key] ?? "bg-white/40"}`}
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
                {v.label}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-white/40">{v.blurb}</p>
          </div>
        ))}
      </div>

      <h3 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/35">
        Scheduled beats
      </h3>

      <ul className="space-y-3">
        {futureUpgradeBeats.map((beat) => {
          const pillar = upgradeDesignPillarCopy[beat.pillar];
          const body = (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white/55">
                  {upgradeHorizonLabels[beat.horizon]}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/35">
                  {pillar.label}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-bold text-white/90">{beat.headline}</h4>
              <p className="mt-1 text-xs leading-relaxed text-white/45">{beat.teaser}</p>
            </>
          );

          if (beat.previewHref) {
            return (
              <li key={beat.id}>
                <Link
                  href={beat.previewHref}
                  className="block rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 transition hover:border-white/25 hover:bg-black/30 active:scale-[0.99]"
                >
                  {body}
                  <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-200/60">
                    Preview related screen →
                  </div>
                </Link>
              </li>
            );
          }

          return (
            <li
              key={beat.id}
              className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-4"
            >
              {body}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
