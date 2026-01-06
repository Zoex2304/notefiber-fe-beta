import { HeroSection } from "./components/organisms/HeroSection";
import { ContactFormSection } from "./components/organisms/ContactFormSection";
import { FAQSection } from "./components/organisms/FAQSection";
import { PricingCallToAction } from "./components/organisms/PricingCallToAction";
import { Section8 } from "./components/organisms/Section8";

export default function Contact() {
  return (
    <div className="flex w-full flex-col items-center bg-white">
      <HeroSection
        tagText="Contact Us"
        title="Get in Touch"
        description="Have questions? We're here to help. Reach out to our team for support or inquiries."
        imageSrc="/images/landing/illustrations/ilustration of hero contact page.svg"
      />
      <ContactFormSection />
      <FAQSection />
      <PricingCallToAction />
      <Section8 />
    </div>
  );
}
