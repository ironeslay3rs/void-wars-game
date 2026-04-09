import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { settingsScreenData } from "@/features/settings/settingsScreenData";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(80,80,100,0.2),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow={settingsScreenData.eyebrow}
          title={settingsScreenData.title}
          subtitle={settingsScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {settingsScreenData.cards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Client Preferences"
            description="Graphics, audio, accessibility, and UI comfort — the live shell follows browser and OS defaults until dedicated routing ships."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm leading-relaxed text-white/55">
              This slice does not expose granular graphics or sound toggles. Use your
              browser or OS accessibility settings; in-client volume and quality
              controls follow when the account shell graduates past M1.
            </div>
          </SectionCard>

          <SectionCard
            title="Account Systems"
            description="Session, profile, and connected services — tied to your auth provider in this web client."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm leading-relaxed text-white/55">
              Account identity flows through the same login you used to open the
              wasteland record. Deeper profile and linked-device controls ship when
              the account shell graduates past M1.
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}