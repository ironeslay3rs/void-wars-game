import StatChip from "@/components/shared/StatChip";
import PanelFrame from "@/components/shared/PanelFrame";
import { resourceData } from "@/features/resources/resourceData";

type ResourceBarProps = {
  credits: number;
  voidCrystals: number;
  bioEssence: number;
};

export default function ResourceBar({
  credits,
  voidCrystals,
  bioEssence,
}: ResourceBarProps) {
  const values = {
    credits,
    voidCrystals,
    bioEssence,
  };

  return (
    <div className="mx-auto max-w-[1100px]">
      <PanelFrame className="bg-black/50">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {resourceData.map((resource) => (
            <StatChip
              key={resource.id}
              label={`${resource.label} ${values[resource.id].toLocaleString()}`}
              icon={resource.icon}
              iconAlt={resource.iconAlt}
            />
          ))}
        </div>
      </PanelFrame>
    </div>
  );
}