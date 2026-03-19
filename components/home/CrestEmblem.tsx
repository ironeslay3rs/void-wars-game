import Image from "next/image";
import PanelFrame from "@/components/shared/PanelFrame";
import { homeSceneData } from "@/features/home/homeSceneData";
import { assets } from "@/lib/assets";

export default function CrestEmblem() {
  return (
    <div className="flex justify-center">
      <PanelFrame className="min-w-[340px] max-w-[460px] bg-black/20">
        <div className="flex flex-col items-center text-center">
          <div className="relative h-44 w-44 md:h-52 md:w-52">
            <Image
              src={assets.home.crest}
              alt="Void Wars central crest"
              fill
              className="object-contain drop-shadow-[0_0_40px_rgba(120,80,255,0.45)]"
              priority
            />
          </div>

          <div className="mt-4 text-[14px] font-black uppercase tracking-[0.35em] text-slate-100">
            {homeSceneData.crestLabel}
          </div>

          <div className="mt-2 text-[12px] text-slate-400">
            {homeSceneData.crestSubLabel}
          </div>
        </div>
      </PanelFrame>
    </div>
  );
}