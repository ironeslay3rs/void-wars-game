import GameHudShell from "@/components/layout/GameHudShell";
import HomeOnboardingGuard from "@/components/home/HomeOnboardingGuard";

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <HomeOnboardingGuard />
      <GameHudShell />
    </div>
  );
}
