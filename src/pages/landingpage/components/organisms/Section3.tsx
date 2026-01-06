// 1. Import komponen reusable
import { SectionContainer } from '@/components/shadui/SectionContainer';
// 2. Import komponen konten murni yang baru
import { MainContentSection3 } from './MainContentSection3';

/**
 * Section 3 (Frame 3)
 *
 * DIPERBARUI: Sekarang mengikuti pola arsitektur baru.
 * Memanggil SectionContainer dan meneruskan MainContentSection3 sebagai children.
 */
export function Section3() {
  return (
    // 3. Memanggil SectionContainer
    // Kita tidak perlu meneruskan style panel apa pun
    // karena Section 3 menggunakan style default dari SectionContainer.
    <SectionContainer>
      {/* 4. Meneruskan konten murni sebagai children */}
      <MainContentSection3 />
    </SectionContainer>
  );
}

