import Link from "next/link";

type MenuButtonProps = {
  label: string;
  isPrimary?: boolean;
  href?: string;
};

export default function MenuButton({
  label,
  isPrimary = false,
  href,
}: MenuButtonProps) {
  const className = [
    "group relative flex w-full items-center overflow-hidden rounded-[14px]",
    "border px-4 py-4 text-left text-[15px] font-extrabold uppercase tracking-[0.04em]",
    "transition duration-200",
    isPrimary
      ? [
          "border-red-500/60 bg-[linear-gradient(135deg,rgba(120,0,0,0.85),rgba(45,0,0,0.85))] text-red-50",
          "shadow-[0_0_25px_rgba(220,38,38,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]",
          "hover:border-red-400/80 hover:brightness-110",
        ].join(" ")
      : [
          "border-white/10 bg-[linear-gradient(135deg,rgba(8,10,18,0.88),rgba(6,7,12,0.82))] text-slate-100",
          "shadow-[0_10px_30px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.04)]",
          "hover:border-white/20 hover:bg-[linear-gradient(135deg,rgba(18,20,30,0.92),rgba(10,11,18,0.88))]",
        ].join(" "),
  ].join(" ");

  const content = (
    <>
      <span
        className={[
          "absolute inset-y-0 left-0 w-[3px]",
          isPrimary ? "bg-red-400" : "bg-white/10 group-hover:bg-white/25",
        ].join(" ")}
      />

      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05),transparent_30%,transparent_70%,rgba(255,255,255,0.03))]" />

      <span className="relative z-10">{label}</span>

      <span className="ml-auto relative z-10 h-[10px] w-[10px] rotate-45 border-t border-r border-white/20 group-hover:border-white/40" />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <button className={className}>{content}</button>;
}