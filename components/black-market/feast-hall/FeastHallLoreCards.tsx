import SectionCard from "@/components/shared/SectionCard";

export default function FeastHallLoreCards() {
  return (
    <SectionCard
      title="Gluttony / Feast Hall"
      description="Blackcity's first live lane: a recovery house where hunger, condition, and salvage are all part of the same decision."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-amber-100/75">
            Neutral Law
          </div>
          <p className="mt-2 text-sm leading-6 text-white/72">
            Deals are sacred in the Black Market. The Feast Hall honors that
            law with fixed terms, clean payment, and no haggling after the
            first bite.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">
            Pure / Ember Vault
          </div>
          <p className="mt-2 text-sm leading-6 text-white/72">
            The lane draws from the Mouth of Inti and Pure rite-pressure,
            but sells survival first: eat now, endure longer, pay in Sinful
            Coin or salvage — then go back to work.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">
            Loop Fit
          </div>
          <p className="mt-2 text-sm leading-6 text-white/72">
            Eat in the citadel, steady the body, then return to the front.
            Recovery here is strong, but every plate still burns hunger and
            keeps survival pressure alive.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
