import PathCard from "@/components/home/PathCard";
import { factionData } from "@/features/factions/factionData";
import SectionTitle from "@/components/shared/SectionTitle";
import PanelFrame from "@/components/shared/PanelFrame";
import type { FactionAlignment } from "@/features/game/gameTypes";

type PathSelection = Exclude<FactionAlignment, "unbound">;

type FactionPathPanelProps = {
  selectedPath: PathSelection | null;
  onSelectPath: (path: PathSelection) => void;
};

export default function FactionPathPanel({
  selectedPath,
  onSelectPath,
}: FactionPathPanelProps) {
  return (
    <PanelFrame className="bg-black/45">
      <div className="mb-4">
        <SectionTitle title="Choose Your Doctrine" />
      </div>

      <div className="space-y-3">
        {factionData.map((faction) => {
          const factionKey = faction.id as PathSelection;
          const isSelected = selectedPath === factionKey;

          return (
            <PathCard
              key={faction.id}
              name={faction.name}
              description={faction.description}
              icon={faction.icon}
              themeKey={faction.themeKey}
              tagline={faction.tagline}
              isSelected={isSelected}
              onClick={() => onSelectPath(factionKey)}
            />
          );
        })}
      </div>
    </PanelFrame>
  );
}