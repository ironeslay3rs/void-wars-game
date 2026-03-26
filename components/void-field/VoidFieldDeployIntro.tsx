"use client";

export default function VoidFieldDeployIntro() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-50 px-3 pt-4 md:px-6 md:pt-6">
      <div className="pointer-events-auto mx-auto w-full max-w-2xl rounded-xl border border-cyan-300/25 bg-black/65 p-4 backdrop-blur-md">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-500/10 text-2xl">
            !
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-200/70">
              Void Entry
            </div>
            <div className="mt-1 text-lg font-black text-white">
              Deploy into the shared hunt
            </div>
            <p className="mt-2 text-sm text-white/70">
              AFK contract is the payout source. Realtime play can raise your
              contribution bonus on top of the baseline.
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-2 text-sm text-white/75">
          <p>
            Click the field to move toward that point. WASD / arrows when the
            link is live.
          </p>
          <p>
            <span className="font-semibold text-white">Space</span> or Attack
            strikes the nearest mob in range. Click a mob to focus it.
          </p>
          <p>
            After resolve, start a new expedition from the realm path to change
            zone.
          </p>
        </div>
      </div>
    </div>
  );
}
