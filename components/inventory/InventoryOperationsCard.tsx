export default function InventoryOperationsCard() {
  const storagePanels = [
    {
      title: "Quick Slots",
      body: "Reserved for consumables, combat tools, and hotbar-linked utility items.",
    },
    {
      title: "Vault Access",
      body: "Future long-term storage expansion for rare materials, named items, and market reserves.",
    },
    {
      title: "Sorting Rules",
      body: "Later this panel can control filtering by rarity, faction path, profession type, and crafting relevance.",
    },
  ];

  return (
    <div className="space-y-3">
      {storagePanels.map((panel) => (
        <div
          key={panel.title}
          className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,18,26,0.84),rgba(10,10,16,0.9))] p-4"
        >
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
            {panel.title}
          </div>
          <div className="mt-3 text-sm leading-6 text-white/65">
            {panel.body}
          </div>
        </div>
      ))}
    </div>
  );
}