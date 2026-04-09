import PlaceholderPanel from "@/components/shared/PlaceholderPanel";

export type ScreenDataStatCard = {
  label: string;
  value: string;
  hint: string;
};

type ScreenDataStatStripProps = {
  cards: ScreenDataStatCard[];
  /** Accessible name for the snapshot region */
  ariaLabel?: string;
};

/**
 * Renders protocol / slice snapshot cards from screen data files (missions, inventory, career, etc.).
 */
export default function ScreenDataStatStrip({
  cards,
  ariaLabel = "Protocol snapshot",
}: ScreenDataStatStripProps) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-3"
      role="region"
      aria-label={ariaLabel}
    >
      {cards.map((card) => (
        <PlaceholderPanel
          key={card.label}
          label={card.label}
          value={card.value}
          hint={card.hint}
        />
      ))}
    </div>
  );
}
