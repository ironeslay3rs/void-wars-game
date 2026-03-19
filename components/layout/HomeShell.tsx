import FrameOverlay from "@/components/chrome/FrameOverlay";
import ScreenLines from "@/components/chrome/ScreenLines";
import CornerBrackets from "@/components/chrome/CornerBrackets";
import BackgroundScene from "@/components/home/BackgroundScene";
import CenterHeroScene from "@/components/home/CenterHeroScene";
import FactionPathPanel from "@/components/home/FactionPathPanel";
import ConditionWidget from "@/components/home/ConditionWidget";
import TopBar from "@/components/layout/TopBar";
import LeftCommandMenu from "@/components/layout/LeftCommandMenu";
import ResourceBar from "@/components/layout/ResourceBar";
import BottomNav from "@/components/layout/BottomNav";

export default function HomeShell() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <BackgroundScene />

      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/35 via-transparent to-black/80" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 via-transparent to-black/55" />

      <ScreenLines />
      <FrameOverlay />
      <CornerBrackets />

      <div className="relative z-20 min-h-screen">
        <TopBar />
        <LeftCommandMenu />

        <section className="pointer-events-none absolute inset-x-[18%] top-[10%] bottom-[20%]">
          <CenterHeroScene />
        </section>

        <section className="absolute right-8 top-16 z-30 w-[320px] xl:w-[360px]">
          <FactionPathPanel />
        </section>

        <section className="absolute right-8 bottom-28 z-30 w-[320px] xl:w-[360px]">
          <ConditionWidget />
        </section>

        <section className="absolute inset-x-8 bottom-16 z-30">
          <ResourceBar />
        </section>

        <section className="absolute inset-x-8 bottom-3 z-30">
          <BottomNav />
        </section>
      </div>
    </main>
  );
}