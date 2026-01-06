import { PricingDisplay } from "./PricingDisplay";

/**
 * Pricing content component for landing page (/landing?page=pricing)
 *
 * Uses the reusable PricingDisplay organism
 */
export function PricingContent() {
  return (
    <div className="flex w-full flex-col items-center px-4 sm:px-6 lg:px-8 py-12 lg:py-16 gap-10 lg:gap-12">
      {/* Pricing Display - Landing Context */}
      <PricingDisplay showSwitcher={true} context="landing" />
    </div>
  );
}
