import { HeroSection } from "@/components/landing/hero-section";
import {
  TypographySection,
  ColorSection,
  ComponentsSection,
  DashboardSection,
  EditorialSection,
} from "@/components/landing/design-showcase";
import { CTASection } from "@/components/landing/cta-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <TypographySection />
      <ColorSection />
      <ComponentsSection />
      <DashboardSection />
      <EditorialSection />
      <CTASection />
    </>
  );
}
