"use client";

import { useGame } from "@/features/game/gameContext";
import {
  canGrantRuneCrafterLicense,
  canUnlockL3RareRuneSet,
  getSaintRuneL5Panel,
} from "@/features/progression/mythicAscensionLogic";
import SectionCard from "@/components/shared/SectionCard";

export default function MythicAscensionPanel() {
  const { state, dispatch } = useGame();
  const p = state.player;
  const m = p.mythicAscension;
  const saint = getSaintRuneL5Panel(m);
  const l3Ok = canUnlockL3RareRuneSet(p);
  const crafterOk = canGrantRuneCrafterLicense(p);

  return (
    <SectionCard
      title="Mythic ladder (late progression)"
      description="Rare L3 sets, Rune Crafter recognition, and the Saint Rune road — Book 1 exposes gates, not the full L5 forge."
    >
      <div className="space-y-4 text-sm text-white/70">
        <div className="rounded-xl border border-amber-400/25 bg-amber-950/20 px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200/80">
            Ironheart
          </div>
          <p className="mt-1 text-white/80">
            Stock:{" "}
            <span className="font-semibold text-white">{p.resources.ironHeart}</span>
            {" · "}
            Boss-named drops on the void field (war metals).
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-white/45">
                L3 Rare Rune set
              </p>
              <p className="mt-1 text-white/85">
                {m.l3RareRuneSetUnlocked
                  ? "Unlocked — obsidian-cycle set available to crafters."
                  : "Sealed — needs rune depth, rank, Ironheart, and dust tithe."}
              </p>
              {!m.l3RareRuneSetUnlocked ? (
                <p className="mt-2 text-xs text-white/50">
                  Requires rank 4+, depth 4+, 1× Ironheart, 30 rune dust.
                </p>
              ) : null}
            </div>
            {!m.l3RareRuneSetUnlocked ? (
              <button
                type="button"
                disabled={!l3Ok}
                onClick={() =>
                  dispatch({
                    type: "ATTEMPT_MYTHIC_UNLOCK",
                    payload: "l3-rare-rune-set",
                  })
                }
                className="rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Unlock
              </button>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-white/45">
                Rune Crafter title
              </p>
              <p className="mt-1 text-white/85">
                {m.runeCrafterLicense
                  ? "Licensed — profession recognised on the Professions board."
                  : "Requires L3 unlock, rank 5+, 2× Ironheart tithe."}
              </p>
            </div>
            {m.l3RareRuneSetUnlocked && !m.runeCrafterLicense ? (
              <button
                type="button"
                disabled={!crafterOk}
                onClick={() =>
                  dispatch({
                    type: "ATTEMPT_MYTHIC_UNLOCK",
                    payload: "rune-crafter-license",
                  })
                }
                className="rounded-lg border border-violet-400/40 bg-violet-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Earn license
              </button>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-violet-400/25 bg-violet-950/20 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-200/80">
            {saint.title}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">{saint.body}</p>
        </div>
      </div>
    </SectionCard>
  );
}
