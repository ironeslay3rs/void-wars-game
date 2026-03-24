import Link from "next/link";
import { bazaarHubThemes } from "@/config/bazaarTheme";

type ThemeKey = keyof typeof bazaarHubThemes;

type CentralHubCardProps = {
  route: string;
  title: string;
  subtitle: string;
  badge: string;
  themeKey: ThemeKey;
  positionClass: string;
  widthClass: string;
};

export default function CentralHubCard({
  route,
  title,
  subtitle,
  badge,
  themeKey,
  positionClass,
  widthClass,
}: CentralHubCardProps) {
  const theme = bazaarHubThemes[themeKey];

  return (
    <Link
      href={route}
      aria-label={`Open ${title}`}
      className={`absolute ${positionClass} ${widthClass} z-20 text-left transition duration-200 hover:scale-[1.02] hover:-translate-y-0.5`}
    >
      <div
        className={[
          "relative overflow-hidden rounded-[22px] border bg-black/55 px-6 py-5 backdrop-blur-md",
          theme.border,
          theme.glow,
        ].join(" ")}
      >
        <div className={`absolute inset-0 ${theme.overlay}`} />
        <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <div className="relative z-10 text-center">
          <div className="text-[34px] font-black leading-none text-amber-100 md:text-[40px]">
            {title}
          </div>

          <div className="mt-2 text-[15px] font-black uppercase tracking-[0.16em] text-amber-200/90">
            {subtitle}
          </div>

          <div className="mt-3 inline-flex items-center rounded-[12px] border border-white/10 bg-black/30 px-4 py-2 text-[13px] font-bold uppercase tracking-[0.12em] text-slate-200">
            {badge}
          </div>
        </div>
      </div>
    </Link>
  );
}
