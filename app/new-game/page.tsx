"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FactionPathPanel from "@/components/home/FactionPathPanel";
import { useGame } from "@/features/game/gameContext";
import type { FactionAlignment } from "@/features/game/gameTypes";

type PathSelection = Exclude<FactionAlignment, "unbound">;

function normalizeCallsign(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 18);
}

export default function NewGamePage() {
  const router = useRouter();
  const { state, dispatch, resetGame } = useGame();

  const [callsign, setCallsign] = useState(() => state.player.playerName);
  const normalizedCallsign = useMemo(() => normalizeCallsign(callsign), [callsign]);
  const [selectedPath, setSelectedPath] = useState<PathSelection | null>(() => {
    return state.player.factionAlignment === "unbound"
      ? null
      : (state.player.factionAlignment as PathSelection);
  });

  const canStart = normalizedCallsign.length >= 2 && selectedPath !== null;

  function handleBegin() {
    if (!canStart || selectedPath === null) return;

    resetGame();
    dispatch({ type: "SET_PLAYER_NAME", payload: normalizedCallsign });
    dispatch({ type: "SET_FACTION_ALIGNMENT", payload: selectedPath });
    router.push("/home");
  }

  return (
    <main className="safe-min-h-screen safe-page-padding bg-[radial-gradient(circle_at_top,_rgba(80,110,160,0.22),_rgba(5,8,18,1)_58%)] py-10 text-white">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-3xl border border-white/10 bg-black/35 p-7 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-300/70">
              Void Wars: Oblivion
            </p>
            <h1 className="text-3xl font-black uppercase tracking-[0.08em] text-white">
              New Game
            </h1>
            <p className="text-sm text-white/60">
              Bind a callsign, choose a path, then step into the first field loop.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                Callsign
              </span>
              <input
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                placeholder="Enter callsign"
                autoComplete="nickname"
              />
              <div className="text-[11px] text-white/45">
                Shown on HUD and contracts. Keep it short.
              </div>
            </label>

            <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
                First action
              </div>
              <p className="mt-2 text-sm text-white/70">
                After you begin, open <span className="font-semibold text-white">Exploration</span>{" "}
                on Home to find a biotech signal and trigger your first hunt.
              </p>
            </div>

            <button
              type="button"
              onClick={handleBegin}
              disabled={!canStart}
              className={[
                "w-full rounded-xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition",
                canStart
                  ? "border-cyan-400/35 bg-cyan-500/12 text-cyan-50 hover:border-cyan-300/50 hover:bg-cyan-500/18"
                  : "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/30",
              ].join(" ")}
            >
              Begin
            </button>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/55">
              <Link className="hover:text-white" href="/home">
                Skip to Home →
              </Link>
              <Link className="hover:text-white" href="/character">
                Character screen →
              </Link>
            </div>
          </div>
        </section>

        <section className="min-w-0">
          <FactionPathPanel
            selectedPath={selectedPath}
            onSelectPath={(path) => setSelectedPath(path)}
          />
        </section>
      </div>
    </main>
  );
}

