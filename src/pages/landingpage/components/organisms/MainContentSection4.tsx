// 1. Import komponen yang kita perlukan
import { SectionHeader } from "@/components/shadui/SectionHeader";
import { Button } from "@/components/shadui/button"; // Import Button

/**
 * Ini adalah "Konten Murni" untuk Section 4.
 * (Sesuai dengan 'WrapperMainContent4' di diagram Anda)
 *
 * DIPERBARUI:
 * 1. Menambahkan Tombol "Free trial".
 * 2. Mengganti teks header.
 * 3. Mengganti panel gambar bulat dengan <img> SVG sederhana.
 * 4. Menambahkan margin negatif pada <img> agar "superbig" dan overflow.
 */
export function MainContentSection4() {
  return (
    // Menggunakan React Fragment karena ini adalah konten murni
    <>
      {/* Container 'WrapperMainContent4' */}
      {/* Lebar 'lg:w-[1107.801px]' ini yang akan membuat header wrap */}
      <div
        className="
          flex w-full flex-col items-center
          gap-16 lg:w-[1107.801px] lg:gap-12 
        "
      >
        {/* 1. Instance Header (Varian Tengah) */}
        <SectionHeader
          align="center"
          tagText="Our workflow" // (Anda tidak menyebutkan tag, jadi saya biarkan)
          headerText="Ready to transform your productivity management?"
          highlightLastWord={true}
        />

        {/* 2. Tombol "Free trial" (Baru) */}
        <Button variant="default" size="default" className="relative z-10">
          Free trial
        </Button>

        {/* 3. Panel Gambar (Sekarang <img> sederhana) */}
        {/* Optical centering: gambar mesh tidak simetris, perlu slight offset untuk visual balance */}
        <div className="flex w-full justify-center -mt-12 lg:-mt-24">
          <img
            src="/images/landing/illustrations/circle hell.svg"
            alt="Productivity Workflow Illustration"
            className="
              w-full max-w-5xl
              -translate-x-[2%] sm:-translate-x-[1.5%] lg:-translate-x-[2%]
            "
          />
        </div>
      </div>
    </>
  );
}
