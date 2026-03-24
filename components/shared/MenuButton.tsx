"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuButtonProps = {
  label: string;
  isPrimary?: boolean;
  href?: string;
  onClick?: () => void;
};

function getIsActive(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MenuButton({
  label,
  isPrimary = false,
  href,
  onClick,
}: MenuButtonProps) {
  const pathname = usePathname();
  const isActive = getIsActive(pathname, href);

  const className = [
    "group relative flex w-full items-center overflow-hidden rounded-[14px]",
    "min-h-12 border px-4 py-4 text-left text-[15px] font-extrabold uppercase tracking-[0.04em]",
    "transition duration-200",
    isPrimary
      ? [
          isActive
            ? "border-red-300/90 bg-[linear-gradient(135deg,rgba(145,0,0,0.92),rgba(58,0,0,0.92))] text-red-50"
            : "border-red-500/60 bg-[linear-gradient(135deg,rgba(120,0,0,0.85),rgba(45,0,0,0.85))] text-red-50",
          "shadow-[0_0_25px_rgba(220,38,38,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]",
          "hover:border-red-400/80 hover:brightness-110",
        ].join(" ")
      : [
          isActive
            ? "border-white/30 bg-[linear-gradient(135deg,rgba(50,18,18,0.92),rgba(18,10,16,0.94))] text-white"
            : "border-white/10 bg-[linear-gradient(135deg,rgba(22,18,26,0.84),rgba(10,10,16,0.9))] text-white/85",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
          "hover:border-white/20 hover:text-white hover:brightness-110",
        ].join(" "),
  ].join(" ");

  const content = (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)] opacity-0 transition duration-200 group-hover:opacity-100" />

      <div className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div
        className={[
          "absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full transition-all duration-200",
          isPrimary
            ? isActive
              ? "bg-red-200 shadow-[0_0_12px_rgba(254,202,202,0.65)]"
              : "bg-red-500/70 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
            : isActive
              ? "bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.25)]"
              : "bg-transparent group-hover:bg-white/25",
        ].join(" ")}
      />

      <span className="relative z-10">{label}</span>

      <span
        className={[
          "ml-auto relative z-10 text-xs tracking-[0.18em] transition duration-200 sm:text-[11px] sm:tracking-[0.2em]",
          isActive
            ? "text-white/70"
            : "text-white/25 group-hover:text-white/45",
        ].join(" ")}
      >
        {isActive ? "LIVE" : "GO"}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} aria-current={isActive ? "page" : undefined}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
}
