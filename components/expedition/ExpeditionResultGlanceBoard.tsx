"use client";

import Link from "next/link";
import type { ExpeditionResultGlanceModel } from "@/features/expedition/expeditionResultGlanceModel";

function toneShell(tone: ExpeditionResultGlanceModel["statusTone"]) {
  if (tone === "strained") {
    return "border-red-400/35 bg-red-950/35 shadow-[0_0_40px_rgba(248,113,113,0.08)]";
  }
  if (tone === "partial") {
    return "border-amber-400/35 bg-amber-950/25 shadow-[0_0_36px_rgba(251,191,36,0.06)]";
  }
  return "border-emerald-400/30 bg-emerald-950/20 shadow-[0_0_36px_rgba(16,185,129,0.07)]";
}

function toneChip(tone: ExpeditionResultGlanceModel["statusTone"]) {
  if (tone === "strained") {
    return "border-red-300/40 bg-red-500/15 text-red-100";
  }
  if (tone === "partial") {
    return "border-amber-300/40 bg-amber-500/12 text-amber-50";
  }
  return "border-emerald-300/40 bg-emerald-500/12 text-emerald-50";
}

function dedupeSteps(
  steps: ExpeditionResultGlanceModel["nextSteps"],
): ExpeditionResultGlanceModel["nextSteps"] {
  const seen = new Set<string>();
  return steps.filter((s) => {
    if (seen.has(s.href)) return false;
    seen.add(s.href);
    return true;
  });
}

export default function ExpeditionResultGlanceBoard({
  model,
  variant = "page",
}: {
  model: ExpeditionResultGlanceModel;
  variant?: "page" | "modal";
}) {
  const steps = dedupeSteps(model.nextSteps);
  const pad = variant === "modal" ? "p-4" : "p-5 md:p-6";

  return (
    <section
      className={[
        "rounded-2xl border",
        toneShell(model.statusTone),
        pad,
      ].join(" ")}
      aria-label="Expedition result at a glance"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
            {model.eyebrow}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">
              {model.headline}
            </h2>
            <span
              className={[
                "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]",
                toneChip(model.statusTone),
              ].join(" ")}
            >
              {model.statusChip}
            </span>
          </div>
          <p className="text-sm font-semibold text-white/88">
            <span className="text-white/55">Target · </span>
            {model.targetSummary}
          </p>
          <p className="text-sm text-cyan-100/85">
            <span className="font-semibold text-cyan-200/90">Extract · </span>
            {model.extractionSummary}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
            1 · What happened
          </div>
          <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-white/78">
            {model.whatHappened.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
            2 · What you gained
          </div>
          <ul className="mt-3 space-y-2">
            {model.gains.map((g, i) => (
              <li
                key={`g-${i}-${g.label}`}
                className={[
                  "flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm",
                  g.emphasis ? "border-emerald-400/20 bg-emerald-500/10" : "",
                ].join(" ")}
              >
                <span className="text-white/70">{g.label}</span>
                {g.detail ? (
                  <span className="font-bold tabular-nums text-emerald-100">
                    {g.detail}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
            3 · What it cost
          </div>
          <ul className="mt-3 space-y-2">
            {model.costs.map((c, i) => (
              <li
                key={`c-${i}-${c.label}`}
                className="space-y-1 rounded-lg border border-red-400/10 bg-red-950/15 px-3 py-2 text-sm"
              >
                <div className="font-semibold text-red-100/90">{c.label}</div>
                {c.detail ? (
                  <div className="text-white/65">{c.detail}</div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
            War Exchange context
          </div>
          <ul className="mt-3 space-y-2 text-sm text-emerald-50/90">
            {model.brokerLines.map((line) => (
              <li
                key={line}
                className="rounded-lg border border-emerald-400/15 bg-emerald-500/5 px-3 py-2"
              >
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-cyan-400/25 bg-cyan-950/25 p-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/75">
          4 · Obvious next step
        </div>
        <p className="mt-2 text-xs text-white/55">
          Black Market routes below are pressure-aware — start with the highlighted
          action, then offload scrap or prep kits as needed.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {steps.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={
                s.primary
                  ? "inline-flex justify-center rounded-xl border border-cyan-300/50 bg-cyan-400/20 px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-cyan-50 transition hover:border-cyan-200/65 hover:bg-cyan-400/28"
                  : "inline-flex justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.1em] text-white/85 transition hover:border-white/25 hover:bg-white/10"
              }
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
