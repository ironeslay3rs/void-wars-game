import { bottomNavData } from "@/features/navigation/bottomNavData";
import StatChip from "@/components/shared/StatChip";

export default function BottomNav() {
  return (
    <nav className="mx-auto flex max-w-[1200px] items-center justify-center gap-3">
      {bottomNavData.map((item) => (
        <StatChip key={item.id} label={item.label} />
      ))}
    </nav>
  );
}