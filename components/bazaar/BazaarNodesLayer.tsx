import BazaarNode from "@/components/bazaar/BazaarNode";
import { bazaarDistrictData } from "@/features/bazaar/bazaarDistrictData";

export default function BazaarNodesLayer() {
  return (
    <div className="absolute inset-0 z-20">
      {bazaarDistrictData.map((district) => (
        <BazaarNode key={district.id} {...district} />
      ))}
    </div>
  );
}