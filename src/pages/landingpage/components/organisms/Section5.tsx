// 1. Import komponen reusable
import { SectionContainer } from '@/components/shadui/SectionContainer';
// 2. Import komponen konten murni yang baru
import { MainContentSection5 } from './MainContentSection5';

/**
 * Section 5 (Frame 5)
 *
 * DIPERBARUI: Sekarang mengikuti pola arsitektur baru.
 */
export function Section5() {
  return (
    // 3. Memanggil SectionContainer
    // (Section 5 menggunakan style panel default)
    <SectionContainer>
      {/* 4. Meneruskan konten murni sebagai children */}
      <MainContentSection5 />
    </SectionContainer>
  );
}

