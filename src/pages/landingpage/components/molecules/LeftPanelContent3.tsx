// src/pages/landingpage/components/molecules/LeftPanelContent3.tsx

// 1. Import SectionHeader (reusable baru)
import { SectionHeader } from "@/components/shadui/SectionHeader";
import { FeatureInfoCardPot } from "./FeatureInfoCardPot";
import { BarChart, DollarSign, PieChart, Settings2 } from "lucide-react";

/**
 * Panel Konten Kiri untuk Section 3
 *
 * DIPERBARUI: Menggunakan props 'text' dan 'highlightLastWord'
 * yang baru pada SectionHeader.
 */
export function LeftPanelContent3() {
  return (
    // Container
    <div
      className="
        flex w-full flex-col items-start
        gap-8 lg:w-auto lg:gap-[30.742px]
        lg:flex-shrink-0 
      "
    >
      {/* === Frame 18 === */}
      <div className="flex w-full flex-col items-start gap-4 lg:gap-[15.948px]">
        <SectionHeader
          align="left"
          tagText="Best Productivity Management"
          headerText="Boost your productivity with NoteFiber"
          highlightLastWord={true}
          wrapAt={3}
        />
      </div>

      {/* === Frame 19 === */}
      <div
        className="
          flex w-full flex-col items-start 
          gap-8 lg:flex-row lg:gap-[29.443px]
        "
      >
        {/* Frame 14 */}
        <div className="flex flex-col items-start gap-8 lg:gap-[33.124px]">
          <FeatureInfoCardPot
            icon={BarChart}
            title="Flexible Data Transfer"
            description="Easily import and export financial data to and from our platform."
          />
          <FeatureInfoCardPot
            icon={DollarSign}
            title="Dedicated Support"
            description="Our expert support team is available 24/7 to assist."
          />
        </div>

        {/* Frame 15 */}
        <div className="flex flex-col items-start gap-8 lg:gap-[33.124px]">
          <FeatureInfoCardPot
            icon={PieChart}
            title="Personalized Reports"
            description="Create and customize reports tailored to your specific needs."
          />
          <FeatureInfoCardPot
            icon={Settings2}
            title="Custom Reporting Tools"
            description="Create and customize reports tailored to your specific needs."
          />
        </div>
      </div>
    </div>
  );
}
