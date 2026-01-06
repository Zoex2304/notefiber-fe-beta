import { SectionHeader } from "@/components/shadui/SectionHeader";
import { BlogCarousel } from "@/components/shadui/BlogCarousel";
import { Button } from "@/components/shadui/button";

/**
 * Ini adalah "Konten Murni" untuk Section 7.
 * (File ini sudah benar, 'items-center' akan
 * memusatkan carousel kita yang baru)
 */
export function MainContentSection7() {
  const description =
    "Our provide valuable insights, and establish your brand as a thought leader in the financial space.";

  return (
    // Menggunakan React Fragment karena ini adalah konten murni
    <>
      {/* Container 'WrapperMainContent7' */}
      <div
        className="
          flex w-full flex-col items-center 
          gap-16 lg:gap-[93.206px]
        "
      >
        {/* 1. Instance Header (Varian Tengah) */}
        <SectionHeader
          align="center"
          tagText="Blog"
          headerText="Maximizing the value of business data"
          description={description}
        />

        {/* 2. Blog Carousel (Trailer) */}
        <BlogCarousel />
        <Button variant="default" size="default">
          Learn more
        </Button>
      </div>
    </>
  );
}
