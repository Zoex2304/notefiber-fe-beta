// src/pages/landingpage/components/organisms/MainContentSection2.tsx
import { Section2Head } from "./Section2Head";
// 1. Import komponen Footer yang baru
import { Section2Footer } from "./Section2Footer";

/**
 * Ini adalah "Konten Murni" untuk Section 2.
 * (Sesuai dengan 'WrapperSection2' di diagram Anda)
 *
 * Specs: flex, w-full, flex-col, items-center, gap-[130.041px]
 * Dibuat responsif.
 */
export function MainContentSection2() {
  return (
    // Menggunakan React Fragment karena ini adalah konten murni
    <>
      {/* Container 'flex-col items-center' ini 
        adalah layout untuk 'WrapperSection2' Anda 
      */}
      <div
        className="
          flex w-full flex-col items-center 
          gap-16 lg:gap-[130.041px]
        "
      >
        {/* Memanggil 'Section2head' */}
        <Section2Head />

        {/* 2. Placeholder diganti dengan 'Section2Footer' */}
        <Section2Footer />
      </div>
    </>
  );
}
