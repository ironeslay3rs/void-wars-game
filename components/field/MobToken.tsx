"use client";

export default function MobToken({
  hpPct,
  colorClassName,
  targeted,
  label,
}: {
  hpPct: number;
  colorClassName: string;
  targeted: boolean;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={[
          "h-8 w-8 rounded-full border transition md:h-9 md:w-9",
          colorClassName,
          targeted ? "ring-2 ring-white/90" : "",
        ].join(" ")}
        title={label}
      />
      <div className="mt-1 h-1 w-10 overflow-hidden rounded-full bg-black/75 md:w-12">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-[width] duration-200 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, hpPct))}%` }}
        />
      </div>
    </div>
  );
}

