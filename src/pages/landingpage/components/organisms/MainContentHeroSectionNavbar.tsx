import { MainContentHeroSectionNavbarNav } from '../molecules/MainContentHeroSectionNavbarNav';

/**
 * Main Content Hero Section - Navbar (Padded Container)
 *
 * Specs:
 * - flex, flex-col, items-start
 * - w-full (Mobile)
 * - lg:max-w-[1197.357px] (Desktop)
 * - px-0 py-0 bg-transparent (Mobile - styling dipindah ke child)
 * - lg:px-[39.258px] lg:py-[24.536px] lg:bg-white (Desktop padding & background)
 * - lg:rounded-[73.608px] (Desktop)
 * - border, border-customBorder-primary
 * - Properti 'gap' dihapus karena child-nya hanya 1
 *
 * FIXED: Menambahkan rounded-lg untuk mobile agar border sesuai dengan radius content.
 */
export function MainContentHeroSectionNavbar() {
  return (
    <nav
      className="flex w-full flex-col items-start rounded-lg border border-customBorder-primary bg-transparent px-0 py-0 lg:max-w-[1197.357px] lg:rounded-[73.608px] lg:border-[1.227px] lg:bg-white lg:px-[39.258px] lg:py-[24.536px]"
    >
      {/* Komponen Nav baru dipanggil di sini */}
      <MainContentHeroSectionNavbarNav />
    </nav>
  );
}
