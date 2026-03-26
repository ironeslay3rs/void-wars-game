type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
};

export default function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  backHref,
  backLabel = "Return",
}: ScreenHeaderProps) {
  return (
    <div className="space-y-2">
      {backHref ? (
        <div>
          <a
            href={backHref}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80 transition hover:border-white/20 hover:bg-white/10"
          >
            <span aria-hidden>←</span>
            {backLabel}
          </a>
        </div>
      ) : null}
      {eyebrow ? (
        <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-300/70">
          {eyebrow}
        </p>
      ) : null}

      <h1 className="text-3xl font-semibold tracking-[0.08em] text-white md:text-4xl">
        {title}
      </h1>

      {subtitle ? (
        <p className="max-w-3xl text-sm text-white/60 md:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}