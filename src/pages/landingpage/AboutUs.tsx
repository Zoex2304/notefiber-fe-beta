import { HeroSection } from "./components/organisms/HeroSection";
import { AboutUsSection2 } from "./components/organisms/AboutUsSection2";
import { AboutUsSection3 } from "./components/organisms/AboutUsSection3";
import { AboutUsSection4 } from "./components/organisms/AboutUsSection4";
import { FAQSection } from "./components/organisms/FAQSection";
import { PricingCallToAction } from "./components/organisms/PricingCallToAction";
import { Section8 } from "./components/organisms/Section8";

export default function AboutUs() {
  return (
    <div className="flex w-full flex-col items-center bg-white">
      <HeroSection
        tagText="About Us"
        title="We Help You Work Smarter"
        description="Our mission is to empower teams with tools that simplify complexity and drive productivity."
        imageSrc="/images/landing/illustrations/podium.svg"
      />
      <AboutUsSection2 />
      <AboutUsSection3 />
      <AboutUsSection4 />
      <FAQSection />
      <PricingCallToAction />
      <Section8 />
    </div>
  );
}
