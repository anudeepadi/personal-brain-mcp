import { HeroSection } from "@/components/landing/hero-section";
import {
  TypographySection,
  ColorSection,
  ComponentsSection,
  DashboardSection,
  EditorialSection,
} from "@/components/landing/design-showcase";
import { CTASection } from "@/components/landing/cta-section";
import { FadeIn } from "@/components/ui/fade-in";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FadeIn>
        <TypographySection />
      </FadeIn>
      <FadeIn delay={100}>
        <ColorSection />
      </FadeIn>
      <FadeIn delay={100}>
        <ComponentsSection />
      </FadeIn>
      <FadeIn>
        <DashboardSection />
      </FadeIn>
      <FadeIn>
        <EditorialSection />
      </FadeIn>
      <CTASection />
    </>
  );
}
