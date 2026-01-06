// src/pages/landingpage/components/organisms/MainContentHeroSection.tsx
import { MainContentHeroSectionNavbar } from "./MainContentHeroSectionNavbar";
import { BodyContentHeroSection } from "./BodyContentHeroSection";
import type { ReactNode } from "react";

interface MainContentHeroSectionProps {
  tagText?: string;
  title?: string;
  description?: string;
  imageSrc?: string;
  customHeroContent?: ReactNode;
}

/**
 * Kontainer *konten* untuk Hero Section (Frame 1)
 * Wrapper div (panel) telah dipindahkan ke SectionContainer/ContentPanel.
 */
export function MainContentHeroSection({
  tagText,
  title,
  description,
  imageSrc = "/src/assets/images/landing/illustrations/interface.svg",
  customHeroContent,
}: MainContentHeroSectionProps) {
  return (
    // Menggunakan React Fragment karena tidak perlu div wrapper lagi
    <>
      {/* Navbar - Sudah selesai */}
      <MainContentHeroSectionNavbar />

      {/* Body Content - Sudah selesai */}
      <BodyContentHeroSection
        tagText={tagText}
        title={title}
        description={description}
      />

      {/* Render Custom Content jika ada, jika tidak render Gambar Default */}
      {customHeroContent ? (
        customHeroContent
      ) : (
        <img
          src={imageSrc}
          alt="Interface Illustration"
          className="w-full max-w-6xl rounded-lg" // Diberi max-width agar responsif
        />
      )}
    </>
  );
}

