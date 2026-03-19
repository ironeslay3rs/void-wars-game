export default function BazaarTopHeader() {
  return (
    <div className="pointer-events-none mx-auto mb-8 max-w-[980px] text-center">
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
          The Nexus Bazaar
        </span>
      </div>
    </div>
  );
}