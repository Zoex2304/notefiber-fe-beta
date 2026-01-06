// src/pages/landingpage/components/organisms/HeroSection.tsx
import { WrapperHeroSection } from './WrapperHeroSection';
import { MainContentHeroSection } from './MainContentHeroSection';
import type { ReactNode } from 'react';

interface HeroSectionProps {
  tagText?: string;
  title?: string;
  description?: string;
  imageSrc?: string;
  customHeroContent?: ReactNode;
}


export function HeroSection({
  tagText,
  title,
  description,
  imageSrc,
  customHeroContent,
}: HeroSectionProps) {
  return (
    <section
      className="flex w-full flex-col items-start gap-3 px-4 lg:max-w-[1766.593px] lg:gap-[12.268px] lg:px-0"
    >
      <WrapperHeroSection>
        <MainContentHeroSection
          tagText={tagText}
          title={title}
          description={description}
          imageSrc={imageSrc}
          customHeroContent={customHeroContent}
        />
      </WrapperHeroSection>
    </section>
  );
}

