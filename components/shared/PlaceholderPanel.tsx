type PlaceholderPanelProps = {
  label: string;
  value?: string;
  hint?: string;
};

export default function PlaceholderPanel({
  label,
  value = "Pending",
  hint,
}: PlaceholderPanelProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.25em] text-white/45">
          {label}
        </span>
        <span className="text-sm font-medium text-cyan-300">{value}</span>
      </div>

      {hint ? (
        <p className="mt-3 text-sm text-white/55">{hint}</p>
      ) : null}
    </div>
  );
}