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
  bio: "Verdant Coil Engaged",
  mecha: "Chrome Synod Engaged",
  spirit: "Ember Vault Engaged",
};

const pathDescriptionMap: Record<PathSelection, string> = {
  bio: "Body-first evolution, predator instinct, and wrath-forged adaptation.",
  mecha: "Mind-first precision, Ironheart order, and pride-bound machine rule.",
  spirit: "Soul-fire memory, rune saintcraft, and the Pure path toward fusion.",
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
    : "Humanity is trapped inside the Void. Body, mind, and soul must reunite to break it.";

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
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_center,rgba(110,80,255,0.22),rgba(12,12,18,0.15)_62%,rgba(0,0,0,0)_100%)] shadow-[0_0_40px_rgba(120,90,255,0.18)]">
            <div className="h-14 w-14 rounded-full border border-white/15 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45),rgba(104,74,255,0.24),rgba(22,12,40,0.9))]" />
          </div>

          <div className="mt-8 text-[12px] font-semibold uppercase tracking-[0.42em] text-white/55">
            Core Rule Interface
          </div>

          <div className="mt-4 text-[30px] font-black uppercase tracking-[0.12em] text-white">
            {title}
          </div>

          <p className="mx-auto mt-4 max-w-[280px] text-sm leading-6 text-white/65">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
