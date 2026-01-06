import { Tag } from '@/components/shadui/Tag';
import * as React from 'react'; // Import React

interface BridgingHeaderProps {
  /**
   * Teks yang akan ditampilkan di dalam Tag.
   * Cth: "Our workflow"
   */
  tagText: string;
  /**
   * DIPERBARUI: Diubah dari 'string' ke 'React.ReactNode'
   * agar kita bisa meneruskan JSX (seperti <span> berwarna).
   */
  headerText: React.ReactNode;
}

/**
 * Komponen Reusable untuk header section.
 * Terdiri dari Tag kecil dan Header h2.
 */
export function BridgingHeader({ tagText, headerText }: BridgingHeaderProps) {
  return (
    // Container untuk reusable header
    <div className="flex w-full flex-col items-center gap-3 lg:gap-4">
      {/* Tag (reusable) */}
      <Tag iconSrc="/images/landing/logo/logo_symbol.svg">
        {tagText}
      </Tag>

      {/* Header Utama (responsif) */}
      <h2
        className="
          text-center text-customFont-dark-base 
          font-semibold
          text-display-h3
          lg:text-display-h2
          leading-[1.2] lg:leading-[1.3]
          max-w-xl
        "
      >
        {/* Sekarang bisa merender JSX, bukan hanya string */}
        {headerText}
      </h2>
    </div>
  );
}

