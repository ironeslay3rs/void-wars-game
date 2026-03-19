type ArenaReward = {
  label: string;
  value: string;
};

type ArenaRewardsCardProps = {
  rewards: ArenaReward[];
};

export default function ArenaRewardsCard({
  rewards,
}: ArenaRewardsCardProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rewards.map((reward) => (
        <div
          key={reward.label}
          className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(22,18,26,0.84),rgba(10,10,16,0.9))] p-4"
        >
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
            {reward.label}
          </div>
          <div className="mt-2 text-base font-black uppercase tracking-[0.04em] text-white">
            {reward.value}
          </div>
        </div>
      ))}
    </div>
  );
}