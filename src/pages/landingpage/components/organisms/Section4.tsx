// 1. Import komponen reusable
import { SectionContainer } from '@/components/shadui/SectionContainer';
// 2. Import komponen konten murni yang baru
import { MainContentSection4 } from './MainContentSection4';

/**
 * Section 4 (Frame 4)
 *
 * DIPERBARUI: Sekarang mengikuti pola arsitektur baru.
 * Meneruskan 'panelClassName' kustom untuk background.
 */
export function Section4() {
  return (
    // 3. Memanggil SectionContainer
    <SectionContainer
      // 4. Meneruskan style panel kustom dari Figma
      panelClassName="bg-[#F5F6F9]"
    >
      {/* 5. Meneruskan konten murni sebagai children */}
      <MainContentSection4 />
    </SectionContainer>
  );
}

