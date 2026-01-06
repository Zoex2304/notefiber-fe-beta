// src/pages/landingpage/components/molecules/BodyContentHeroSectionWrapper.tsx
// 1. Import komponen baru
import { BodyContentHeroSectionWrapperBodyTop } from './BodyContentHeroSectionWrapperBodyTop';

interface BodyContentHeroSectionWrapperProps {
  tagText?: string;
  title?: string;
  description?: string;
}

/**
 * Wrapper untuk Body Content
 * Memanggil 'Body-content-hero-section-wrapper-body-top'
 *
 * (flex-col sudah ada di sini sesuai permintaan Anda)
 */
export function BodyContentHeroSectionWrapper({
  tagText,
  title,
  description,
}: BodyContentHeroSectionWrapperProps) {
  return (
    <div className="flex w-full flex-col items-center">
      {/* 2. Placeholder diganti dengan komponen baru */}
      <BodyContentHeroSectionWrapperBodyTop
        tagText={tagText}
        title={title}
        description={description}
      />
    </div>
  );
}

