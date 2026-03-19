import { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export default function SectionCard({
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/30 p-5 shadow-[0_0_30px_rgba(0,0,0,0.25)] backdrop-blur-sm">
      <div className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold tracking-[0.08em] text-white">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-white/55">{description}</p>
        ) : null}
      </div>

      {children}
    </section>
  );
}