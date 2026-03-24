import FrameOverlay from "@/components/chrome/FrameOverlay";
import ScreenLines from "@/components/chrome/ScreenLines";
import CornerBrackets from "@/components/chrome/CornerBrackets";
import CityHomeScene from "@/components/home/CityHomeScene";
import TopBar from "@/components/layout/TopBar";
import HomeHudClient from "@/components/layout/HomeHudClient";

export default function GameHudShell() {
  return (
    <main className="safe-min-h-screen relative overflow-hidden bg-black text-white">
      <CityHomeScene />

      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/35 via-transparent to-black/80" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 via-transparent to-black/55" />

      <ScreenLines />
      <FrameOverlay />
      <CornerBrackets />

      <div className="safe-min-h-screen relative z-20">
        <TopBar />
        <HomeHudClient />
      </div>
    </main>
  );
}