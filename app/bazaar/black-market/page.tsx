import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { blackMarketScreenData } from "@/features/black-market/blackMarketScreenData";

const listingQueue = [
  "Contraband Components",
  "Encrypted Relay Keys",
  "Silent Armor Weave",
] as const;

const operationsQueue = [
  "Broker Negotiation",
  "Dead-Drop Coordination",
  "Risk Screening",
] as const;

export default function BlackMarketPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,120,80,0.2),_rgba(5,8,20,1)_58%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <ScreenHeader
          eyebrow={blackMarketScreenData.eyebrow}
          title={blackMarketScreenData.title}
          subtitle={blackMarketScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {blackMarketScreenData.cards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Vendor Lanes"
            description="Current exchange surface for covert listings and restricted procurement offers."
          >
            <div className="space-y-3">
              {listingQueue.map((entry) => (
                <div
                  key={entry}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70"
                >
                  {entry}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Operations Console"
            description="Reserved command surface for broker actions and route-level Black Market progression."
          >
            <div className="space-y-3">
              {operationsQueue.map((entry) => (
                <div
                  key={entry}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/65"
                >
                  {entry}
                </div>
              ))}

              <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-white/50">
                Step B rebuilt as a route-complete screen shell. Stateful trade flows can layer on this surface without architecture changes.
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
