import type { FactionAlignment } from "@/features/game/gameTypes";

type PathSelection = Exclude<FactionAlignment, "unbound">;

type MainMenuCenterStageProps = {
  selectedPath: PathSelection | null;
};

const pathGlowMap: Record<PathSelection, string> = {
  bio: "from-emerald-500/18 via-emerald-400/6 to-transparent",
  mecha: "from-cyan-500/18 via-blue-400/6 to-transparent",
  pure: "from-fuchsia-500/18 via-violet-400/6 to-transparent",
};

const pathLabelMap: Record<PathSelection, string> = {
  bio: "Bio Path Engaged",
  mecha: "Mecha Path Engaged",
  pure: "Pure Path Engaged",
};

const pathDescriptionMap: Record<PathSelection, string> = {
  bio: "Adaptive growth, predator instinct, and biological escalation.",
  mecha: "Precision systems, engineered dominance, and machine discipline.",
  pure: "Soul-fire mastery, memory awakening, and rune-bound ascent.",
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
    : "Core affiliation focus, progression identity, and world entry nexus.";

  return (
    <div className="relative flex h-full flex-col items-center justify-between px-8 pb-2 pt-2">
      <div className="text-center">
        <div className="text-[68px] font-black uppercase tracking-[0.1em] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.5)]">
          Void Wars
        </div>

        <div className="-mt-3 text-[16px] font-semibold uppercase tracking-[0.55em] text-white/70">
          Oblivion
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <div
          className={[
            "absolute h-[520px] w-[520px] rounded-full bg-gradient-to-b blur-3xl",
            glowClass,
          ].join(" ")}
        />

        <div className="relative w-[420px] rounded-[34px] border border-white/12 bg-[linear-gradient(180deg,rgba(10,10,18,0.82),rgba(6,6,12,0.92))] px-8 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <div className="relative mx-auto h-32 w-32">
            <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.62),rgba(100,120,255,0.25),rgba(20,16,50,0.95))] shadow-[0_0_30px_rgba(130,120,255,0.3)]" />
            <div className="absolute left-0 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border border-red-300/30 bg-[radial-gradient(circle_at_center,rgba(255,110,110,0.85),rgba(120,30,30,0.2),rgba(0,0,0,0.2))]" />
            <div className="absolute right-0 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border border-violet-300/35 bg-[radial-gradient(circle_at_center,rgba(180,110,255,0.85),rgba(70,40,150,0.2),rgba(0,0,0,0.2))]" />
          </div>

          <div className="mt-8 text-[12px] font-semibold uppercase tracking-[0.42em] text-white/55">
            Central Crest
          </div>

          <div className="mt-4 text-[30px] font-black uppercase tracking-[0.12em] text-white">
            {title}
          </div>

          <p className="mx-auto mt-4 max-w-[280px] text-sm leading-6 text-white/65">
            {description}
          </p>

          <p className="mx-auto mt-4 max-w-[280px] text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Cultivation ascent · AFK contract cadence · survival-first return
            loop through the Black Market.
          </p>
        </div>
      </div>
    </div>
  );
}
