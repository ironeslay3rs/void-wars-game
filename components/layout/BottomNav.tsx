import Link from "next/link";
import { bottomNavData } from "@/features/navigation/bottomNavData";
import StatChip from "@/components/shared/StatChip";

export default function BottomNav() {
  return (
    <nav className="mx-auto flex max-w-[1200px] items-center justify-center gap-3">
      {bottomNavData.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="transition-transform duration-200 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 rounded-[12px]"
        >
          <StatChip label={item.label} />
        </Link>
      ))}
    </nav>
  );
}