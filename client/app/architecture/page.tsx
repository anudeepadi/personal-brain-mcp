import { PipelineAnimation } from "@/components/architecture/pipeline-animation";
import { BenchmarkCharts } from "@/components/architecture/benchmark-charts";
import { AcademicSection } from "@/components/architecture/academic-section";

export default function ArchitecturePage() {
  return (
    <div>
      <PipelineAnimation />
      <BenchmarkCharts />
      <AcademicSection />
    </div>
  );
}
