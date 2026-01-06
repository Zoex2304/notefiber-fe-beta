// src/pages/landingpage/components/organisms/Section2Head.tsx
import { BridgingHeader } from "@/components/shadui/BridgingHeader";
import { TrustedCompanies } from "./TrustedCompanies";

/**
 * Konten untuk bagian atas Section 2.
 * Berisi 'company-sec' dan 'BridgingHeader'.
 */
export function Section2Head() {
  return (
    <div className="flex w-full flex-col items-center gap-10 lg:gap-[100px]">
      {/* 1. company-sec */}
      <TrustedCompanies />

      {/* 3. Bridging-header-section2 (Komponen Reusable) */}
      <BridgingHeader
        tagText="Our workflow"
        headerText="How our platform makes your workflow easier"
      />
    </div>
  );
}
