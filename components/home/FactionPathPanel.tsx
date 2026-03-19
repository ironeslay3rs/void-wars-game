import PathCard from "@/components/home/PathCard";
import { factionData } from "@/features/factions/factionData";
import SectionTitle from "@/components/shared/SectionTitle";
import PanelFrame from "@/components/shared/PanelFrame";
import { PathType } from "@/features/game/gameTypes";

type FactionPathPanelProps = {
  selectedPath: PathType | null;
  onSelectPath: (path: PathType) => void;
};

export default function FactionPathPanel({
  selectedPath,
  onSelectPath,
}: FactionPathPanelProps) {
  return (
    <PanelFrame className="bg-black/45">
      <div className="mb-4">
        <SectionTitle title="Choose Your Path" />
      </div>

      <div className="space-y-3">
        {factionData.map((faction) => {
          const isSelected = selectedPath === faction.name;

          return (
            <PathCard
              key={faction.id}
              name={faction.name}
              description={faction.description}
              icon={faction.icon}
              themeKey={faction.themeKey}
              tagline={faction.tagline}
              isSelected={isSelected}
              onClick={() => onSelectPath(faction.name as PathType)}
            />
          );
        })}
      </div>
    </PanelFrame>
  );
}