import PathCard from "@/components/home/PathCard";
import { factionData } from "@/features/factions/factionData";
import SectionTitle from "@/components/shared/SectionTitle";
import PanelFrame from "@/components/shared/PanelFrame";

export default function FactionPathPanel() {
  return (
    <PanelFrame className="bg-black/45">
      <div className="mb-4">
        <SectionTitle title="Choose Your Path" />
      </div>

      <div className="space-y-3">
        {factionData.map((faction) => (
          <PathCard
            key={faction.id}
            name={faction.name}
            description={faction.description}
            icon={faction.icon}
            themeKey={faction.themeKey}
            tagline={faction.tagline}
          />
        ))}
      </div>
    </PanelFrame>
  );
}