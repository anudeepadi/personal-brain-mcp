import { MemoryTiersSection } from "@/components/architecture/memory-tiers";
import { PipelineAnimation } from "@/components/architecture/pipeline-animation";
import { BenchmarkCharts } from "@/components/architecture/benchmark-charts";
import { RoadmapSection } from "@/components/architecture/roadmap-section";

export default function ArchitecturePage() {
  return (
    <div>
      <MemoryTiersSection />
      <PipelineAnimation />
      <BenchmarkCharts />
      <RoadmapSection />
    </div>
  );
}
