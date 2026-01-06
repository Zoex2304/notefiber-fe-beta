import { SectionHeader } from "@/components/shadui/SectionHeader";
import { KPICard } from "@/components/shadui/KPICard";
import { TestimonialMarquee } from "@/components/shadui/TestimonialMarquee";

/**
 * Ini adalah "Konten Murni" untuk Section 6.
 *
 * DIPERBARUI:
 * 1. Panel kiri (Frame 1) diberi layout w-[572.724px],
 * h-[511.404px], dan justify-between.
 */
export function MainContentSection6() {
  const description =
    "Choose a plan that fits your business needs and budget. No hidden fees, no surprises—just straightforward pricing for powerful financial management.";

  return (
    // Menggunakan React Fragment karena ini adalah konten murni
    <>
      {/* Container 'WrapperMainContent6' */}
      <div
        className="
          p-6 lg:p-[100px]
          flex w-full 
          flex-col lg:flex-row 
          items-center
          gap-12 lg:gap-[84.621px]
        "
      >
        {/* === Frame 1 (Kiri) === */}
        {/* --- PERBAIKAN LAYOUT --- */}
        <div
          className="
            flex w-full flex-col items-start 
            gap-8 
            lg:w-[572.724px] lg:h-[511.404px] 
            lg:justify-between
          "
        >
          {/* 1. Header (dengan description) */}
          <SectionHeader
            align="left"
            tagText="Our Testimonial"
            headerText="What our clients are saying"
            description={description}
            gap="custom" // Menggunakan gap 15px kustom
          />

          {/* 2. KPI Cards */}
          <div className="flex items-center gap-8 lg:gap-12">
            <KPICard endValue={2} suffix="K+" description="Trusted by users" />
            {/* Anda bisa tambahkan KPI Card kedua di sini jika perlu */}
          </div>
        </div>
        {/* --- AKHIR PERBAIKAN --- */}

        {/* === Frame 2 (Kanan) === */}
        <div className="flex w-full flex-col items-center lg:flex-1">
          <TestimonialMarquee heightClassName="h-[511.404px]" />
        </div>
      </div>
    </>
  );
}
