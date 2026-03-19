"use client";

type EquipmentSlot = {
  label: string;
  value?: string | null;
};

export default function InventoryEquipmentReserveCard() {
  const equipmentSlots: EquipmentSlot[] = [
    { label: "Primary Weapon", value: null },
    { label: "Secondary Weapon", value: null },
    { label: "Armor Core", value: null },
    { label: "Helmet", value: null },
    { label: "Gauntlets", value: null },
    { label: "Boots", value: null },
    { label: "Rune Container", value: null },
    { label: "Relic Slot", value: null },
    { label: "Crafting Tools", value: null },
    { label: "Consumable Pouch", value: null },
  ];

  return (
    <div className="grid gap-3">
      {equipmentSlots.map((slot) => (
        <div
          key={slot.label}
          className="group flex items-center justify-between rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-3 transition hover:border-white/25 hover:bg-white/[0.04]"
        >
          <div className="flex flex-col">
            <span className="text-sm uppercase tracking-[0.08em] text-white/60">
              {slot.label}
            </span>

            <span className="text-[11px] uppercase tracking-[0.18em] text-white/30">
              Equipment Slot
            </span>
          </div>

          <span
            className={[
              "text-sm font-semibold",
              slot.value
                ? "text-white"
                : "text-white/35 group-hover:text-white/60",
            ].join(" ")}
          >
            {slot.value ?? "Empty"}
          </span>
        </div>
      ))}
    </div>
  );
}