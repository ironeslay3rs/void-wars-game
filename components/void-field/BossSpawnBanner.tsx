"use client";

import { useEffect, useState } from "react";

/**
 * Dramatic boss spawn banner — appears for 3s when a boss mob spawns
 * on the void field. Uses the CSS animation `void-field-boss-spawn-banner`
 * for the scale-up → float-away → fade-out arc.
 */
export default function BossSpawnBanner({
  bossLabel,
}: {
  /** Null when no boss is active. Non-null triggers the banner. */
  bossLabel: string | null;
}) {
  const [visible, setVisible] = useState(false);
  const [lastLabel, setLastLabel] = useState<string | null>(null);
  const [bannerKey, setBannerKey] = useState(0);

  useEffect(() => {
    if (bossLabel && bossLabel !== lastLabel) {
      setLastLabel(bossLabel);
      setVisible(true);
      setBannerKey((k) => k + 1);
      const t = window.setTimeout(() => setVisible(false), 3200);
      return () => window.clearTimeout(t);
    }
    if (!bossLabel && lastLabel) {
      setLastLabel(null);
    }
  }, [bossLabel, lastLabel]);

  if (!visible || !bossLabel) return null;

  return (
    <div
      key={bannerKey}
      className="void-field-boss-spawn-banner pointer-events-none absolute inset-x-0 top-[30%] z-[60] flex flex-col items-center gap-2"
    >
      <div className="rounded-xl border border-red-400/60 bg-red-950/80 px-6 py-4 shadow-[0_0_60px_rgba(239,68,68,0.4),0_0_120px_rgba(153,27,27,0.25)] backdrop-blur-sm">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-300/90">
          Boss Incoming
        </div>
        <div className="mt-1 text-2xl font-black uppercase tracking-[0.08em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] md:text-3xl">
          {bossLabel}
        </div>
        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-200/70">
          Prepare for the hunt
        </div>
      </div>
    </div>
  );
}
