import SectionCard from "@/components/shared/SectionCard";

export type ScreenDataManualSection = {
  title: string;
  description: string;
  body?: string;
  items?: string[];
};

type ScreenDataManualSectionsProps = {
  sections: ScreenDataManualSection[];
  /** Shown above the section cards, e.g. "Field manual" */
  heading?: string;
  ariaLabel?: string;
};

export default function ScreenDataManualSections({
  sections,
  heading = "Field manual",
  ariaLabel = "Protocol reference sections",
}: ScreenDataManualSectionsProps) {
  if (sections.length === 0) return null;

  return (
    <section aria-label={ariaLabel} className="space-y-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
        {heading}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((sec) => (
          <SectionCard key={sec.title} title={sec.title} description={sec.description}>
            {sec.body ? (
              <p className="text-sm leading-relaxed text-white/62">{sec.body}</p>
            ) : null}
            {sec.items && sec.items.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-white/58 marker:text-white/35">
                {sec.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </SectionCard>
        ))}
      </div>
    </section>
  );
}
