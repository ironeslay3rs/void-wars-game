import type { ReactNode } from "react";
import FrameOverlay from "@/components/chrome/FrameOverlay";
import ScreenLines from "@/components/chrome/ScreenLines";
import CornerBrackets from "@/components/chrome/CornerBrackets";
import BackgroundScene from "@/components/home/BackgroundScene";
import TopBar from "@/components/layout/TopBar";
import HomeHudClient from "@/components/layout/HomeHudClient";

type GameHudShellProps = {
  children?: ReactNode;
};

export default function GameHudShell({ children }: GameHudShellProps) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <BackgroundScene />

      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/35 via-transparent to-black/80" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 via-transparent to-black/55" />

      <ScreenLines />
      <FrameOverlay />
      <CornerBrackets />

      <div className="relative z-20 min-h-screen pb-28 xl:pb-0">
        <TopBar />
        <HomeHudClient />

        {children ? (
          <section className="relative z-30 px-4 pb-6 pt-4 sm:px-6 xl:pointer-events-none xl:absolute xl:inset-x-0 xl:top-20 xl:px-6">
            <div className="xl:mx-auto xl:flex xl:w-full xl:max-w-xl xl:flex-col xl:gap-4 xl:pointer-events-auto">
              {children}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
