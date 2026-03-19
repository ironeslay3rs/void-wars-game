type BazaarNodeProps = {
  label: string;
  x: number;
  y: number;
  type: "bio" | "mecha" | "spirit" | "market" | "combat" | "travel";
};

export default function BazaarNode({
  label,
  x,
  y,
  type,
}: BazaarNodeProps) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
          {type}
        </div>
        <div className="mt-1 font-semibold">{label}</div>
      </div>
    </div>
  );
}