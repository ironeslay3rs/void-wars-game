import BackgroundScene from "@/components/home/BackgroundScene";
import HomeHudClient from "@/components/home/HomeHudClient";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <BackgroundScene />
      <HomeHudClient />
    </main>
  );
}