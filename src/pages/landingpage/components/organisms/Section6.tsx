// 1. Import komponen reusable
import { SectionContainer } from '@/components/shadui/SectionContainer';
// 2. Import komponen konten murni yang baru
import { MainContentSection6 } from './MainContentSection6';

/**
 * Section 6 (Frame 6)
 *
 * Menggunakan pola arsitektur baru.
 */
export function Section6() {
  return (
    // 3. Memanggil SectionContainer
    // (Section 6 menggunakan style panel default)
    <SectionContainer>
      {/* 4. Meneruskan konten murni sebagai children */}
      <MainContentSection6 />
    </SectionContainer>
  );
}

