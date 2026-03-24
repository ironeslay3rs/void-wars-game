import CityHomeScene from "@/components/home/CityHomeScene";
import FrameOverlay from "@/components/chrome/FrameOverlay";
import ScreenLines from "@/components/chrome/ScreenLines";
import CornerBrackets from "@/components/chrome/CornerBrackets";
import BazaarTopHeader from "@/components/layout/BazaarTopHeader";
import BazaarMapCanvas from "@/components/bazaar/BazaarMapCanvas";

export default function BazaarShell() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <CityHomeScene />

      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(255,160,60,0.18),transparent_28%),linear-gradient(to_bottom,rgba(2,4,10,0.30),rgba(2,4,10,0.78)),linear-gradient(to_right,rgba(0,0,0,0.45),transparent_18%,transparent_82%,rgba(0,0,0,0.45))]" />

      <ScreenLines />
      <FrameOverlay />
      <CornerBrackets />

      <div className="relative z-20 min-h-screen px-6 py-6 md:px-10">
        <BazaarTopHeader />
        <BazaarMapCanvas />
      </div>
    </main>
  );
}