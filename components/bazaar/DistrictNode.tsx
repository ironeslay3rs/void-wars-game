import { bazaarDistrictThemes } from "@/config/bazaarTheme";

type ThemeKey = keyof typeof bazaarDistrictThemes;

type DistrictNodeProps = {
  title: string;
  subtitle: string;
  description: string;
  themeKey: ThemeKey;
  positionClass: string;
  widthClass: string;
  icon: React.ComponentType<{ className?: string }>;
};

export default function DistrictNode({
  title,
  subtitle,
  description,
  themeKey,
  positionClass,
  widthClass,
  icon: Icon,
}: DistrictNodeProps) {
  const theme = bazaarDistrictThemes[themeKey];

  return (
    <button
      className={`absolute ${positionClass} ${widthClass} group text-left transition duration-200 hover:scale-[1.02] hover:-translate-y-0.5`}
    >
      <div
        className={[
          "relative overflow-hidden rounded-[18px] border bg-black/55 backdrop-blur-md px-4 py-3",
          theme.border,
          theme.glow,
        ].join(" ")}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.overlay} opacity-55`} />
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="pointer-events-none absolute inset-y-4 left-0 w-px bg-gradient-to-b from-transparent via-white/12 to-transparent" />
        <div className="pointer-events-none absolute inset-y-4 right-0 w-px bg-gradient-to-b from-transparent via-white/12 to-transparent" />

        <div className="relative z-10 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <Icon className="h-5 w-5 text-white/90" />
          </div>

          <div className="min-w-0">
            <div className="text-[19px] font-black leading-none text-amber-100 tracking-[0.01em]">
              {title}
            </div>
            <div className="mt-1 text-[12px] font-bold uppercase tracking-[0.14em] text-slate-200/85">
              {subtitle}
            </div>
            <div className="mt-2 text-[12px] leading-5 text-slate-300/90 opacity-0 max-h-0 overflow-hidden transition-all duration-200 group-hover:opacity-100 group-hover:max-h-24">
              {description}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}