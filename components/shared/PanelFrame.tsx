import { ReactNode } from "react";

type PanelFrameProps = {
  children: ReactNode;
  className?: string;
};

export default function PanelFrame({
  children,
  className = "",
}: PanelFrameProps) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-[18px]",
        "border border-white/10 bg-black/55 backdrop-blur-md",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_18px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)]",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_20%,transparent_80%,rgba(255,255,255,0.03))]",
        "after:pointer-events-none after:absolute after:inset-[1px] after:rounded-[16px] after:border after:border-white/5",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="pointer-events-none absolute inset-y-4 left-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute inset-y-4 right-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 p-4">{children}</div>
    </div>
  );
}