import Image from "next/image";

type StatChipProps = {
  label: string;
  icon?: string;
};

export default function StatChip({ label, icon }: StatChipProps) {
  return (
    <div className="relative flex items-center gap-3 overflow-hidden rounded-[12px] border border-white/10 bg-[linear-gradient(135deg,rgba(11,12,18,0.95),rgba(6,7,12,0.88))] px-4 py-3 text-[13px] font-black uppercase tracking-[0.04em] text-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {icon ? (
        <div className="relative h-5 w-5 shrink-0">
          <Image
            src={icon}
            alt=""
            fill
            className="object-contain"
          />
        </div>
      ) : null}

      <span>{label}</span>
    </div>
  );
}