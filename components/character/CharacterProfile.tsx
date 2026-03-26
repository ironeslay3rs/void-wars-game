"use client";

import { useGame } from "@/features/game/gameContext";
import type { CareerFocus, FactionAlignment } from "@/features/game/gameTypes";
import {
  CHARACTER_PORTRAIT_IDS,
  type CharacterPortraitId,
} from "@/features/characters/characterPortraits";
import CharacterPortraitImage from "@/components/character/CharacterPortraitImage";

function factionLabel(alignment: FactionAlignment): string {
  switch (alignment) {
    case "bio":
      return "Bio — Verdant Coil";
    case "mecha":
      return "Mecha — Chrome Synod";
    case "pure":
      return "Pure — Ember Vault";
    default:
      return "Unbound";
  }
}

export default function CharacterProfile() {
  const { state, dispatch } = useGame();
  const p = state.player;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-white/15 bg-black/45 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
        <div className="relative aspect-[4/5] w-full">
          <CharacterPortraitImage
            portraitId={p.characterPortraitId}
            className="absolute inset-0"
            sizes="(max-width: 768px) 100vw, 384px"
            priority
          />
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-black uppercase tracking-[0.14em] text-white">
          {p.playerName}
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
          {factionLabel(p.factionAlignment)}
        </p>
        <p className="mt-3 text-xs text-white/45">
          Portrait is for hub UI only — field deploy still uses your path icon.
        </p>
      </div>

      <div>
        <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          Career Focus
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { value: "combat",    label: "Combat",    sub: "Field pressure" },
              { value: "gathering", label: "Gathering", sub: "Loot extraction" },
              { value: "crafting",  label: "Crafting",  sub: "District utility" },
            ] as { value: CareerFocus; label: string; sub: string }[]
          ).map(({ value, label, sub }) => {
            const active = p.careerFocus === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() =>
                  dispatch({
                    type: "SET_CAREER_FOCUS",
                    payload: active ? null : value,
                  })
                }
                aria-pressed={active}
                className={[
                  "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-colors",
                  active
                    ? "border-cyan-400/70 bg-cyan-950/40 ring-2 ring-cyan-400/30"
                    : "border-white/12 hover:border-white/25",
                ].join(" ")}
              >
                <span className={["text-[11px] font-black uppercase tracking-[0.14em]", active ? "text-cyan-200" : "text-white/80"].join(" ")}>
                  {label}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">
                  {sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          Portrait
        </p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {CHARACTER_PORTRAIT_IDS.map((id: CharacterPortraitId) => {
            const selected = p.characterPortraitId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() =>
                  dispatch({ type: "SET_CHARACTER_PORTRAIT_ID", payload: id })
                }
                className={[
                  "relative aspect-square overflow-hidden rounded-xl border transition-colors",
                  selected
                    ? "border-cyan-400/70 ring-2 ring-cyan-400/35"
                    : "border-white/12 hover:border-white/25",
                ].join(" ")}
                aria-pressed={selected}
                title={id.replace(/_/g, " ")}
              >
                <CharacterPortraitImage
                  portraitId={id}
                  className="absolute inset-0"
                  sizes="120px"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
