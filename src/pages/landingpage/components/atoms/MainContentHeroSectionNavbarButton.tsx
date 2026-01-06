// src/pages/landingpage/components/atoms/MainContentHeroSectionNavbarButton.tsx
// Pastikan path ini benar: @/components/shadui/button
// Sesuai dengan setup shadcn kita sebelumnya
import { Button } from '@/components/shadui/button';

/**
 * Komponen Tombol Sign Up Navbar
 * - Menggunakan <Button> dari shadcn/ui
 * - Lebar responsif: w-full (mobile), lg:w-auto (desktop)
 * - Hover handle sudah otomatis dari shadcn
 */
export function MainContentHeroSectionNavbarButton() {
  return (
    <Button
      size="lg"
      className="w-full lg:w-auto" // Lebar responsif
    >
      Sign Up
    </Button>
  );
}
