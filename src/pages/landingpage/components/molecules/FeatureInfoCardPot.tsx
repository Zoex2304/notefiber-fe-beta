import { PotIcon } from "@/components/shadui/PotIcon";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface FeatureInfoCardPotProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Helper function: Wrap text setelah N characters (termasuk spasi)
 */
function wrapAfterChars(text: string, charsPerLine: number): React.ReactNode {
  const lines: string[] = [];
  let currentLine = "";
  const words = text.split(" ");

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (testLine.length <= charsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines.map((line, index) => (
    <span key={index}>
      {line}
      {index < lines.length - 1 && <br />}
    </span>
  ));
}

/**
 * Komponen Reusable "Feature Info Card Pot"
 *
 * LAYOUT RESPONSIVE:
 * - Mobile/Tablet (< 1024px): ROW layout (icon di kiri, teks di kanan) - Natural wrap
 * - Desktop (≥ 1024px): COLUMN layout (icon di atas, teks di bawah) - 34 chars wrap
 */
export function FeatureInfoCardPot({
  icon,
  title,
  description,
}: FeatureInfoCardPotProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const updateLayout = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  return (
    <div
      className="
        flex items-start
        gap-3 lg:gap-[13.495px]
        flex-row lg:flex-col
      "
    >
      {/* 1. Pot Icon */}
      <PotIcon icon={icon} size="small" />

      {/* 2. Container untuk Title & Description */}
      <div className="flex flex-col gap-2 lg:gap-3 flex-1 min-w-0">
        {/* Teks Judul */}
        <h3
          className="
            font-normal text-customFont-dark-base
            text-body-base 
            lg:text-body-1 
          "
        >
          {title}
        </h3>

        {/* Teks Deskripsi */}
        <p
          className="
            font-normal text-customFont-base
            text-body-base
          "
        >
          {isDesktop ? wrapAfterChars(description, 34) : description}
        </p>
      </div>
    </div>
  );
}
