import GameShell from "@/components/layout/GameShell";
import FrameOverlay from "@/components/chrome/FrameOverlay";
import ScreenLines from "@/components/chrome/ScreenLines";
import CornerBrackets from "@/components/chrome/CornerBrackets";
import MainBackgroundScene from "@/components/home/MainBackgroundScene";
import CenterHeroScene from "@/components/home/CenterHeroScene";
import TopBar from "@/components/layout/TopBar";
import LeftCommandMenu from "@/components/layout/LeftCommandMenu";
import HomeHudClient from "@/components/layout/HomeHudClient";

export default function HomeShell() {
  return (
    <GameShell backgroundImage="/main-menu-bg.png.png">
      <MainBackgroundScene />

      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-transparent to-black/80 opacity-85" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/55 via-transparent to-black/50 opacity-85" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_42%)] opacity-85" />

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
    </GameShell>
  );
}
