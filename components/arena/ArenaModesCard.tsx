type ArenaMode = {
  title: string;
  subtitle: string;
  body: string;
};

type ArenaModesCardProps = {
  battleModes: ArenaMode[];
  chipClassName: string;
  panelClassName: string;
  selectedModeTitle: string;
  onSelectMode: (mode: ArenaMode) => void;
};

export default function ArenaModesCard({
  battleModes,
  chipClassName,
  panelClassName,
  selectedModeTitle,
  onSelectMode,
}: ArenaModesCardProps) {
  return (
    <div className="space-y-3">
      {battleModes.map((entry) => {
        const isSelected = entry.title === selectedModeTitle;

        return (
          <button
            key={entry.title}
            type="button"
            onClick={() => onSelectMode(entry)}
            className={[
              "block w-full rounded-[20px] border bg-[linear-gradient(180deg,rgba(24,16,24,0.92),rgba(10,10,16,0.96))] p-4 text-left transition duration-200",
              panelClassName,
              isSelected
                ? "scale-[1.01] border-white/25 shadow-[0_0_30px_rgba(255,255,255,0.08)]"
                : "hover:border-white/20 hover:brightness-110",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black uppercase tracking-[0.04em] text-white">
                  {entry.title}
                </h3>
                <p className="mt-1 text-sm text-white/75">{entry.subtitle}</p>
              </div>

              <div
                className={[
                  "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                  chipClassName,
                  isSelected ? "ring-1 ring-white/20" : "",
                ].join(" ")}
              >
                {isSelected ? "Selected" : "Arena"}
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-white/60">
              {entry.body}
            </p>
          </button>
        );
      })}
    </div>
  );
}