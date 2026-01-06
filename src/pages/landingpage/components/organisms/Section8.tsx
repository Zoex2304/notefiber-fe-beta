import { SectionContainer } from "@/components/shadui/SectionContainer";
import { MainContentSection8 } from "./MainContentSection8";

/**
 * Ini adalah "Wrapper Spesifik" untuk Section 8 (Footer).
 *
 * Menerapkan pola <SectionContainer> dan meneruskan
 * <MainContentSection8> sebagai children.
 */
export function Section8() {
  return (
    <SectionContainer
      // Beri padding kustom agar lebih besar dari default
      panelClassName="lg:p-24 bg-cool-grey-2"
    >
      <MainContentSection8 />
    </SectionContainer>
  );
}
