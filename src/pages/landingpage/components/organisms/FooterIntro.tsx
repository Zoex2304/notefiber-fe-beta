import { Logo } from '@/components/shadui/Logo';

/**
 * Komponen Spesifik untuk "Footer Intro" (Panel Kiri)
 *
 * (Specs: flex-col, justify-between, 508.951px)
 */
export function FooterIntro() {
  const description =
    "Streamline your business's financial management with our intuitive, scalable SaaS platform. Designed for U.S. enterprises, our solutions simplify complex processes.";

  return (
    <div
      className="
        flex h-auto flex-col items-start justify-between 
        gap-8
        lg:h-[255.181px] lg:w-[508.951px] 
        lg:flex-shrink-0
      "
    >
      {/* Frame 1 (Logo + Deskripsi) */}
      <div className="flex flex-col items-start gap-4">
        {/* 1. Instance Logo */}
        <Logo variant="horizontal" size="lg" />

        {/* 2. Teks Deskripsi (Specs: 19.622px, max-w- untuk 7-word wrap) */}
        <p
          className="
            font-normal text-customFont-base 
            text-body-1 lg:text-[19.622px] 
            leading-[1.4] 
            max-w-md 
          "
        >
          {description}
        </p>
      </div>

      {/* Frame 2 ("Powered by...") (Specs: 19.622px) */}
      <p
        className="
          font-normal text-customFont-base 
          text-body-1 lg:text-[19.622px] 
          leading-[1.4]
        "
      >
        Powered by Notefiber corp
      </p>
    </div>
  );
}
