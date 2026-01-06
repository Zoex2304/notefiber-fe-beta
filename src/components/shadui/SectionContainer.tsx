import * as React from "react";
// Impor ContentPanel agar bisa digunakan di dalam
import { ContentPanel } from "./ContentPanel";

// Definisikan props baru
interface SectionContainerProps {
  /**
   * Konten dinamis yang akan di-wrap oleh section ini.
   */
  children: React.ReactNode;
  /**
   * ClassName tambahan untuk container luar.
   */
  className?: string;
  /**
   * ClassName tambahan untuk ContentPanel di dalam.
   */
  panelClassName?: string;
  /**
   * Properti style inline untuk ContentPanel di dalam (misal: background).
   */
  panelStyle?: React.CSSProperties;
}

/**
 * Komponen container reusable untuk sebuah section halaman.
 * Berisi layout padding luar dan secara otomatis membungkus children
 * di dalam ContentPanel.
 */
export function SectionContainer({
  children,
  className,
  panelClassName,
  panelStyle,
}: SectionContainerProps) {
  // Ini adalah style untuk div luar (wrapper halaman)
  const combinedClassName = `
    relative flex w-full flex-col items-center 
    gap-3 py-4 
    lg:max-w-[1766.593px] lg:gap-[12.268px] lg:py-[31.897px]
    ${className || ""}
  `;

  return (
    <div className={combinedClassName.trim().replace(/\s+/g, " ")}>
      {/* ContentPanel sekarang dirender di dalam, */}
      {/* menerima panelStyle dan panelClassName dari props */}
      <ContentPanel className={panelClassName} style={panelStyle}>
        {children}
      </ContentPanel>
    </div>
  );
}

