import GameHudShell from "@/components/layout/GameHudShell";
import ExplorationPanel from "@/components/exploration/ExplorationPanel";
import ExplorationScreenSummary from "@/components/exploration/ExplorationScreenSummary";
import FirstSessionObjective from "@/components/guidance/FirstSessionObjective";
import CurrentOpportunityCard from "@/components/guidance/CurrentOpportunityCard";

export default function HomePage() {
  return (
    <GameHudShell>
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 xl:max-w-md 2xl:max-w-xl">
        <div>
          <ExplorationScreenSummary />
        </div>

        <div>
          <FirstSessionObjective />
        </div>

        <div>
          <CurrentOpportunityCard />
        </div>

        <div className="mx-auto w-full max-w-md xl:max-w-none">
          <ExplorationPanel />
        </div>
      </div>
    </GameHudShell>
  );
}
