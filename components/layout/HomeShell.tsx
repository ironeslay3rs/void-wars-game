import FrameOverlay from "@/components/chrome/FrameOverlay";
import ScreenLines from "@/components/chrome/ScreenLines";
import CornerBrackets from "@/components/chrome/CornerBrackets";
import BackgroundScene from "@/components/home/BackgroundScene";
import CenterHeroScene from "@/components/home/CenterHeroScene";
import TopBar from "@/components/layout/TopBar";
import LeftCommandMenu from "@/components/layout/LeftCommandMenu";
import HomeHudClient from "@/components/layout/HomeHudClient";

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

        <HomeHudClient />
      </div>
    </main>
  );
}