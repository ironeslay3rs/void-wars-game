"use client";

import Image from "next/image";
import type { CharacterRecord } from "@/features/characters/charactersData";
import {
  factionLabels,
  getFactionAccentClasses,
} from "@/features/characters/charactersData";

type CharacterModalProps = {
  character: CharacterRecord | null;
  isOpen: boolean;
  onClose: () => void;
};

function getStatColor(stat: number) {
  if (stat >= 90) return "bg-emerald-400";
  if (stat >= 75) return "bg-cyan-400";
  if (stat >= 60) return "bg-yellow-400";
  return "bg-orange-400";
}

export default function CharacterModal({
  character,
  isOpen,
  onClose,
}: CharacterModalProps) {
  if (!isOpen || !character) {
    return null;
  }

  const accent = getFactionAccentClasses(character.faction);
  const stats = character.stats;

  const statRows = stats
    ? [
        { label: "HP", value: stats.hp },
        { label: "Attack", value: stats.attack },
        { label: "Defense", value: stats.defense },
        { label: "Speed", value: stats.speed },
      ]
    : [];

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4 py-6 pt-safe-top pb-safe-bottom backdrop-blur-sm sm:px-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${character.name} details`}
    >
      <div
        className="relative flex max-h-[calc(100dvh-var(--safe-area-inset-top)-var(--safe-area-inset-bottom)-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,20,34,0.96),rgba(10,12,22,0.98))] shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 min-h-11 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          Close
        </button>

        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.10),_rgba(0,0,0,0)_62%)] p-6 sm:min-h-[320px] sm:p-8 lg:min-h-[560px] lg:border-b-0 lg:border-r">
            <Image
              src={character.image}
              alt={character.name}
              width={540}
              height={540}
              className="max-h-[240px] w-auto object-contain sm:max-h-[320px] lg:max-h-[520px]"
              priority
            />
          </div>

          <div className="flex min-h-0 flex-col gap-5 overflow-y-auto p-5 pr-4 sm:gap-6 sm:p-6 sm:pr-5 lg:p-8 lg:pr-6">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={[
                  "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                  accent.badge,
                ].join(" ")}
              >
                {factionLabels[character.faction]}
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
                Tier {character.tier}
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                {character.name}
              </h2>
              <p className="mt-2 text-[15px] uppercase tracking-[0.14em] text-white/50 sm:text-sm sm:tracking-[0.16em]">
                {character.role}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                Lore Summary
              </div>
              <p className="mt-3 text-[15px] leading-6 text-white/75 sm:text-sm sm:leading-7">
                {character.description}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                  Combat Profile
                </div>
                <div className="mt-3 space-y-2 text-sm text-white/75">
                  <div className="flex items-center justify-between gap-4">
                    <span>Role</span>
                    <span className="font-medium text-white">
                      {character.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Faction</span>
                    <span className="font-medium text-white">
                      {factionLabels[character.faction]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Tier</span>
                    <span className="font-medium text-white">
                      T{character.tier}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                  Base Stats
                </div>

                {stats ? (
                  <div className="mt-3 space-y-4">
                    {statRows.map((stat) => (
                      <div key={stat.label} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3 text-sm text-white/75">
                          <span>{stat.label}</span>
                          <span className="font-medium text-white">
                            {stat.value}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${getStatColor(
                              stat.value,
                            )}`}
                            style={{ width: `${Math.min(stat.value, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/50">
                    Stats not assigned yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-sm text-white/55">
              This modal now supports safe, optional unit stats and can expand
              later into abilities, rune slots, progression, and arena loadouts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
