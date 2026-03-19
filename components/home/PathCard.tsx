import Image from "next/image";
import { factionThemes } from "@/config/theme";

type ThemeKey = keyof typeof factionThemes;

type PathCardProps = {
  name: string;
  description: string;
  icon: string;
  themeKey: ThemeKey;
  tagline?: string;
};

export default function PathCard({
  name,
  description,
  icon,
  themeKey,
  tagline,
}: PathCardProps) {
  const theme = factionThemes[themeKey];

  return (
    <button
      className={[
        "group relative w-full overflow-hidden rounded-[16px] border text-left transition duration-200",
        "shadow-[0_18px_44px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)]",
        "hover:scale-[1.01] hover:brightness-110",
        theme.border,
        theme.background,
        theme.glow,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="pointer-events-none absolute inset-y-4 left-0 w-px bg-gradient-to-b from-transparent via-white/14 to-transparent" />
      <div className="pointer-events-none absolute inset-y-4 right-0 w-px bg-gradient-to-b from-transparent via-white/14 to-transparent" />

      <div className="relative z-10 flex min-h-[118px] items-center gap-4 px-4 py-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[14px] border border-white/10 bg-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <Image
            src={icon}
            alt={`${name} icon`}
            fill
            className="object-contain p-2 transition duration-200 group-hover:scale-105"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[18px] font-black leading-none text-white md:text-[20px]">
              {name}
            </div>

            <div className="h-[10px] w-[10px] shrink-0 rotate-45 border-t border-r border-white/25 transition duration-200 group-hover:border-white/50" />
          </div>

          {tagline ? (
            <div
              className={`mt-1 text-[10px] font-black uppercase tracking-[0.22em] ${theme.accentText}`}
            >
              {tagline}
            </div>
          ) : null}

          <div className="mt-3 max-w-[240px] text-[12px] leading-5 text-slate-200/90 md:text-[13px]">
            {description}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),transparent_30%,transparent_70%,rgba(255,255,255,0.02))]" />
    </button>
  );
}