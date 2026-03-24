import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { professionsScreenData } from "@/features/professions/professionsScreenData";

export default function ProfessionsScreen() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(80,60,100,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow={professionsScreenData.eyebrow}
          title={professionsScreenData.title}
          subtitle={professionsScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {professionsScreenData.cards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <SectionCard
          title="Profession doctrine"
          description="This layer exists to bind pressure, crafted power, and ascension into one progression structure."
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {professionsScreenData.doctrine.map((entry) => (
              <article
                key={entry.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/82">
                  {entry.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/62">
                  {entry.description}
                </p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Primary war professions"
          description="These are the profession pillars that best match Void Wars: Oblivion's cultivation-war direction."
        >
          <div className="grid gap-4 xl:grid-cols-2">
            {professionsScreenData.tracks.map((track) => (
              <article
                key={track.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">{track.title}</h2>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
                    {track.family}
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Battlefield role
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/65">
                      {track.battlefieldRole}
                    </p>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                      Loop role
                    </div>
                    <p className="mt-2 text-sm leading-6 text-cyan-100/82">
                      {track.loopRole}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-3">
          {professionsScreenData.sections.map((section) => (
            <SectionCard
              key={section.title}
              title={section.title}
              description={section.description}
            >
              <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/65">
                {section.body ? <p className="leading-6">{section.body}</p> : null}

                {section.items ? (
                  <ul className="space-y-3">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3 leading-6">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </SectionCard>
          ))}
        </div>
      </div>
    </main>
  );
}
