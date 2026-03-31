"use client";

import Link from "next/link";
import { useGame } from "@/features/game/gameContext";

export default function RuneHierarchyDistrictCallout() {
  const { state } = useGame();
  const p = state.player;
  const m = p.mythicAscension;

  return (
    <div className="rounded-xl border border-violet-400/28 bg-violet-950/22 px-4 py-3 text-sm text-violet-100/90">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
        Phase 7 · Rune hierarchy
      </div>
      <p className="mt-2 leading-relaxed text-white/75">
        Obsidian-cycle crafts in the console below unlock from the{" "}
        <span className="font-semibold text-white/92">Mastery</span> mythic ladder — not from
        recipe discovery alone. Stock{" "}
        <span className="font-semibold text-amber-200/90">Ironheart</span> from boss pulls, clear
        L3, then chase the Rune Crafter license for the lattice channel recipe and a one-stack
        hybrid capacity relief on installs.
      </p>
      <ul className="mt-3 space-y-1.5 text-xs text-white/65">
        <li>
          L3 Rare Rune set:{" "}
          <span className="font-semibold text-white/88">
            {m.l3RareRuneSetUnlocked ? "unlocked" : "sealed"}
          </span>
        </li>
        <li>
          Rune Crafter license:{" "}
          <span className="font-semibold text-white/88">
            {m.runeCrafterLicense ? "held" : "pending"}
          </span>
        </li>
        <li>
          Ironheart in stock:{" "}
          <span className="tabular-nums font-semibold text-white/88">{p.resources.ironHeart}</span>
        </li>
      </ul>
      <p className="mt-3 text-[11px] leading-relaxed text-rose-200/75">
        Unstable lattice: failed obsidian or lattice channel crafts still burn mats and raise{" "}
        <span className="font-semibold text-rose-100/90">void strain</span> — settle strain before
        pushing the war economy.
      </p>
      <Link
        href="/mastery"
        className="mt-3 inline-flex rounded-lg border border-violet-300/40 bg-violet-500/14 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-violet-100 hover:border-violet-200/55"
      >
        Open Mythic ladder
      </Link>
    </div>
  );
}
