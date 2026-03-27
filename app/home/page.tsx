import GameHudShell from "@/components/layout/GameHudShell";
import HomeOnboardingGuard from "@/components/home/HomeOnboardingGuard";
import ExplorationPanel from "@/components/exploration/ExplorationPanel";
import ExplorationScreenSummary from "@/components/exploration/ExplorationScreenSummary";
import FirstSessionObjective from "@/components/guidance/FirstSessionObjective";
import CurrentOpportunityCard from "@/components/guidance/CurrentOpportunityCard";
import HomeResourceStrip from "@/components/home/HomeResourceStrip";
import HomeProgressionPanel from "@/components/home/HomeProgressionPanel";

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <HomeOnboardingGuard />
      <GameHudShell />

      <section className="pointer-events-none fixed inset-x-0 top-20 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-20 overflow-y-auto px-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 pb-4">
          <div className="pointer-events-auto">
            <HomeProgressionPanel />
          </div>

          <div className="pointer-events-auto">
            <ExplorationScreenSummary />
          </div>

          <div className="pointer-events-auto">
            <FirstSessionObjective />
          </div>

          <div className="pointer-events-auto">
            <CurrentOpportunityCard />
          </div>

          <div className="pointer-events-auto mx-auto w-full max-w-md">
            <ExplorationPanel />
          </div>
        </div>
      </section>

      <section className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 px-4 sm:px-6">
        <div className="pointer-events-auto mx-auto w-full max-w-4xl">
          <HomeResourceStrip />
        </div>
      </section>
    </div>
  );
}
