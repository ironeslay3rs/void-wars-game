import GameHudShell from "@/components/layout/GameHudShell";
import ExplorationPanel from "@/components/exploration/ExplorationPanel";

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <GameHudShell />

      <section className="pointer-events-none fixed inset-x-0 top-20 z-40 px-6">
        <div className="pointer-events-auto mx-auto w-full max-w-md">
          <ExplorationPanel />
        </div>
      </section>
    </div>
  );
}
