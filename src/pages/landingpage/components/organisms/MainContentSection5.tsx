import { SectionHeader } from "@/components/shadui/SectionHeader";
import { PricingDisplay } from "./PricingDisplay";

/**
 * Section 5 pricing component for landing page
 *
 * Uses the reusable PricingDisplay organism
 */
export function MainContentSection5() {
  return (
    <>
      {/* Container - Standardized Layout */}
      <div className="flex w-full flex-col items-center px-4 sm:px-6 lg:px-8 py-12 lg:py-16 gap-10 lg:gap-12">
        {/* Header (Centered) */}
        <SectionHeader
          align="center"
          tagText="Pricing"
          headerText="Experience simple and fully transparent pricing"
          highlightLastWord={true}
        />

        {/* Pricing Display - Reusable Organism */}
        <PricingDisplay showSwitcher={true} />
      </div>
    </>
  );
}