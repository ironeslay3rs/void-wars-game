"use client";

import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import MasteryDepthPanel from "@/components/career/MasteryDepthPanel";
import { careerScreenData } from "@/features/career/careerScreenData";

export default function CareerScreen() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(60,70,120,0.24),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          backHref="/home"
          backLabel="Back to Home"
          eyebrow={careerScreenData.eyebrow}
          title={careerScreenData.title}
          subtitle={careerScreenData.subtitle}
        />

        <MasteryDepthPanel />

        <div className="grid gap-6 md:grid-cols-3">
          {careerScreenData.cards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {careerScreenData.sections.map((section) => (
            <SectionCard
              key={section.title}
              title={section.title}
              description={section.description}
            >
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
                {section.body}
              </div>
            </SectionCard>
          ))}
        </div>
      </div>
    </main>
  );
}