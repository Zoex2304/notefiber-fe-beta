import { Button } from "./button"; // Import Button

export type PricingPeriod = "monthly" | "yearly";

interface SwitchPricingProps {
  /**
   * State yang sedang aktif ('monthly' atau 'yearly')
   */
  activePeriod: PricingPeriod;
  /**
   * Fungsi callback untuk memberi tahu parent saat state berubah
   */
  onToggle: (period: PricingPeriod) => void;
}

/**
 * Komponen Reusable "Switch Pricing"
 *
 * Specs: flex, p-[5.516px], gap-[7.355px]
 */
export function SwitchPricing({ activePeriod, onToggle }: SwitchPricingProps) {
  return (
    // Container Switch
    <div
      className="
        flex justify-center 
        rounded-lg bg-gray-100 
        p-1 lg:p-[5.516px] 
        gap-1 lg:gap-[7.355px]
      "
    >
      {/* Tombol Monthly */}
      <Button
        variant={activePeriod === "monthly" ? "default" : "ghost"}
        size="toggle"
        onClick={() => onToggle("monthly")}
        className={activePeriod === "monthly" ? "" : "text-gray-400"}
      >
        Monthly
      </Button>

      {/* Tombol Yearly */}
      <Button
        variant={activePeriod === "yearly" ? "default" : "ghost"}
        size="toggle"
        onClick={() => onToggle("yearly")}
        className={activePeriod === "yearly" ? "" : "text-gray-400"}
      >
        Yearly
      </Button>
    </div>
  );
}
