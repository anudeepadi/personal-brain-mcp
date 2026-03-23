"use client";

import { useEffect, useState } from "react";

/**
 * 3D isometric cuboid dissected into three layers.
 * Visualizes: Episodic Stream → Knowledge Graph → Compiled Memory
 * with animated amber consolidation flow between layers.
 *
 * No boundary box — floats freely in the hero, editorial-style.
 */

const LAYERS = [
  {
    id: "compiled",
    label: "Compiled Memory",
    sublabel: "0ms retrieval",
    color: "#44403c",
    activeColor: "#b45309",
    topColor: "#57534e",
    activeTopColor: "#d97706",
    sideColor: "#292524",
    activeSideColor: "#92400e",
  },
  {
    id: "graph",
    label: "Knowledge Graph",
    sublabel: "Bitemporal entities",
    color: "#78716c",
    activeColor: "#b45309",
    topColor: "#a8a29e",
    activeTopColor: "#d97706",
    sideColor: "#57534e",
    activeSideColor: "#92400e",
  },
  {
    id: "episodic",
    label: "Episodic Stream",
    sublabel: "<10ms writes",
    color: "#a8a29e",
    activeColor: "#b45309",
    topColor: "#d6d3d1",
    activeTopColor: "#d97706",
    sideColor: "#78716c",
    activeSideColor: "#92400e",
  },
] as const;

function CuboidLayer({
  layer,
  index,
  isActive,
}: {
  layer: (typeof LAYERS)[number];
  index: number;
  isActive: boolean;
}) {
  const height = 56;
  const gap = 22;
  const yOffset = index * (height + gap);

  const frontColor = isActive ? layer.activeColor : layer.color;
  const topColor = isActive ? layer.activeTopColor : layer.topColor;
  const sideColor = isActive ? layer.activeSideColor : layer.sideColor;

  return (
    <g
      style={{
        transition: "all 0.4s ease",
        filter: isActive
          ? "drop-shadow(0 4px 24px rgba(180, 83, 9, 0.4))"
          : "none",
      }}
    >
      {/* Top face */}
      <polygon
        points={`60,${yOffset} 280,${yOffset} 340,${yOffset - 32} 120,${yOffset - 32}`}
        fill={topColor}
        stroke={isActive ? "#d97706" : "rgba(250,250,249,0.08)"}
        strokeWidth="0.5"
        style={{ transition: "fill 0.4s ease, stroke 0.4s ease" }}
      />
      {/* Front face */}
      <polygon
        points={`60,${yOffset} 280,${yOffset} 280,${yOffset + height} 60,${yOffset + height}`}
        fill={frontColor}
        stroke={isActive ? "#d97706" : "rgba(250,250,249,0.04)"}
        strokeWidth="0.5"
        style={{ transition: "fill 0.4s ease, stroke 0.4s ease" }}
      />
      {/* Right face */}
      <polygon
        points={`280,${yOffset} 340,${yOffset - 32} 340,${yOffset + height - 32} 280,${yOffset + height}`}
        fill={sideColor}
        stroke={isActive ? "#d97706" : "rgba(250,250,249,0.04)"}
        strokeWidth="0.5"
        style={{ transition: "fill 0.4s ease, stroke 0.4s ease" }}
      />
      {/* Label on front face */}
      <text
        x={170}
        y={yOffset + height / 2 - 5}
        textAnchor="middle"
        fill={isActive ? "#ffffff" : "#fafaf9"}
        fontSize="13"
        fontFamily="var(--font-sans), system-ui, sans-serif"
        fontWeight="500"
        style={{ transition: "fill 0.4s ease" }}
      >
        {layer.label}
      </text>
      <text
        x={170}
        y={yOffset + height / 2 + 13}
        textAnchor="middle"
        fill={isActive ? "rgba(255,255,255,0.75)" : "rgba(250,250,249,0.55)"}
        fontSize="10"
        fontFamily="var(--font-mono), monospace"
        letterSpacing="0.04em"
        style={{ transition: "fill 0.4s ease" }}
      >
        {layer.sublabel}
      </text>
    </g>
  );
}

function FlowParticles({ active, fromY, toY }: { active: boolean; fromY: number; toY: number }) {
  if (!active) return null;
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <circle key={i} r="2" fill="#d97706" opacity={0.85}>
          <animate attributeName="cy" values={`${fromY};${toY}`} dur="0.8s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
          <animate attributeName="cx" values="170;170" dur="0.8s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.2" dur="0.8s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </g>
  );
}

export function ArchitectureDiagram() {
  const [activeLayer, setActiveLayer] = useState(-1);
  const [flowStage, setFlowStage] = useState(0);

  useEffect(() => {
    const runCycle = () => {
      setFlowStage(1);
      setActiveLayer(2);
      const t1 = setTimeout(() => { setFlowStage(2); setActiveLayer(1); }, 700);
      const t2 = setTimeout(() => { setFlowStage(3); setActiveLayer(0); }, 1400);
      const t3 = setTimeout(() => { setFlowStage(0); setActiveLayer(-1); }, 2400);
      return [t1, t2, t3];
    };

    const init = setTimeout(() => runCycle(), 1000);
    const interval = setInterval(() => runCycle(), 4500);
    return () => { clearTimeout(init); clearInterval(interval); };
  }, []);

  const height = 56;
  const gap = 22;

  return (
    <div className="relative flex flex-col items-center">
      {/* Figure annotation */}
      <div className="font-mono text-[11px] uppercase tracking-[0.05em] text-text-muted mb-6 self-start">
        Fig. 1 — Three-tier memory architecture
      </div>

      {/* Cuboid — no wrapper, floats clean */}
      <svg viewBox="20 -42 360 290" className="w-full" style={{ maxWidth: 420 }}>
        {/* Render bottom-to-top for z-order */}
        {[2, 1, 0].map((i) => (
          <CuboidLayer
            key={LAYERS[i].id}
            layer={LAYERS[i]}
            index={i}
            isActive={activeLayer === i}
          />
        ))}

        {/* Flow particles */}
        <FlowParticles active={flowStage >= 2} fromY={2 * (height + gap) + height} toY={1 * (height + gap)} />
        <FlowParticles active={flowStage >= 3} fromY={1 * (height + gap) + height} toY={0 * (height + gap)} />

        {/* Side annotations */}
        <text x={352} y={1 * (height + gap) + height + gap / 2 + 2} fill="var(--text-muted, #a8a29e)" fontSize="9" fontFamily="var(--font-mono), monospace" textAnchor="start" opacity={flowStage >= 2 ? 1 : 0.25} style={{ transition: "opacity 0.3s ease" }}>
          async
        </text>
        <text x={352} y={0 * (height + gap) + height + gap / 2 + 2} fill="var(--text-muted, #a8a29e)" fontSize="9" fontFamily="var(--font-mono), monospace" textAnchor="start" opacity={flowStage >= 3 ? 1 : 0.25} style={{ transition: "opacity 0.3s ease" }}>
          inject
        </text>
      </svg>

      {/* Pipeline flow label */}
      <div className="font-mono text-[11px] text-text-muted mt-4 self-start">
        input → episodic → graph → compiled · <span className="transition-colors duration-300" style={{ color: flowStage > 0 ? "var(--accent)" : "var(--text-muted)" }}>{flowStage > 0 ? "consolidating" : "idle"}</span>
      </div>
    </div>
  );
}
