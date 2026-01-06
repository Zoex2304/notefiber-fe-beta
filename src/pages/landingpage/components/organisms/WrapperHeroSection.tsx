// src/pages/landingpage/components/organisms/WrapperHeroSection.tsx
import { SectionContainer } from "@/components/shadui/SectionContainer";
import type { ReactNode } from "react";

interface WrapperHeroSectionProps {
  children: ReactNode;
}

/**
 * Wrapper spesifik untuk Hero Section.
 * Menggunakan komponen SectionContainer reusable untuk layout.
 * Meneruskan 'panelStyle' untuk background image.
 */
export function WrapperHeroSection({ children }: WrapperHeroSectionProps) {
  return (
    <SectionContainer
      // Prop 'panelStyle' akan diteruskan ke ContentPanel di dalam
      panelStyle={{
        backgroundImage: `url('/images/landing/backgrounds/gradient-dots-sec1-landingpage.svg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* MainContentHeroSection sekarang hanya berisi konten murni */}
      {children}
    </SectionContainer>
  );
}
