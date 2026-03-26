"use client";

import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import MasteryDepthPanel from "@/components/career/MasteryDepthPanel";
import { careerScreenData } from "@/features/career/careerScreenData";

export default function CareerScreen() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(60,70,120,0.24),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          backHref="/home"
          backLabel="Back to Home"
          eyebrow={careerScreenData.eyebrow}
          title={careerScreenData.title}
          subtitle={careerScreenData.subtitle}
        />

        <MasteryDepthPanel />

        <div className="grid gap-6 md:grid-cols-3">
          {careerScreenData.cards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {careerScreenData.sections.map((section) => (
            <SectionCard
              key={section.title}
              title={section.title}
              description={section.description}
            >
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
                {section.body}
              </div>
            </SectionCard>
          ))}
        </div>

        {careerScreenData.doctrines && careerScreenData.doctrines.length > 0 ? (
          <div>
            <div className="mb-5 text-[11px] font-bold uppercase tracking-[0.26em] text-white/40">
              School Doctrines
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {careerScreenData.doctrines.map((doc) => {
                const accent =
                  doc.school === "bio"
                    ? {
                        border: "border-emerald-500/20",
                        bg: "bg-emerald-500/[0.06]",
                        chip: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
                        num: "text-emerald-400/70",
                        title: "text-emerald-50",
                      }
                    : doc.school === "mecha"
                      ? {
                          border: "border-cyan-500/20",
                          bg: "bg-cyan-500/[0.06]",
                          chip: "border-cyan-400/30 bg-cyan-400/10 text-cyan-100",
                          num: "text-cyan-400/70",
                          title: "text-cyan-50",
                        }
                      : {
                          border: "border-amber-500/20",
                          bg: "bg-amber-500/[0.06]",
                          chip: "border-amber-400/30 bg-amber-400/10 text-amber-100",
                          num: "text-amber-400/70",
                          title: "text-amber-50",
                        };
                return (
                  <div
                    key={doc.school}
                    className={[
                      "rounded-2xl border p-5",
                      accent.border,
                      accent.bg,
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                        accent.chip,
                      ].join(" ")}
                    >
                      {doc.schoolLabel}
                    </div>
                    <div className="mt-3 text-[11px] italic text-white/50">
                      &ldquo;{doc.tagline}&rdquo;
                    </div>
                    <div
                      className={[
                        "mt-2 text-base font-black uppercase tracking-[0.06em]",
                        accent.title,
                      ].join(" ")}
                    >
                      {doc.name}
                    </div>
                    <div className="mt-4 space-y-2.5">
                      {doc.lines.map((line) => (
                        <div key={line.number} className="flex items-start gap-3">
                          <span
                            className={[
                              "mt-0.5 shrink-0 text-[10px] font-black uppercase tracking-[0.14em]",
                              accent.num,
                            ].join(" ")}
                          >
                            {String(line.number).padStart(2, "0")}
                          </span>
                          <div>
                            <div className="text-xs font-semibold text-white/85">
                              {line.flame}
                            </div>
                            <div className="mt-0.5 text-[11px] text-white/45">
                              {line.meaning}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}