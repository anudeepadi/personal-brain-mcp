import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { ArchitectureSection } from "@/components/landing/architecture-section";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { CTASection } from "@/components/landing/cta-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <ArchitectureSection />
      <ComparisonSection />
      <CTASection />
    </>
  );
}
