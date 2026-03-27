import Link from "next/link";

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
          <Link
            href={backHref}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white/80 transition hover:border-white/20 hover:bg-white/10 active:scale-[0.97]"
          >
            <span aria-hidden>←</span>
            {backLabel}
          </Link>
        </div>
      ) : null}
      {eyebrow ? (
        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-white/45">
          {eyebrow}
        </p>
      ) : null}

      <h1 className="text-2xl font-black uppercase tracking-[0.06em] text-white sm:text-3xl md:text-4xl">
        {title}
      </h1>

      {subtitle ? (
        <p className="max-w-3xl text-sm leading-6 text-white/60">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
