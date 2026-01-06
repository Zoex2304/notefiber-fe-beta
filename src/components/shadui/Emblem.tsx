import * as React from "react";

// Definisikan props untuk komponen Emblem
interface EmblemProps {
  /**
   * Konten teks yang akan ditampilkan.
   */
  children: React.ReactNode;
  /**
   * ClassName tambahan untuk kustomisasi.
   */
  className?: string;
}

/**
 * Komponen Emblem Reusable
 *
 * DIPERBAIKI (Hierarki Font):
 * 1. Ukuran font "NoteFiber" dinaikkan ke text-display-h4 (31px) untuk mobile.
 * 2. Padding mobile disesuaikan (py-2 px-4) agar muat.
 */
export function Emblem({ children, className }: EmblemProps) {
  return (
    // Container Emblem
    <div
      className={`
        flex items-center justify-center 
        rounded-[15.948px] 
        border-[1.227px] border-customBorder-violet 
        bg-gradient-primary-violet 
        shadow-[inset_0_0_0_1.84px_rgba(255,255,255,0.26)]
        py-2 px-4
        lg:py-[9.814px] lg:px-[26.99px] 
        gap-2 lg:gap-[12.268px] 
        ${className || ""}
      `}
    >
      {/* Teks di dalam Emblem (Ukuran font mobile: text-display-h4 / 31px) */}
      <span
        className="
          text-white 
          font-normal
          text-display-h4
          lg:text-[74.835px] 
          leading-[1.2] lg:leading-[1.4]
        "
      >
        {children}
      </span>
    </div>
  );
}
