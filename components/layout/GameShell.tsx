import type { ReactNode } from "react";

type GameShellProps = {
  children: ReactNode;
  backgroundImage?: string;
  overlayClassName?: string;
};

export default function GameShell({
  children,
  backgroundImage = "/main-menu-bg.png.png",
  overlayClassName,
}: GameShellProps) {
  return (
    <main className="safe-min-h-screen relative overflow-hidden bg-[#05070d] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
        style={{ backgroundImage: `url("${backgroundImage}")` }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(140,30,30,0.16),transparent_26%),linear-gradient(180deg,rgba(6,8,14,0.28)_0%,rgba(5,7,13,0.68)_38%,rgba(4,5,9,0.96)_100%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.18)_18%,rgba(0,0,0,0.06)_34%,rgba(0,0,0,0.06)_66%,rgba(0,0,0,0.18)_82%,rgba(0,0,0,0.42)_100%)]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[120px] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[160px] bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.58))]" />

      <div className="pointer-events-none absolute left-0 top-0 h-full w-[180px] bg-[linear-gradient(90deg,rgba(0,0,0,0.34),transparent)]" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-[180px] bg-[linear-gradient(270deg,rgba(0,0,0,0.34),transparent)]" />

      <div className="pointer-events-none absolute inset-[18px] rounded-[28px] border border-white/8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]" />
      <div className="pointer-events-none absolute inset-[28px] rounded-[24px] border border-white/5" />

      <div className="pointer-events-none absolute left-[24px] right-[24px] top-[18px] h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      <div className="pointer-events-none absolute bottom-[18px] left-[24px] right-[24px] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="pointer-events-none absolute left-[18px] top-[120px] bottom-[120px] w-px bg-gradient-to-b from-transparent via-red-500/18 to-transparent" />
      <div className="pointer-events-none absolute right-[18px] top-[120px] bottom-[120px] w-px bg-gradient-to-b from-transparent via-cyan-400/14 to-transparent" />

      <div
        className={[
          "safe-min-h-screen relative z-10",
          overlayClassName ?? "",
        ].join(" ")}
      >
        {children}
      </div>
    </main>
  );
}
