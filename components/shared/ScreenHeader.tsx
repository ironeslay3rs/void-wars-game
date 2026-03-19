type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export default function ScreenHeader({
  eyebrow,
  title,
  subtitle,
}: ScreenHeaderProps) {
  return (
    <div className="space-y-2">
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