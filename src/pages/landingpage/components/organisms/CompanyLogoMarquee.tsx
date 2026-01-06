import { CompanyLogoRow } from '../molecules/CompanyLogoRow';

/**
 * Komponen Molekul "Marquee"
 * FIXED: Menambahkan flex-shrink-0 dan width explicit untuk mencegah overlap
 */
export function CompanyLogoMarquee() {
  return (
    <div
      className="
        relative w-full 
        max-w-full lg:max-w-[1202.265px] 
        overflow-hidden
      "
      style={{
        maskImage:
          'linear-gradient(to right, transparent, white 20%, white 80%, transparent)',
      }}
    >
      {/* Container Animasi - FIXED: Added flex-shrink-0 */}
      <div
        className="
          flex flex-nowrap flex-shrink-0
          gap-8 lg:gap-16 
          animate-scroll
        "
      >
        {/* Kereta 1 */}
        <CompanyLogoRow />
        {/* Kereta 2 */}
        <CompanyLogoRow />
      </div>
    </div>
  );
}