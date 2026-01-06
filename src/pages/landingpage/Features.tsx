import { HeroSection } from "./components/organisms/HeroSection";
import { FeaturesSection1 } from "./components/organisms/FeaturesSection1";
import { FAQSection } from "./components/organisms/FAQSection";
import { PricingCallToAction } from "./components/organisms/PricingCallToAction";
import { Section8 } from "./components/organisms/Section8";

export default function Features() {
  return (
    <div className="flex w-full flex-col items-center bg-white">
      <HeroSection
        tagText="Features"
        title="Powerful Features for You"
        description="Explore the tools that will revolutionize your workflow and boost your team's efficiency."
        imageSrc="/src/assets/images/landing/illustrations/ilustration of feature page hero.png"
      />
      <FeaturesSection1 />
      <FAQSection />
      <PricingCallToAction />
      <Section8 />
    </div>
  );
}
