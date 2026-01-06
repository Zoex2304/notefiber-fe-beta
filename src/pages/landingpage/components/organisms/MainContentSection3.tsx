// src/pages/landingpage/components/organisms/MainContentSection3.tsx
import { LeftPanelContent3 } from "../molecules/LeftPanelContent3";
import { ImagePanelContent3 } from "../molecules/ImagePanelContent3";

/**
 * Ini adalah "Konten Murni" untuk Section 3.
 *
 * (File ini sudah benar secara arsitektur)
 * - 'flex-col' di mobile: Menempatkan LeftPanel (Info) di atas.
 * - 'lg:flex-row' di desktop: Menempatkan berdampingan.
 */
export function MainContentSection3() {
  return (
    // Menggunakan React Fragment karena ini adalah konten murni
    <>
      {/* Container 'WrapperMainContent3' */}
      <div
        className="
         p-6 lg:p-[100px]
          flex w-full 
          flex-col lg:flex-row 
          items-center lg:items-stretch 
          gap-12 lg:gap-[50px]
          pl-0 
        "
      >
        {/* 1. Panel Kiri (Akan muncul pertama di mobile) */}
        <LeftPanelContent3 />

        {/* 2. Panel Kanan (Akan muncul kedua di mobile) */}
        <ImagePanelContent3 />
      </div>
    </>
  );
}
