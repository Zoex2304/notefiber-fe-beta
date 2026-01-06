import { useRef } from "react";
import { BlogCard, type BlogCardData } from "./BlogCard";
import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// --- Data Placeholder ---
const DUMMY_BLOG_DATA: BlogCardData[] = [
  {
    id: "1",
    imageUrl: "/images/landing/illustrations/plc1.svg",
    labels: ["Financial", "Technology"],
    subject:
      "How real-time analytics can revolutionize your financial strategy",
    description:
      "Perfect for small businesses or startups, our Starter Plan gives you the essential tools.",
  },
  {
    id: "2",
    imageUrl: "/images/landing/illustrations/plc2.svg",
    labels: ["Investment", "SaaS"],
    subject: "The 5 SaaS metrics every investor needs to track in 2026",
    description:
      "Gain valuable insights with powerful, real-time analytics and customizable reports.",
  },
  {
    id: "3",
    imageUrl: "/images/landing/illustrations/plc3.svg",
    labels: ["Productivity"],
    subject: "Streamlining Your Workflow: A Guide to NoteFiber Features",
    description:
      "Create your account in minutes and tailor the platform to meet your company's unique needs.",
  },
  {
    id: "4",
    imageUrl: "/images/landing/illustrations/plc1.svg",
    labels: ["Financial", "Startups"],
    subject: "Another amazing blog post about financial management",
    description:
      "Our expert support team is available 24/7 to assist with any questions you might have.",
  },
];
// --------------------

/**
 * Komponen Reusable "Blog Carousel"
 *
 * DIPERBARUI:
 * 1. Viewport (scrollContainer) diberi 'lg:max-w-[1232.128px]'
 * agar pas 3 card dan bisa di-center.
 * 2. Logic scroll diubah untuk menggeser 1 card penuh.
 */
export function BlogCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk menggeser carousel
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      // Card width (400) + gap (16.064)
      const scrollAmount = 416.064;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full">
      <Button
        variant="glass"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex"
        onClick={() => scroll("left")}
      >
        <ChevronLeft />
      </Button>

      <div
        ref={scrollContainerRef}
        className="
          flex w-full items-stretch 
          gap-4 lg:gap-[16.064px]
          overflow-x-auto 
          scroll-smooth 
          snap-x snap-mandatory
          pb-4
          lg:max-w-[1232.128px] 
          mx-auto 
        "
        style={{ scrollbarWidth: "none" }} // Sembunyikan scrollbar
      >
        {DUMMY_BLOG_DATA.map((blogPost) => (
          // 'snap-start' penting untuk carousel
          <div key={blogPost.id} className="snap-start">
            <BlogCard data={blogPost} />
          </div>
        ))}
      </div>

      {/* Tombol Kanan (Glass) */}
      <Button
        variant="glass"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex"
        onClick={() => scroll("right")}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
