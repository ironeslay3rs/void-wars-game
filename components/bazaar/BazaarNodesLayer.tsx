"use client";

import { BAZAAR_NODES } from "./bazaarNodes.data";
import BazaarNode from "./BazaarNode";

export default function BazaarNodesLayer() {
  return (
    <div className="absolute inset-0 z-20">
      {BAZAAR_NODES.map((node) => (
<BazaarNode
  key={node.id}
  label={node.label}
  x={node.x}
  y={node.y}
  type={node.type}
/>      ))}
    </div>
  );
}