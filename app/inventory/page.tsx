import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { inventoryScreenData } from "@/features/inventory/inventoryScreenData";

export default function InventoryPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,90,120,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow={inventoryScreenData.eyebrow}
          title={inventoryScreenData.title}
          subtitle={inventoryScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {inventoryScreenData.cards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Storage Grid"
            description="Future storage space for resources, gear, consumables, and crafting parts."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-xs uppercase tracking-[0.2em] text-white/35"
                >
                  Slot {index + 1}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Resource Ledger"
            description="Dedicated side panel for economy systems and faction resource flow."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
              Reserved for categorized inventory totals, stack filters, and future sorting tools.
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}