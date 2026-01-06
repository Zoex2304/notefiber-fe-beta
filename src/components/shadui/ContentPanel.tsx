import * as React from "react";
import { cn } from "@/lib/utils"; // Menggunakan cn untuk class management

// Definisikan props, mengambil pola dari SectionContainer/Emblem
interface ContentPanelProps {
  /**
   * Konten dinamis yang akan di-wrap oleh panel ini.
   */
  children: React.ReactNode;
  /**
   * ClassName tambahan untuk kustomisasi.
   */
  className?: string;
  /**
   * Properti style inline jika diperlukan.
   */
  style?: React.CSSProperties;
}

/**
 * Komponen ContentPanel reusable.
 * Didesain untuk berada di dalam SectionContainer sebagai wrapper konten utama.
 * Memiliki border, padding, dan rounding responsif.
 * Tingginya otomatis (h-auto) menyesuaikan konten.
 */
export function ContentPanel({
  children,
  className,
  style,
}: ContentPanelProps) {
  return (
    <div
      className={cn(
        // Layout
        "relative flex w-full flex-col items-center",
        // Width
        "lg:w-[1410.397px]",
        // Spacing (Gap)
        "gap-3 lg:gap-[12.268px]",
        // Rounding (Responsive)
        "rounded-lg sm:rounded-[39.258px]",
        // Border
        "border-[1.227px] border-customBorder-primary",
        // Padding (Responsive)
        "px-4 py-6 lg:px-0 lg:py-[36.804px]",
        // Height (Sesuai permintaan)
        "h-auto",
        // Tambahan className dari props
        className,
      )}
      style={style} // Menambahkan style prop jika ada (misal: backgroundImage)
    >
      {children}
    </div>
  );
}
