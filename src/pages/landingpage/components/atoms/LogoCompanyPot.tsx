// src/pages/landingpage/components/atoms/LogoCompanyPot.tsx
interface LogoCompanyPotProps {
  iconSrc: string;
  companyName: string;
}

/**
 * Komponen Atom "Pot" Logo
 * FIXED: Menambahkan flex-shrink-0 untuk mencegah compression
 */
export function LogoCompanyPot({ iconSrc, companyName }: LogoCompanyPotProps) {
  return (
    <div
      className="
        flex flex-shrink-0 items-center 
        gap-1 lg:gap-[5.686px]
      "
    >
      {/* Logo */}
      <img
        src={iconSrc}
        alt={companyName}
        className="
          h-8 w-8 flex-shrink-0
          lg:h-[34.117px] lg:w-[34.117px]
        "
      />
      {/* Teks Company */}
      <span
        className="
          whitespace-nowrap font-semibold text-customFont-dark-base 
          text-display-h5 
          lg:text-[28.431px]
        "
      >
        {companyName}
      </span>
    </div>
  );
}