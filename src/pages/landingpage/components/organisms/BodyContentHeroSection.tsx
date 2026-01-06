// src/pages/landingpage/components/organisms/BodyContentHeroSection.tsx
import { BodyContentHeroSectionWrapper } from "../molecules/BodyContentHeroSectionWrapper";

interface BodyContentHeroSectionProps {
  tagText?: string;
  title?: string;
  description?: string;
}

/**
 * Body Content Hero Section (Container)
 * Height: hug content
 * Padding top dan bottom custom dengan px
 */
export function BodyContentHeroSection({
  tagText,
  title,
  description,
}: BodyContentHeroSectionProps) {
  return (
    <div className="flex flex-shrink-0 flex-col items-center justify-center gap-3 lg:gap-[12.268px] w-full px-4 lg:w-[1197.357px] h-auto lg:px-0 pt-[48px] lg:pt-[64px] pb-[16px] lg:pb-[24px]">
      {/* Memanggil wrapper berikutnya */}
      <BodyContentHeroSectionWrapper
        tagText={tagText}
        title={title}
        description={description}
      />
    </div>
  );
}
