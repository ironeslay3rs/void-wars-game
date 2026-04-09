"use client";

import Link from "next/link";
import { useGame } from "@/features/game/gameContext";
import { getUpgradeReadySummary } from "@/features/upgrades/upgradeSelectors";
import {
  upgradeHubScreenData,
  upgradeKindLabels,
  upgradeKindAccents,
} from "@/features/upgrades/upgradeHubData";
import type { UpgradeOption } from "@/features/upgrades/upgradeTypes";
import ScreenHeader from "@/components/shared/ScreenHeader";
import UpgradeRoadmapSection from "@/components/upgrades/UpgradeRoadmapSection";

const PATH_BAR_COLORS: Record<string, string> = {
  bio: "bg-emerald-500",
  mecha: "bg-slate-400",
  pure: "bg-amber-400",
};

function UpgradeCard({ upgrade }: { upgrade: UpgradeOption }) {
  const kindLabel = upgradeKindLabels[upgrade.kind];
  const kindAccent = upgradeKindAccents[upgrade.kind];
  const barColor = upgrade.pathAccent
    ? PATH_BAR_COLORS[upgrade.pathAccent] ?? "bg-cyan-500"
    : "bg-cyan-500";

  return (
    <Link
      href={upgrade.href}
      className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-white/20 hover:bg-black/40 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/70 ${kindAccent}`}
            >
              {kindLabel}
            </span>
            {upgrade.ready ? (
              <span className="rounded-full border border-cyan-400/40 bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-100">
                Ready
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 text-base font-bold text-white">
            {upgrade.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-white/55">
            {upgrade.reward}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1 pt-1">
          {upgrade.ready ? (
            <span className="text-lg font-black text-cyan-300">✓</span>
          ) : (
            <span className="text-lg font-black tabular-nums text-white/60">
              {upgrade.progressPct}%
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${barColor}`}
          style={{ width: `${upgrade.progressPct}%` }}
        />
      </div>

      {/* Gap / requirement line */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-white/45">{upgrade.gap}</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-cyan-200/70 opacity-0 transition group-hover:opacity-100">
          {upgrade.ctaLabel} →
        </span>
      </div>

      {/* Material costs (if any) */}
      {upgrade.costs && upgrade.costs.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {upgrade.costs.map((c) => {
            const met = c.have >= c.need;
            return (
              <span
                key={c.key}
                className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold tabular-nums ${
                  met
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200/80"
                    : "border-red-400/25 bg-red-500/10 text-red-200/80"
                }`}
              >
                {c.have}/{c.need} {c.key}
              </span>
            );
          })}
        </div>
      ) : null}
    </Link>
  );
}

export default function UpgradeHub() {
  const { state } = useGame();
  const summary = getUpgradeReadySummary(state);

  const readyUpgrades = summary.all.filter((u) => u.ready);
  const pendingUpgrades = summary.all.filter((u) => !u.ready);

  return (
    <main className="safe-min-h-screen safe-page-padding bg-[radial-gradient(circle_at_top,_rgba(40,70,120,0.18),_rgba(5,8,18,1)_58%)] py-6 text-white">
      <div className="mx-auto w-full max-w-2xl space-y-6 px-4">
        <ScreenHeader
          backHref="/home"
          eyebrow={upgradeHubScreenData.eyebrow}
          title={upgradeHubScreenData.title}
          subtitle={upgradeHubScreenData.subtitle}
        />

        {/* Summary strip */}
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
            Available upgrades
          </div>
          <div className="flex items-center gap-3">
            {summary.readyCount > 0 ? (
              <span className="rounded-full border border-cyan-400/35 bg-cyan-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-cyan-100">
                {summary.readyCount} ready
              </span>
            ) : null}
            <span className="text-xs font-semibold tabular-nums text-white/60">
              {summary.all.length} total
            </span>
          </div>
        </div>

        {/* Ready upgrades */}
        {readyUpgrades.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300/70">
              Ready to claim
            </h2>
            {readyUpgrades.map((u) => (
              <UpgradeCard key={u.id} upgrade={u} />
            ))}
          </section>
        ) : null}

        {/* In progress */}
        {pendingUpgrades.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
              In progress
            </h2>
            {pendingUpgrades.map((u) => (
              <UpgradeCard key={u.id} upgrade={u} />
            ))}
          </section>
        ) : null}

        {summary.all.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-center">
            <p className="text-sm text-white/50">
              No upgrades detected. Run contracts and hunts to accumulate
              resources and rank XP.
            </p>
          </div>
        ) : null}

        <UpgradeRoadmapSection />
      </div>
    </main>
  );
}
