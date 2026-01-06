import { useCountUp } from '@/hooks/useCountUp';

import { cn } from "@/lib/utils";

interface KPICardProps {
  /**
   * Angka akhir (sebelum +). Cth: 2
   */
  endValue: number;
  /**
   * Teks di belakang angka. Cth: "K+"
   */
  suffix: string;
  /**
   * Teks deskripsi di bawah angka.
   */
  description: string;
  /**
   * Jumlah desimal (opsional). Default: 0
   */
  decimals?: number;
  className?: string;
}

/**
 * Komponen Reusable "KPI Card" dengan animasi counter.
 */
export function KPICard({ endValue, suffix, description, decimals = 0, className }: KPICardProps) {
  // Gunakan hook counter
  const { count, ref } = useCountUp(endValue, 2000, 300, decimals);

  return (
    <div className={cn("flex flex-col items-start", className)}>
      {/* Teks Angka (Specs: 47.829px) */}
      <div
        className="
          font-normal text-customFont-dark-base
          text-display-h3 
          lg:text-[47.829px] lg:leading-[1.4]
        "
        // 'ref' ini akan memicu animasi saat terlihat
        ref={ref as React.Ref<HTMLDivElement>}
      >
        {count}
        {suffix}
      </div>

      {/* Teks Deskripsi (Specs: 15.943px) */}
      <p
        className="
          font-normal text-customFont-base
          text-body-base
        "
      >
        {description}
      </p>
    </div>
  );
}

