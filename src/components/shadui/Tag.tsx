import * as React from "react";
/* eslint-disable react-refresh/only-export-components */
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// 1. Definisikan varian untuk ukuran Tag
const tagVariants = cva(
  "flex items-center bg-white rounded-full border-[0.613px] border-customBorder-primary",
  {
    variants: {
      size: {
        // Size default (dari HeroSection)
        default:
          "py-1.5 px-3 gap-2 lg:py-[7.361px] lg:px-[14.722px] lg:gap-[8.588px]",
        // Size small (dari Blog Card)
        small:
          "py-1 px-2 gap-1.5 lg:py-[6.546px] lg:px-[13.093px] lg:gap-[7.637px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

// 2. Definisikan Props
export interface TagProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof tagVariants> {
  /**
   * Path ke file ikon/logo (SEKARANG OPSIONAL).
   */
  iconSrc?: string;
  /**
   * Konten teks yang akan ditampilkan.
   */
  children: React.ReactNode;
}

/**
 * Komponen Tag Reusable
 *
 * DIPERBARUI:
 * 1. 'iconSrc' sekarang opsional.
 * 2. Menambahkan 'size' variant (default, small).
 */
const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  ({ className, iconSrc, children, size, ...props }, ref) => {
    return (
      // Container Tag
      <div
        className={cn(tagVariants({ size, className }))}
        ref={ref}
        {...props}
      >
        {/* 3. Ikon Logo (Sekarang dirender secara kondisional) */}
        {iconSrc && (
          <img
            src={iconSrc}
            alt="Tag Icon"
            className="h-3 w-3 lg:h-5 lg:w-5" // Ukuran ikon dibuat responsif
          />
        )}

        {/* 4. Teks Tag */}
        <span
          className={cn(
            "font-normal bg-gradient-secondary bg-clip-text text-transparent",
            // Perbedaan font size berdasarkan variant 'size'
            size === "small"
              ? "text-body-5" // 10.5px (kecil)
              : "text-body-5 lg:text-body-base" // 10.5px -> 16px (default)
          )}
        >
          {children}
        </span>
      </div>
    );
  }
);
Tag.displayName = "Tag";

export { Tag, tagVariants };
