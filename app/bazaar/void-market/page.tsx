import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";

const summaryCards = [
  {
    label: "Market Role",
    value: "Primary Exchange",
    hint:
      "The legal-facing trade floor for routine buying, selling, and price discovery across the Bazaar.",
  },
  {
    label: "Current Scope",
    value: "Trade Placeholder",
    hint:
      "This remains a light shell so the Bazaar map can expose the main exchange without inventing a full economy ahead of the Black Market lanes.",
  },
  {
    label: "Relationship",
    value: "Counterpart Hub",
    hint:
      "Use the Void Market for stable commerce and the Black Market for risky district services, debt, contracts, and clandestine upgrades.",
  },
] as const;

export default function VoidMarketPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(120,90,20,0.18),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        <ScreenHeader
          eyebrow="Bazaar / Void Market"
          title="Void Market"
          subtitle="The primary exchange hub for open trade, routine auctions, and legal-facing Bazaar commerce."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {summaryCards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <SectionCard
          title="Market Position"
          description="This page exists as a small supporting destination so the Bazaar map has a stable public-market counterpart to the new Black Market citadel."
        >
          <p className="max-w-4xl text-sm leading-7 text-white/70 md:text-base">
            Keep the Void Market focused on standard trade, routine auctions, and safe
            exchange flows. Let the Black Market own the sin-lane gameplay identity,
            risky services, and faction-neutral pressure valves.
          </p>
        </SectionCard>
      </div>
    </main>
  );
}
