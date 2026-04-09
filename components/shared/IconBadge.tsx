import { ReactNode } from "react";

type IconBadgeProps = {
  children: ReactNode;
};

export default function IconBadge({ children }: IconBadgeProps) {
  return (
    <div className="relative flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center overflow-hidden rounded-[12px] border border-white/10 bg-[linear-gradient(135deg,rgba(12,13,20,0.95),rgba(7,8,12,0.88))] text-slate-200 shadow-[0_10px_25px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] sm:h-10 sm:w-10 sm:min-h-0 sm:min-w-0 sm:rounded-[10px] md:h-9 md:w-9">
      <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  );
}