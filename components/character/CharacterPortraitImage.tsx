"use client";

import Image from "next/image";
import type { CharacterPortraitId } from "@/features/characters/characterPortraits";
import { portraitSrcForCharacterId } from "@/features/characters/characterPortraits";

export default function CharacterPortraitImage({
  portraitId,
  className = "",
  sizes = "128px",
  priority = false,
}: {
  portraitId: CharacterPortraitId;
  /** Applied to the positioning wrapper; parent should give explicit size or aspect. */
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  // `next/image` with `fill` needs a positioned wrapper, but some call sites
  // pass `absolute inset-0`. Avoid conflicting `relative absolute` positioning.
  const needsRelative =
    !className.includes("absolute") && !className.includes("fixed");

  return (
    <div className={`${needsRelative ? "relative" : ""} ${className}`.trim()}>
      <Image
        src={portraitSrcForCharacterId(portraitId)}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        draggable={false}
        className="object-contain object-top select-none"
      />
    </div>
  );
}
