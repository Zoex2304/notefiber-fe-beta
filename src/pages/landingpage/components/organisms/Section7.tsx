// 1. Import komponen reusable
import { SectionContainer } from '@/components/shadui/SectionContainer';
// 2. Import komponen konten murni yang baru
import { MainContentSection7 } from './MainContentSection7';

/**
 * Section 7 (Frame 7)
 *
 * DIPERBARUI: Sekarang mengikuti pola arsitektur baru.
 */
export function Section7() {
  return (
    // 3. Memanggil SectionContainer
    // (Section 7 menggunakan style panel default)
    <SectionContainer>
      {/* 4. Meneruskan konten murni sebagai children */}
      <MainContentSection7 />
    </SectionContainer>
  );
}

