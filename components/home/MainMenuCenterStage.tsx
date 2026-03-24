import type { FactionAlignment } from "@/features/game/gameTypes";

type PathSelection = Exclude<FactionAlignment, "unbound">;

type MainMenuCenterStageProps = {
  selectedPath: PathSelection | null;
};

const pathGlowMap: Record<PathSelection, string> = {
  bio: "from-emerald-500/18 via-emerald-400/6 to-transparent",
  mecha: "from-cyan-500/18 via-blue-400/6 to-transparent",
  spirit: "from-fuchsia-500/18 via-violet-400/6 to-transparent",
};

const pathLabelMap: Record<PathSelection, string> = {
  bio: "Bio Path Engaged",
  mecha: "Mecha Path Engaged",
  spirit: "Spirit Path Engaged",
};

const pathDescriptionMap: Record<PathSelection, string> = {
  bio: "Adaptive growth, predator instinct, and biological escalation.",
  mecha: "Precision systems, engineered dominance, and machine discipline.",
  spirit: "Soul-fire mastery, memory awakening, and rune-bound ascent.",
};

export default function MainMenuCenterStage({
  selectedPath,
}: MainMenuCenterStageProps) {
  const glowClass = selectedPath
    ? pathGlowMap[selectedPath]
    : "from-white/10 via-white/0 to-transparent";

  const title = selectedPath ? pathLabelMap[selectedPath] : "Central Crest";
  const description = selectedPath
    ? pathDescriptionMap[selectedPath]
    : "Core faction focus, progression identity, and world entry nexus.";

  return (
    <div className="relative flex flex-col items-center justify-between px-4 pb-1 pt-1 sm:px-6 xl:h-full xl:px-8 xl:pb-2 xl:pt-2">
      <div className="text-center">
        <div className="text-[34px] font-black uppercase tracking-[0.12em] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.5)] sm:text-[42px] xl:text-[68px] xl:tracking-[0.1em]">
          Void Wars
        </div>

        <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/70 sm:text-[12px] sm:tracking-[0.42em] xl:-mt-3 xl:text-[16px] xl:tracking-[0.55em]">
          Oblivion
        </div>
      </div>

      <div className="relative flex w-full flex-1 items-center justify-center py-3 xl:py-0">
        <div
          className={[
            "absolute h-[280px] w-[280px] rounded-full bg-gradient-to-b blur-3xl sm:h-[360px] sm:w-[360px] xl:h-[520px] xl:w-[520px]",
            glowClass,
          ].join(" ")}
        />

        <div className="relative w-full max-w-[420px] rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(10,10,18,0.82),rgba(6,6,12,0.92))] px-5 py-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-md sm:px-6 sm:py-8 xl:rounded-[34px] xl:px-8 xl:py-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_center,rgba(110,80,255,0.22),rgba(12,12,18,0.15)_62%,rgba(0,0,0,0)_100%)] shadow-[0_0_40px_rgba(120,90,255,0.18)] sm:h-24 sm:w-24 xl:h-28 xl:w-28">
            <div className="h-10 w-10 rounded-full border border-white/15 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45),rgba(104,74,255,0.24),rgba(22,12,40,0.9))] sm:h-12 sm:w-12 xl:h-14 xl:w-14" />
          </div>

          <div className="mt-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55 sm:mt-6 sm:text-[11px] sm:tracking-[0.34em] xl:mt-8 xl:text-[12px] xl:tracking-[0.42em]">
            Central Interface
          </div>

          <div className="mt-3 text-[20px] font-black uppercase tracking-[0.1em] text-white sm:mt-4 sm:text-[24px] xl:text-[30px] xl:tracking-[0.12em]">
            {title}
          </div>

          <p className="mx-auto mt-3 max-w-[280px] text-sm leading-6 text-white/65 xl:mt-4">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}