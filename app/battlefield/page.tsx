import Link from "next/link";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import {
  BATTLEFIELD_ZONES,
  BATTLEFIELD_ZONE_ORDER,
} from "@/features/battlefield/empireBattlefieldData";

export default function BattlefieldPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(120,20,20,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
        <ScreenHeader
          eyebrow="Empire War · Faction Battlefield"
          title="The War Fronts"
          subtitle="Three border zones where Bio, Mecha, and Pure empires clash for territorial control. Fight for your faction. Earn war rewards."
          backHref="/home"
          backLabel="Back to Command"
        />

        <SectionCard
          title="How faction warfare works"
          description="Coming soon — the empire battlefield system."
        >
          <p className="text-sm leading-6 text-white/75">
            Each war front sits at the border between two empires. Your kills
            and mission completions in a front shift its control toward your
            faction. Controlled fronts give your empire&apos;s operatives bonus
            yields, cheaper crafting, and access to faction-exclusive gear.
            When a third empire intervenes, the front escalates to full
            warzone — maximum danger, maximum rewards.
          </p>
        </SectionCard>

        <div className="grid gap-6 md:grid-cols-3">
          {BATTLEFIELD_ZONE_ORDER.map((id) => {
            const zone = BATTLEFIELD_ZONES[id];
            return (
              <div
                key={id}
                className="flex flex-col rounded-2xl border border-red-400/20 bg-[linear-gradient(165deg,rgba(60,10,10,0.5),rgba(8,6,6,0.95))] p-5"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-300/75">
                  Threat {zone.threatLevel} · Rank {zone.minRankLevel}+
                </div>
                <h3 className="mt-2 text-lg font-black uppercase tracking-[0.04em] text-white">
                  {zone.name}
                </h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {zone.primaryContestants.map((empire) => (
                    <span
                      key={empire}
                      className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/70"
                    >
                      {empire}
                    </span>
                  ))}
                </div>
                <p className="mt-3 flex-1 text-xs leading-5 text-white/55">
                  {zone.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-white/40">
                  <span>×{zone.rewardMultiplier.toFixed(2)} rewards</span>
                  <span className="rounded border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 font-bold text-amber-200/80">
                    {zone.status}
                  </span>
                </div>
                <button
                  type="button"
                  disabled
                  className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-red-200/50 opacity-60"
                >
                  Deploy (Coming Soon)
                </button>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/55">
          The Empire Battlefield is under active development. Zone data,
          events, and faction scoring are seeded — the deploy mechanic and
          real-time faction war will arrive in the next milestone.{" "}
          <Link
            href="/empires"
            className="font-semibold text-cyan-200/85 underline decoration-cyan-400/35 underline-offset-2 hover:text-white"
          >
            View your empire
          </Link>{" "}
          to see current doctrine pressure across the void zones.
        </div>
      </div>
    </main>
  );
}
