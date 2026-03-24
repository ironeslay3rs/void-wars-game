import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import {
  blackMarketConnections,
  blackMarketFinalResult,
  blackMarketFirstThree,
  blackMarketImplementationSlice,
  blackMarketLanes,
  blackMarketRoleSummary,
} from "@/features/black-market/blackMarketScreenData";

export default function BlackMarketPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(140,60,20,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <ScreenHeader
          eyebrow={blackMarketRoleSummary.eyebrow}
          title={blackMarketRoleSummary.title}
          subtitle={blackMarketRoleSummary.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {blackMarketRoleSummary.cards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <SectionCard
          title="7 Black Market Lanes Matrix"
          description="Each sin-lane is positioned as a district-scale business identity with a gameplay role that can plug into the current project state without demanding a giant system drop."
        >
          <div className="grid gap-4 xl:grid-cols-2">
            {blackMarketLanes.map((lane) => (
              <article
                key={lane.id}
                className="rounded-2xl border border-orange-400/15 bg-white/5 p-5 shadow-[0_0_24px_rgba(0,0,0,0.24)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-orange-200/60">
                      {lane.sin}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-white">
                      {lane.district}
                    </h3>
                  </div>
                  <span className="rounded-full border border-orange-300/20 bg-orange-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-orange-100/80">
                    District Role
                  </span>
                </div>

                <dl className="mt-4 space-y-3 text-sm text-white/72">
                  <div>
                    <dt className="font-semibold uppercase tracking-[0.14em] text-white/45">
                      Purpose
                    </dt>
                    <dd className="mt-1">{lane.purpose}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold uppercase tracking-[0.14em] text-white/45">
                      Main Resource / Service
                    </dt>
                    <dd className="mt-1">{lane.service}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold uppercase tracking-[0.14em] text-white/45">
                      Risk / Downside
                    </dt>
                    <dd className="mt-1">{lane.risk}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold uppercase tracking-[0.14em] text-white/45">
                      Best Player Use
                    </dt>
                    <dd className="mt-1">{lane.playerUse}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold uppercase tracking-[0.14em] text-white/45">
                      Signature NPC / Boss
                    </dt>
                    <dd className="mt-1">{lane.archetype}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <SectionCard
            title="Best First 3 To Build"
            description="Recommended order based on what already exists in the project: survival pressure, timed hunting/contracts, and district-state progression."
          >
            <div className="space-y-3">
              {blackMarketFirstThree.map((entry, index) => (
                <div
                  key={entry.lane}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="text-xs uppercase tracking-[0.25em] text-orange-200/65">
                    #{index + 1}
                  </div>
                  <h3 className="mt-1 text-base font-semibold text-white">
                    {entry.lane}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/68">
                    {entry.reason}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="How They Connect To Survival / Crafting / Missions"
            description="This keeps the Black Market integrated with the current core loops rather than isolated as lore-only content."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {blackMarketConnections.map((connection) => (
                <div
                  key={connection.title}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
                    {connection.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/65">
                    {connection.detail}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Best First Implementation Slice"
          description="A narrow build slice that establishes canon, exposes the destination in the UI, and only implements the highest-fit gameplay hooks now."
        >
          <ol className="space-y-3">
            {blackMarketImplementationSlice.map((step, index) => (
              <li
                key={step}
                className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/72"
              >
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-orange-300/20 bg-orange-500/10 text-xs font-bold text-orange-100">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard
          title="Final Result"
          description="Outcome if this framing becomes gameplay canon for the Bazaar."
        >
          <p className="max-w-5xl text-sm leading-7 text-white/72 md:text-base">
            {blackMarketFinalResult}
          </p>
        </SectionCard>
      </div>
    </main>
  );
}
