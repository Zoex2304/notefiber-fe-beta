import { PotIcon } from "./PotIcon";
import { Check } from "lucide-react";

interface PriceAdvantageItemProps {
  text: string;
}

/**
 * Reusable Price Advantage Item Component
 *
 * LOCATION: src/components/shadui/PriceAdvantageItem.tsx
 */
export function PriceAdvantageItem({ text }: PriceAdvantageItemProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Checkmark Icon */}
      <PotIcon icon={Check} size="xs" />

      {/* Feature Text */}
      <p className="font-normal text-[14px] leading-[20px] text-customFont-base">
        {text}
      </p>
    </div>
  );
}
