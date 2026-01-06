// 1. Import komponen Emblem
import { Emblem } from "@/components/shadui/Emblem";

/**
 * Komponen TextAreaIntro
 *
 * DIPERBAIKI (Hierarki Font Final V2):
 * 1. Teks "with" diubah ke 'font-semibold'.
 */
export function TextAreaIntro() {
  return (
    // Container Utama
    <div
      className="
        flex w-full items-start  
        lg:w-[1031.739px] lg:justify-between 
        h-auto 
        px-4 lg:px-[67.474px]
      "
    >
      {/* 2. Props Kiri */}
      <img
        src="/src/assets/images/landing/illustrations/props_left.svg"
        alt="Decorative Prop"
        className="hidden lg:block flex-shrink-0 h-[53.979px] w-[107.958px]"
      />

      {/* 3. Konten Tengah (Downside) (Layout mobile: flex-row) */}
      <div
        className="
        flex flex-row 
        items-center 
        gap-2 lg:gap-4
      "
      >
        {/* Teks "with" (Weight mobile: font-semibold) */}
        <span
          className="
          text-customFont-dark-base 
          text-display-h3
          lg:text-[74.835px] 
          leading-[1.2] lg:leading-[1.4]
        "
        >
          with
        </span>

        {/* Emblem "NoteFiber" */}
        <Emblem>NoteFiber</Emblem>
      </div>

      {/* 4. Props Kanan */}
      <img
        src="/src/assets/images/landing/illustrations/props_right.svg"
        alt="Decorative Prop"
        className="hidden lg:block flex-shrink-0 h-[53.979px] w-[107.958px]"
      />
    </div>
  );
}
