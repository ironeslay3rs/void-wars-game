import { getRandomCanonLine, type CanonLineTag } from "@/features/lore/canonLines";

type LoadingQuoteProps = {
  /** Optional tag filter for contextual quotes. */
  tag?: CanonLineTag;
};

/**
 * Full-viewport loading state with a canon lore quote.
 * Used in Next.js loading.tsx files for route transitions.
 */
export default function LoadingQuote({ tag }: LoadingQuoteProps) {
  const line = getRandomCanonLine(tag);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="mx-auto h-1 w-16 animate-pulse rounded-full bg-white/15" />
        <p className="text-sm italic leading-relaxed text-white/45">
          &ldquo;{line.text}&rdquo;
        </p>
        {line.source ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/20">
            — {line.source}
          </p>
        ) : null}
      </div>
    </div>
  );
}
