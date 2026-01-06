import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Tag } from "./Tag";

// Varian untuk wrapper (div)
const wrapperVariants = cva(
  "flex w-full flex-col", // Style dasar: flex, col
  {
    variants: {
      align: {
        left: "items-start",
        center: "items-center",
      },
      gap: {
        default: "gap-4", // Default gap (16px)
        custom: "gap-[15px]", // Gap kustom Anda
      },
    },
    defaultVariants: {
      align: "left",
      gap: "default",
    },
  }
);

// Varian untuk teks header (h2)
const headerTextVariants = cva(
  "font-normal text-customFont-dark-base text-display-h3 lg:text-display-h2 leading-[1.2] lg:leading-[1.3] w-full",
  {
    variants: {
      align: {
        left: "text-left",
        center: "text-center",
      },
    },
    defaultVariants: {
      align: "left",
    },
  }
);

// Definisikan Props
export interface SectionHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof wrapperVariants> {
  tagText?: string;
  headerText: string;
  highlightLastWord?: boolean;
  align?: "left" | "center";
  description?: string;
  wrapAt?: number; // ✅ Prop baru untuk kontrol wrapping
}

/**
 * Komponen Reusable Header (H2)
 *
 * DIPERBARUI: Menambahkan prop 'wrapAt' untuk kontrol dinamis kata per baris
 */
const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    {
      className,
      align,
      gap,
      tagText,
      headerText,
      highlightLastWord,
      description,
      wrapAt = 4, // ✅ Default 4 kata per baris
      ...props
    },
    ref
  ) => {
    // Logic "Pintar"
    const renderContent = () => {
      if (!headerText) return null; // Guard clause

      const words = headerText.split(" ");
      const maxWordsPerLine = wrapAt; // ✅ Menggunakan prop wrapAt
      const lines: string[][] = [];

      for (let i = 0; i < words.length; i += maxWordsPerLine) {
        lines.push(words.slice(i, i + maxWordsPerLine));
      }

      if (!highlightLastWord) {
        return lines.map((line, idx) => (
          <React.Fragment key={idx}>
            {line.join(" ")}
            {idx < lines.length - 1 && <br />}
          </React.Fragment>
        ));
      }

      // Logic highlight kata terakhir
      return lines.map((line, idx) => {
        const isLastLine = idx === lines.length - 1;
        if (isLastLine && line.length > 0) {
          const lastWord = line.pop();
          const restOfLine = line.join(" ");
          return (
            <React.Fragment key={idx}>
              {restOfLine}
              {restOfLine && " "}
              <span className="text-royal-violet-base">{lastWord}</span>
            </React.Fragment>
          );
        }
        return (
          <React.Fragment key={idx}>
            {line.join(" ")}
            {idx < lines.length - 1 && <br />}
          </React.Fragment>
        );
      });
    };

    return (
      // Wrapper 'div' baru (menggunakan wrapperVariants)
      <div
        className={cn(wrapperVariants({ align, gap, className }))}
        ref={ref}
        {...props}
      >
        {/* Grup (Tag + Header) */}
        <div className={cn("flex flex-col gap-4", wrapperVariants({ align }))}>
          {tagText && (
            <Tag iconSrc="/src/assets/images/landing/logo/logo_symbol.svg">
              {tagText}
            </Tag>
          )}
          <h2 className={cn(headerTextVariants({ align }))}>
            {renderContent()}
          </h2>
        </div>

        {/* Deskripsi Opsional */}
        {description && (
          <p
            className={cn(
              "font-normal text-customFont-base",
              "text-[18.6px] leading-[1.4]",
              "lg:max-w-[572.724px]",
              align === "center" ? "text-center" : "text-left"
            )}
          >
            {description}
          </p>
        )}
      </div>
    );
  }
);
SectionHeader.displayName = "SectionHeader";

export { SectionHeader };