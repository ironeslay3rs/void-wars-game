import StatChip from "@/components/shared/StatChip";
import PanelFrame from "@/components/shared/PanelFrame";
import { resourceData } from "@/features/resources/resourceData";
import type { ResourcesState } from "@/features/game/gameTypes";

type ResourceBarProps = {
  values: ResourcesState;
};

export default function ResourceBar({ values }: ResourceBarProps) {
  return (
    <div className="mx-auto max-w-[1100px]">
      <PanelFrame className="bg-black/50">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {resourceData.map((resource) => (
            <StatChip
              key={resource.id}
              label={`${resource.label} ${
                values[resource.id as keyof ResourcesState] ?? 0
              }`}
              icon={resource.icon}
              iconAlt={resource.iconAlt}
            />
          ))}
        </div>
      </PanelFrame>
    </div>
  );
}