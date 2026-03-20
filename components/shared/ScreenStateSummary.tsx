"use client";

type ScreenStateSummaryProps = {
  eyebrow: string;
  title: string;
  consequence: string;
  nextStep?: string;
  tone?: "neutral" | "ready" | "warning" | "critical";
};

const toneClassMap = {
  neutral: {
    border: "border-white/10",
    bg: "bg-white/[0.04]",
    eyebrow: "text-white/45",
    title: "text-white",
    text: "text-white/65",
  },
  ready: {
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/8",
    eyebrow: "text-emerald-200/70",
    title: "text-emerald-50",
    text: "text-emerald-50/85",
  },
  warning: {
    border: "border-amber-500/20",
    bg: "bg-amber-500/8",
    eyebrow: "text-amber-200/70",
    title: "text-amber-50",
    text: "text-amber-50/85",
  },
  critical: {
    border: "border-red-500/20",
    bg: "bg-red-500/8",
    eyebrow: "text-red-200/70",
    title: "text-red-50",
    text: "text-red-50/85",
  },
};

export default function ScreenStateSummary({
  eyebrow,
  title,
  consequence,
  nextStep,
  tone = "neutral",
}: ScreenStateSummaryProps) {
  const toneClasses = toneClassMap[tone];

  return (
    <section
      className={[
        "rounded-2xl border p-4 shadow-[0_12px_36px_rgba(0,0,0,0.18)] backdrop-blur-sm",
        toneClasses.border,
        toneClasses.bg,
      ].join(" ")}
    >
      <div className={["text-[10px] uppercase tracking-[0.22em]", toneClasses.eyebrow].join(" ")}>
        {eyebrow}
      </div>

      <div className={["mt-2 text-base font-semibold", toneClasses.title].join(" ")}>
        {title}
      </div>

      <p className={["mt-2 text-sm leading-6", toneClasses.text].join(" ")}>
        {consequence}
      </p>

      {nextStep ? (
        <p className={["mt-2 text-sm leading-6", toneClasses.text].join(" ")}>
          Next Step: {nextStep}
        </p>
      ) : null}
    </section>
  );
}
