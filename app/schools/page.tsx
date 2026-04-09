"use client";

import SchoolListByEmpire from "@/components/schools/SchoolListByEmpire";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import { getAllEmpires } from "@/features/empires/empireSelectors";

export default function SchoolsIndexPage() {
  const empires = getAllEmpires();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(60,30,80,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <ScreenHeader
          eyebrow="World · Regional layer"
          title="The Seven Schools"
          subtitle="Seven public institutions, one per capital sin, each anchored in a nation and parented by an empire. Each school wears a sin in the open. Each school's shadow walks a Blackcity lane."
          backHref="/empires"
          backLabel="Back to Empires"
        />

        <SectionCard
          title="The dual face"
          description="Why every sin has two homes."
        >
          <p className="text-sm leading-6 text-white/75">
            Canon teaches that the seven sins are not only corruptions — they
            are <em>pressures of growth</em>. Every sin therefore has two homes:
            an open <strong>school</strong> inside its native empire, and a
            shadow <strong>lane</strong> inside the neutral citadel of
            Blackcity. The school teaches the discipline. The lane sells what
            the discipline produces. Walk both.
          </p>
        </SectionCard>

        <div className="space-y-10">
          {empires.map((empire) => (
            <SchoolListByEmpire
              key={empire.id}
              empire={empire}
              linkEmpireHeading
            />
          ))}
        </div>
      </div>
    </main>
  );
}
