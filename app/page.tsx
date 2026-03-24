import MainBackgroundScene from "@/components/home/MainBackgroundScene";
import HomeHudClient from "@/components/home/HomeHudClient";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <MainBackgroundScene />
      <HomeHudClient />
    </main>
  );
}