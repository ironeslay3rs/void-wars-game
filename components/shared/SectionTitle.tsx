type SectionTitleProps = {
  title: string;
};

export default function SectionTitle({ title }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/15" />
      <h2 className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-200">
        {title}
      </h2>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/15" />
    </div>
  );
}