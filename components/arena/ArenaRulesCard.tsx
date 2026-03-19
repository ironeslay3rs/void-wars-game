type ArenaRulesCardProps = {
  rules: string[];
};

export default function ArenaRulesCard({ rules }: ArenaRulesCardProps) {
  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <div
          key={rule}
          className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(22,18,26,0.84),rgba(10,10,16,0.9))] px-4 py-3 text-sm text-white/70"
        >
          {rule}
        </div>
      ))}
    </div>
  );
}