import { TestimonialColumn } from "@/pages/landingpage/components/molecules/TestimonialColumn";
import { cn } from "@/lib/utils";

interface TestimonialMarqueeProps {
  className?: string;
  /**
   * Ketinggian viewport marquee. Cth: "h-[511.404px]"
   */
  heightClassName: string;
}

/**
 * Komponen Molekul "Marquee Vertikal"
 *
 * DIPERBARUI: Menambahkan 'gap' ke container 'animate-scroll-y'
 * untuk mencegah 'kereta' 1 dan 2 bertabrakan.
 */
export function TestimonialMarquee({
  className,
  heightClassName,
}: TestimonialMarqueeProps) {
  return (
    // 1. Container Wrapper (Viewport)
    <div
      className={cn(
        "relative w-full overflow-hidden",
        heightClassName,
        className
      )}
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent, white 20%, white 80%, transparent)",
      }}
    >
      {/* 3. Container Animasi */}
      {/* --- PERBAIKAN BUG GAP --- */}
      {/* Ditambahkan 'gap-4 lg:gap-[19.622px]' agar loop seamless */}
      <div
        className="
          flex flex-col flex-nowrap 
          gap-4 lg:gap-[19.622px] 
          animate-scroll-y
        "
      >
        {/* 4. Trik Looping Seamless (di-render 2x) */}
        <TestimonialColumn />
        <TestimonialColumn />
      </div>
    </div>
  );
}
