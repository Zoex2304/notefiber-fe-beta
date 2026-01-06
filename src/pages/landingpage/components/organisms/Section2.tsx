// 1. Import komponen reusable
import { SectionContainer } from '@/components/shadui/SectionContainer';
// 2. Import komponen konten murni yang baru
import { MainContentSection2 } from './MainContentSection2';

/**
 * Section 2 (Frame 2)
 *
 * DIPERBARUI: Sekarang mengikuti pola arsitektur baru.
 * Memanggil SectionContainer dan meneruskan MainContentSection2 sebagai children.
 */
export function Section2() {
  return (
    // 3. Memanggil SectionContainer
    <SectionContainer>
      {/* 4. Meneruskan konten murni sebagai children */}
      <MainContentSection2 />
    </SectionContainer>
  );
}

