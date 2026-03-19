import { resourceData } from "@/features/resources/resourceData";
import StatChip from "@/components/shared/StatChip";
import PanelFrame from "@/components/shared/PanelFrame";

export default function ResourceBar() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <PanelFrame className="bg-black/50">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {resourceData.map((item) => (
            <StatChip
              key={item.id}
              label={`${item.label} ${item.value}`}
              icon={item.icon}
            />
          ))}
        </div>
      </PanelFrame>
    </div>
  );
}