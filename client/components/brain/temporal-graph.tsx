"use client";

import { useRef, useEffect } from "react";
import type { GraphNode, GraphEdge } from "@/lib/use-memory-engine";

interface TemporalGraphProps {
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
  readonly isConsolidating: boolean;
}

export function TemporalGraph({
  nodes,
  edges,
  isConsolidating,
}: TemporalGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;

    // Clear to light background
    ctx.clearRect(0, 0, w, h);

    // Entity nodes (exclude "user" center node)
    const entityNodes = nodes.filter((n) => n.type === "entity");
    const radius = Math.min(w, h) * 0.35;

    // Calculate entity positions in a circle
    const positions = new Map<string, { x: number; y: number }>();
    positions.set("user", { x: cx, y: cy });

    entityNodes.forEach((node, i) => {
      const angle =
        (i / Math.max(entityNodes.length, 1)) * Math.PI * 2 - Math.PI / 2;
      positions.set(node.id, {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      });
    });

    // Draw edges
    for (const edge of edges) {
      const from = positions.get(edge.source);
      const to = positions.get(edge.target);
      if (!from || !to) continue;

      const isSuperseded = edge.valid_until !== undefined;

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);

      if (isSuperseded) {
        ctx.strokeStyle = "rgba(217, 48, 37, 0.35)";
        ctx.setLineDash([4, 4]);
      } else {
        ctx.strokeStyle = "rgba(0, 87, 255, 0.5)";
        ctx.setLineDash([]);
      }
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      // Edge label
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      ctx.font = "10px monospace";
      ctx.fillStyle = isSuperseded
        ? "rgba(217, 48, 37, 0.6)"
        : "rgba(0, 87, 255, 0.7)";
      ctx.textAlign = "center";
      ctx.fillText(edge.relation, midX, midY - 4);
    }

    // Draw entity nodes
    for (const node of entityNodes) {
      const pos = positions.get(node.id);
      if (!pos) continue;

      const isSuperseded = node.valid_until !== undefined;
      const nodeRadius = 5;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = isSuperseded
        ? "rgba(217, 48, 37, 0.4)"
        : "rgba(26, 127, 75, 0.9)";
      ctx.fill();

      // Node label
      ctx.font = "11px sans-serif";
      ctx.fillStyle = isSuperseded
        ? "rgba(217, 48, 37, 0.7)"
        : "#0a0a0a";
      ctx.textAlign = "center";
      const label = isSuperseded ? `${node.label} [superseded]` : node.label;
      ctx.fillText(label, pos.x, pos.y + nodeRadius + 14);
    }

    // Draw center "You" node
    ctx.beginPath();
    ctx.arc(cx, cy, 11, 0, Math.PI * 2);
    ctx.fillStyle = "#0057FF";
    ctx.fill();
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("You", cx, cy);
    ctx.textBaseline = "alphabetic";
  }, [nodes, edges]);

  return (
    <div className="relative h-full bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 px-4 py-2 flex items-center justify-between z-10">
        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
          Temporal Graph
        </span>
        {isConsolidating && (
          <span className="text-xs text-accent animate-pulse font-mono">
            consolidating...
          </span>
        )}
      </div>

      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
