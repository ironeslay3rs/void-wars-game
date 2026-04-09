import type { CanonLine } from "@/features/lore/canonLines";

type CanonQuoteProps = {
  line: CanonLine;
  /** Visual size variant. */
  size?: "sm" | "md";
};

export default function CanonQuote({ line, size = "sm" }: CanonQuoteProps) {
  const textClass =
    size === "md"
      ? "text-sm leading-relaxed"
      : "text-[11px] leading-snug";

  return (
    <figure className="px-1">
      <blockquote
        className={`italic text-white/45 ${textClass}`}
      >
        &ldquo;{line.text}&rdquo;
      </blockquote>
      {line.source ? (
        <figcaption className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
          — {line.source}
        </figcaption>
      ) : null}
    </figure>
  );
}
