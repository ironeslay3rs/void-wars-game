"use client";

import Image from "next/image";
import Link from "next/link";
import { assets } from "@/lib/assets";
import { useGame } from "@/features/game/gameContext";

type ZoneDef = {
  id: string;
  label: string;
  sin: string;
  desc: string;
  left: string;
  top: string;
  width: string;
  height: string;
} & (
  | { href: string; placeholder?: false }
  | { placeholder: true }
);

/**
 * Hit areas are percentage-based; tune if the hub art layout changes.
 * Desktop-first; percentages scale with the map container.
 */
const ZONES: ZoneDef[] = [
  {
    id: "feast-hall",
    label: "Feast Hall",
    sin: "Gluttony",
    desc: "Food, memories, ancestral relics",
    left: "24%",
    top: "58%",
    width: "48%",
    height: "28%",
    href: "/market/black-market/feast-hall",
  },
  {
    id: "arena-of-blood",
    label: "Arena of Blood",
    sin: "Wrath",
    desc: "Weapons, monster hunts, battle contracts",
    left: "6%",
    top: "14%",
    width: "40%",
    height: "36%",
    href: "/arena",
  },
  {
    id: "mirror-house",
    label: "Mirror House",
    sin: "Envy",
    desc: "Illusions, disguises, identity theft",
    left: "54%",
    top: "14%",
    width: "40%",
    height: "36%",
    href: "/market/black-market/mirror-house",
  },
  {
    id: "velvet-den",
    label: "Velvet Den",
    sin: "Lust",
    desc: "Flesh, pleasure rites, desire binding",
    left: "54%",
    top: "54%",
    width: "40%",
    height: "30%",
    href: "/market/black-market/velvet-den",
  },
  {
    id: "golden-bazaar",
    label: "Golden Bazaar",
    sin: "Greed",
    desc: "Artifacts, contracts, forbidden knowledge",
    left: "6%",
    top: "52%",
    width: "16%",
    height: "14%",
    href: "/market/black-market/golden-bazaar",
  },
  {
    id: "ivory-tower",
    label: "Ivory Tower",
    sin: "Pride",
    desc: "Rare relics, secrets, prestige items",
    left: "40%",
    top: "4%",
    width: "22%",
    height: "24%",
    href: "/market/black-market/ivory-tower",
  },
  {
    id: "silent-garden",
    label: "Silent Garden",
    sin: "Sloth",
    desc: "Time relics, stillness aids, vision enhancement",
    left: "78%",
    top: "56%",
    width: "18%",
    height: "20%",
    href: "/market/black-market/silent-garden",
  },
];

function ZoneChrome({ label, sin, desc }: { label: string; sin: string; desc: string }) {
  return (
    <>
      <span
        className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-black/25 via-transparent to-white/[0.04] opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-0 rounded-xl ring-0 ring-amber-200/0 transition-[box-shadow] duration-150 group-hover:shadow-[0_0_28px_rgba(251,191,36,0.18)] group-hover:ring-2 group-hover:ring-amber-200/35 group-focus-visible:shadow-[0_0_28px_rgba(251,191,36,0.22)] group-focus-visible:ring-2 group-focus-visible:ring-amber-200/45"
        aria-hidden
      />
      <span className="pointer-events-none absolute bottom-2 left-1/2 z-[1] flex max-w-[92%] -translate-x-1/2 flex-col items-center gap-0.5 text-center">
        <span className="rounded-md border border-white/15 bg-black/65 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm md:text-[11px]">
          {label}
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45">
          {sin}
        </span>
        <span className="mt-0.5 max-w-[120px] text-[8px] leading-tight text-white/30 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
          {desc}
        </span>
      </span>
    </>
  );
}

const RESOURCE_LABELS: { key: "credits" | "scrapAlloy" | "emberCore" | "runeDust" | "bioSamples"; label: string }[] = [
  { key: "credits",    label: "Credits" },
  { key: "scrapAlloy", label: "Scrap" },
  { key: "emberCore",  label: "Ember" },
  { key: "runeDust",   label: "Rune" },
  { key: "bioSamples", label: "Bio" },
];

export default function BlackMarketMap() {
  const { state } = useGame();
  const res = state.player.resources;
  return (
    <div className="relative h-full min-h-[calc(100dvh-4.5rem)] w-full overflow-hidden bg-black md:min-h-[calc(100dvh-4rem)]">
      <Image
        src={assets.maps.blackMarketHub}
        alt="Black Market citadel — survivor hub map"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25"
        aria-hidden
      />

      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-3 bg-black/70 px-4 py-2 backdrop-blur-sm">
        {RESOURCE_LABELS.map(({ key, label }) => (
          <div key={key} className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45">{label}</span>
            <span className="text-[13px] font-black tabular-nums text-amber-200">{res[key] ?? 0}</span>
          </div>
        ))}
      </div>

      {ZONES.map((zone) => {
        const style = {
          left: zone.left,
          top: zone.top,
          width: zone.width,
          height: zone.height,
        };

        if ("placeholder" in zone && zone.placeholder) {
          return (
            <button
              key={zone.id}
              type="button"
              title={`${zone.label} — ${zone.desc} (opening soon)`}
              aria-label={`${zone.label}, ${zone.sin} — not available yet`}
              className="group absolute z-[2] cursor-pointer rounded-xl border border-transparent bg-transparent text-left transition-colors hover:border-white/10 focus:outline-none focus-visible:border-amber-300/50 focus-visible:ring-2 focus-visible:ring-amber-400/40"
              style={style}
            >
              <ZoneChrome label={zone.label} sin={zone.sin} desc={zone.desc} />
            </button>
          );
        }

        const href = zone.href;
        return (
          <Link
            key={zone.id}
            href={href}
            title={`${zone.label} — ${zone.desc}`}
            aria-label={`${zone.label}, ${zone.sin}`}
            className="group absolute z-[2] rounded-xl border border-transparent bg-transparent transition-colors hover:border-white/12 focus:outline-none focus-visible:border-amber-300/50 focus-visible:ring-2 focus-visible:ring-amber-400/40"
            style={style}
          >
            <ZoneChrome label={zone.label} sin={zone.sin} desc={zone.desc} />
          </Link>
        );
      })}
    </div>
  );
}
