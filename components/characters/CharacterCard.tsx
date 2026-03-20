"use client";

import Image from "next/image";
import {
  CharacterRecord,
  factionLabels,
  getFactionAccentClasses,
} from "@/features/characters/charactersData";

type CharacterCardProps = {
  character: CharacterRecord;
  onClick?: (character: CharacterRecord) => void;
};

export default function CharacterCard({
  character,
  onClick,
}: CharacterCardProps) {
  const accent = getFactionAccentClasses(character.faction);

  return (
    <button
      type="button"
      onClick={() => onClick?.(character)}
      className={[
        "group w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-left",
        "backdrop-blur-sm transition duration-200",
        "hover:-translate-y-0.5 hover:bg-black/50",
        "focus:outline-none focus:ring-2 focus:ring-white/15",
        accent.ring,
      ].join(" ")}
    >
      <div className="relative flex h-[260px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_rgba(0,0,0,0)_60%)] p-4">
        <Image
          src={character.image}
          alt={character.name}
          width={220}
          height={220}
          className="max-h-full w-auto object-contain transition duration-200 group-hover:scale-[1.03]"
          priority={false}
        />
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">
              {character.name}
            </h3>
            <p className="mt-1 text-sm text-white/60">{character.role}</p>
          </div>

          <span
            className={[
              "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
              accent.badge,
            ].join(" ")}
          >
            T{character.tier}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-[0.18em] text-white/45">
            {factionLabels[character.faction]}
          </span>
          <span className="text-[11px] uppercase tracking-[0.16em] text-white/35">
            View Unit
          </span>
        </div>

        <p className="text-sm leading-6 text-white/72">
          {character.description}
        </p>
      </div>
    </button>
  );
}