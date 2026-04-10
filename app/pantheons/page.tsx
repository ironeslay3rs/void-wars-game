"use client";

import PantheonListByEmpire from "@/components/pantheons/PantheonListByEmpire";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import { getAllEmpires } from "@/features/empires/empireSelectors";

export default function PantheonsIndexPage() {
  const empires = getAllEmpires();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(40,30,80,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <ScreenHeader
          eyebrow="World · Cultural layer"
          title="The Seven Pantheons"
          subtitle="Seven shattered remnants of older divine civilizations. Each surviving practice anchors one school and one empire — discipline outliving belief."
          backHref="/schools"
          backLabel="Back to Schools"
        />

        <SectionCard
          title="Why pantheons still matter"
          description="Canon: pantheons should not feel like random mythology references."
        >
          <p className="text-sm leading-6 text-white/75">
            The seven pantheons named here are not myth catalogues — they are
            the cultural traditions whose <em>discipline</em> survived the fall
            of their gods. Canon teaches that every pantheon tracks how its
            divine civilization fell, what survived, and which figures became
            the demons of the next age. The schools you can already walk are
            the open inheritors of those surviving practices. Walk both layers.
          </p>
        </SectionCard>

        <div className="space-y-10">
          {empires.map((empire) => (
            <PantheonListByEmpire
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
