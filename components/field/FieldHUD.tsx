"use client";

export default function FieldHUD({
  condition,
  zoneName,
  zoneTier,
  timerSeconds,
  encountersRemaining,
  playerPosition,
}: {
  condition: number;
  zoneName: string;
  zoneTier: string;
  timerSeconds: number;
  encountersRemaining: number;
  playerPosition: { x: number; y: number };
}) {
  return (
    <div className="pointer-events-none absolute inset-x-4 top-4 z-30 flex flex-wrap items-center gap-2 text-xs md:inset-x-6">
      <div className="rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white/85 backdrop-blur">
        {zoneName} · {zoneTier}
      </div>
      <div className="rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white/85 backdrop-blur">
        Condition {condition}%
      </div>
      <div className="rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white/85 backdrop-blur">
        Timer {timerSeconds}s
      </div>
      <div className="rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white/85 backdrop-blur">
        Encounters {encountersRemaining}
      </div>
      <div className="rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white/85 backdrop-blur">
        Pos {playerPosition.x},{playerPosition.y}
      </div>
    </div>
  );
}

