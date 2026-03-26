"use client";

export default function DamageNumber({
  damage,
  isCrit,
  xPct,
  yPct,
}: {
  damage: number;
  isCrit: boolean;
  xPct: number;
  yPct: number;
}) {
  return (
    <div
      className="pointer-events-none absolute text-center font-black tabular-nums animate-[voidFieldDamageUp_0.8s_ease-out_forwards]"
      style={{ left: `${xPct}%`, top: `${yPct}%` }}
    >
      <span
        className={
          isCrit
            ? "text-[16px] leading-none tracking-tight text-yellow-200 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] md:text-[18px]"
            : "text-[13px] leading-none text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.45)] md:text-sm"
        }
      >
        {isCrit ? `${damage}!` : `-${damage}`}
      </span>
    </div>
  );
}

