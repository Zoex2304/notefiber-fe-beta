// src/pages/landingpage/components/atoms/MainContentHeroSectionNavbarLogo.tsx
import Logo from '@/assets/images/landing/logo/logo-horizontal.svg';

/**
 * Komponen Logo Navbar
 * - Menggunakan file SVG dari assets
 * - Link ke homepage ('/')
 * - Memiliki hover effect (opacity)
 * - Ukuran responsif (h-8 di mobile, lg:h-10 di desktop)
 */
export function MainContentHeroSectionNavbarLogo() {
  return (
    <a
      href="/"
      className="transition-opacity hover:opacity-80"
      aria-label="Homepage"
    >
      <img
        src={Logo}
        alt="Notefiber Logo"
        className="h-8 w-auto lg:h-10" // Tinggi responsif
      />
    </a>
  );
}
