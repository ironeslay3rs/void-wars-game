import BrokerCard from "@/components/shared/BrokerCard";
import SectionCard from "@/components/shared/SectionCard";
import { getBrokersByDistrict } from "@/features/lore/brokerData";

/**
 * Feast Hall broker cards — Mama Sol and Discount Lars.
 * Placed as the FIRST content block so players see brokers immediately.
 */
export default function FeastHallBrokers() {
  const brokers = getBrokersByDistrict("feast-hall");
  if (brokers.length === 0) return null;

  return (
    <SectionCard
      title="Who runs this place"
      description="The people who keep the Feast Hall alive. Tap a broker to interact."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {brokers.map((broker) => (
          <BrokerCard key={broker.id} broker={broker} />
        ))}
      </div>
    </SectionCard>
  );
}
