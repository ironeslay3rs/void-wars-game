"use client";

type DamagePopupProps = {
  value: number;
  crit?: boolean;
  variant?: "player" | "enemy";
};

export default function DamagePopup({
  value,
  crit = false,
  variant = "enemy",
}: DamagePopupProps) {
  return (
    <div
      className={[
        "pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-8",
        "animate-bounce text-xl font-black tracking-[0.04em]",
        crit
          ? "text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.45)]"
          : variant === "enemy"
            ? "text-red-300 drop-shadow-[0_0_10px_rgba(252,165,165,0.35)]"
            : "text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.35)]",
      ].join(" ")}
    >
      {crit ? `🔥 ${value}` : `-${value}`}
    </div>
  );
}