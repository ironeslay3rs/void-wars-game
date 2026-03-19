import Link from "next/link";
import type { BazaarDistrict } from "@/features/bazaar/bazaarDistrictData";

const themeStyles: Record<BazaarDistrict["themeKey"], string> = {
  bio: "border-emerald-400/25 bg-emerald-500/10 hover:border-emerald-300/45",
  spirit: "border-violet-400/25 bg-violet-500/10 hover:border-violet-300/45",
  forge: "border-orange-400/25 bg-orange-500/10 hover:border-orange-300/45",
  arena: "border-red-400/25 bg-red-500/10 hover:border-red-300/45",
  mecha: "border-cyan-400/25 bg-cyan-500/10 hover:border-cyan-300/45",
  guild: "border-amber-400/25 bg-amber-500/10 hover:border-amber-300/45",
  faction: "border-fuchsia-400/25 bg-fuchsia-500/10 hover:border-fuchsia-300/45",
  travel: "border-sky-400/25 bg-sky-500/10 hover:border-sky-300/45",
};

export default function BazaarNode({
  title,
  subtitle,
  description,
  route,
  themeKey,
  positionClass,
  widthClass,
}: BazaarDistrict) {
  return (
    <Link
      href={route}
      aria-label={`Open ${title}`}
      className={[
        "group absolute z-30 block rounded-2xl border px-4 py-4 text-white",
        "shadow-[0_14px_35px_rgba(0,0,0,0.35)] backdrop-blur-md",
        "transition duration-200 hover:-translate-y-1 hover:bg-white/10",
        positionClass,
        widthClass,
        themeStyles[themeKey],
      ].join(" ")}
    >
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/55">
        {subtitle}
      </div>

      <h3 className="mt-1 text-sm font-extrabold uppercase tracking-[0.05em]">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-white/72">{description}</p>
    </Link>
  );
}