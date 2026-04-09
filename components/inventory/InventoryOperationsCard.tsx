export default function InventoryOperationsCard() {
  const storagePanels = [
    {
      title: "Quick Slots",
      body:
        "Fast-use combat stims and tools are reserved for a later shell — for now, pack through Stores and Crafting before you enter pressure.",
    },
    {
      title: "Cargo truth",
      body:
        "There is no off-site vault: if it is in Stores, it counts toward cargo pressure and overload penalties on missions and the field.",
    },
    {
      title: "Sorting",
      body:
        "Category chips above keep the haul readable — dump weight at War Exchange before you queue long contracts.",
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