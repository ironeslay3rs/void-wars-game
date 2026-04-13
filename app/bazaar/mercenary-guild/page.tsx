import HuntingGroundScreen from "@/components/hunting-ground/HuntingGroundScreen";
import MercenaryGuildContractStrip from "@/components/mercenary-guild/MercenaryGuildContractStrip";
import { mercenaryGuildScreenData } from "@/features/mercenary-guild/mercenaryGuildScreenData";

export default function MercenaryGuildPage() {
  return (
    <HuntingGroundScreen
      header={mercenaryGuildScreenData}
      slotBelow={<MercenaryGuildContractStrip />}
    />
  );
}
