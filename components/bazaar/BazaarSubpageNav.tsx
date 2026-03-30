"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type BazaarSubpageNavProps = {
  accentClassName?: string;
  backHref?: string;
  backLabel?: string;
};

export default function BazaarSubpageNav({
  accentClassName = "hover:border-white/30",
  backHref = "/bazaar",
  backLabel = "Back to Bazaar",
}: BazaarSubpageNavProps) {
  return (
    <div className="flex justify-end">
      <Link
        href={backHref}
        className={[
          "inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10",
          accentClassName,
        ].join(" ")}
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
    </div>
  );
}
