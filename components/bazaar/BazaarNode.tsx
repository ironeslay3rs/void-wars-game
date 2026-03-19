"use client";

type Props = {
  label: string;
  x: number;
  y: number;
  type?: "bio" | "mecha" | "spirit" | "market" | "combat" | "travel";
};

const typeStyles = {
  bio: "bg-green-500/20 border-green-400/40",
  mecha: "bg-orange-500/20 border-orange-400/40",
  spirit: "bg-cyan-500/20 border-cyan-400/40",
  market: "bg-yellow-500/20 border-yellow-400/40",
  combat: "bg-red-500/20 border-red-400/40",
  travel: "bg-purple-500/20 border-purple-400/40",
};

export default function BazaarNode({ label, x, y, type = "market" }: Props) {
  return (
    <div
      className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
    >
      <div
        className={`
          group cursor-pointer
          rounded-xl border px-4 py-2 text-sm font-bold text-white
          backdrop-blur-md transition-all duration-200
          hover:scale-105 hover:shadow-lg
          ${typeStyles[type]}
        `}
      >
        {label}
      </div>
    </div>
  );
}