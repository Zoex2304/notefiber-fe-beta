import { FooterIntro } from "./FooterIntro";
import { FooterLinkGroup } from "@/components/shadui/FooterLinkGroup";
import { InputSecFooter } from "../molecules/InputSecFooter";

// --- Data Link (Dinamis) ---
const usefulLinks = {
  title: "Useful Link",
  links: [
    { name: "Home", href: "/landing" },
    { name: "Features", href: "/landing?page=features" },
    { name: "Pricing", href: "/landing?page=pricing" },
    { name: "About", href: "/landing?page=about" },
  ],
};

const followLinks = {
  title: "Follow Us",
  links: [
    { name: "Facebook", href: "#" },
    { name: "Instagram", href: "#" },
    { name: "X (Twitter)", href: "#" },
  ],
};
// ----------------------------

/**
 * Ini adalah "Konten Murni" untuk Section 8 (Footer).
 *
 * Merakit 4 panel di dalam layout 'WrapperFooter'.
 * Layout ini 'flex-col' di mobile dan 'flex-row' di desktop.
 */
export function MainContentSection8() {
  return (
    // Menggunakan React Fragment karena ini adalah konten murni
    <>
      {/* Container 'WrapperFooter' */}
      {/* (Specs: justify-between, items-start) */}
      <div
        className="
          flex w-full flex-col items-start justify-between 
          gap-10 
          lg:flex-row 
          lg:max-w-[1477.799px]
        "
      >
        {/* 1. Footer Intro (Panel Kiri) */}
        <FooterIntro />

        {/* 2. Instance Link 1 (Reusable) */}
        <FooterLinkGroup title={usefulLinks.title} links={usefulLinks.links} />

        {/* 3. Instance Link 2 (Reusable) */}
        <FooterLinkGroup title={followLinks.title} links={followLinks.links} />

        {/* 4. InputSecFooter (Panel Kanan) */}
        <InputSecFooter />
      </div>
    </>
  );
}
