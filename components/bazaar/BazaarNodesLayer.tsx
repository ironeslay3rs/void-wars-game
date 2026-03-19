import BazaarNode from "@/components/bazaar/BazaarNode";
import { bazaarMapNodes } from "@/features/bazaar/bazaarMapNodes";

export default function BazaarNodesLayer() {
  return (
    <div className="absolute inset-0 z-20">
      {bazaarMapNodes.map((node) => (
        <BazaarNode
          key={node.id}
          label={node.label}
          x={node.x}
          y={node.y}
          type={node.type}
        />
      ))}
    </div>
  );
}