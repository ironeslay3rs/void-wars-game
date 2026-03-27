import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { canonBazaar } from "@/features/canonRegistry";

export default function BazaarTopHeader() {
  return (
    <div className="mx-auto mb-8 max-w-[980px] text-center">
      <div className="mb-4 flex justify-end">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-[16px] border border-white/10 bg-black/45 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition hover:border-amber-300/30 hover:bg-black/55"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Main Panel
        </Link>
      </div>

      <div className="relative inline-block px-12 py-3">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="absolute left-0 top-3 h-px w-24 bg-gradient-to-r from-transparent to-white/15" />
        <div className="absolute right-0 top-3 h-px w-24 bg-gradient-to-l from-transparent to-white/15" />

        <h1 className="text-5xl font-black uppercase tracking-[0.12em] text-amber-100 drop-shadow-[0_6px_16px_rgba(0,0,0,0.45)] md:text-6xl">
          Void Wars
        </h1>

        <p className="mt-1 text-sm font-black uppercase tracking-[0.6em] text-amber-200/85">
          Oblivion
        </p>
      </div>

      <div className="mt-4 inline-flex items-center rounded-[16px] border border-amber-300/20 bg-black/45 px-8 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.35)]">
        <span className="text-[16px] font-black uppercase tracking-[0.12em] text-amber-100 md:text-[22px]">
          {canonBazaar.headingLabel}
        </span>
      </div>

      <div className="mt-4 flex justify-center">
        <Link
          href="/market/black-market"
          className="inline-flex items-center rounded-[16px] border border-orange-300/25 bg-[linear-gradient(135deg,rgba(120,20,10,0.45),rgba(30,10,8,0.72))] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-amber-100 shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:border-orange-200/40"
        >
          Access Black Market
        </Link>
      </div>
    </div>
  );
}
