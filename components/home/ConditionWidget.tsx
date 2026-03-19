import SectionTitle from "@/components/shared/SectionTitle";
import PanelFrame from "@/components/shared/PanelFrame";
import { homeSceneData } from "@/features/home/homeSceneData";

export default function ConditionWidget() {
  return (
    <PanelFrame>
      <SectionTitle title="Condition" />

      <div className="mt-5 flex items-center gap-4">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-cyan-400/70 text-[28px] font-black text-white shadow-[0_0_24px_rgba(34,211,238,0.18)]">
          <div className="absolute inset-2 rounded-full border border-white/10" />
          <span className="relative z-10">{homeSceneData.condition}%</span>
        </div>

        <div className="flex-1">
          <div className="h-[8px] overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(0,180,255,0.95),rgba(35,211,238,0.95))]"
              style={{ width: `${homeSceneData.condition}%` }}
            />
          </div>

          <p className="mt-3 text-[13px] font-medium text-slate-300">
            System condition stable.
          </p>
        </div>
      </div>
    </PanelFrame>
  );
}