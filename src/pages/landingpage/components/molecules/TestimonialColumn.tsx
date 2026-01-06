import {
  TestimonialCard,
  type Testimonial,
} from "@/components/shadui/TestimonialCard";

// Data Placeholder (Spesifik untuk fitur ini, jadi ada di sini)
const DUMMY_TESTIMONIALS: Testimonial[] = [
  {
    name: "Sukamto Siregar",
    avatarUrl: "https://placehold.co/45x45/b7aaee/FFF?text=S",
    stars: 5,
    testimonial:
      "As an active investor, I've struggled to keep track of my diverse portfolio. This platform changed everything...",
    date: "August 29, 2025",
  },
  {
    name: "Jane Doe",
    avatarUrl: "https://placehold.co/45x45/b7aaee/FFF?text=J",
    stars: 5,
    testimonial:
      "The custom reporting tools are a game-changer for our quarterly reviews. Highly recommended for any serious firm.",
    date: "August 15, 2025",
  },
  {
    name: "Michael Chen",
    avatarUrl: "https://placehold.co/45x45/b7aaee/FFF?text=M",
    stars: 5,
    testimonial:
      "I've seen real growth since using this tool. The analytics are incredibly detailed and easy to understand.",
    date: "July 30, 2025",
  },
];

/**
 * Komponen "Trailer" Vertikal
 * Specs: inline-flex, flex-col, gap-[19.622px]
 */
export function TestimonialColumn() {
  return (
    <div
      className="
        inline-flex flex-col flex-nowrap
        gap-4 lg:gap-[19.622px]
      "
    >
      {DUMMY_TESTIMONIALS.map((testimonial) => (
        <TestimonialCard key={testimonial.name} data={testimonial} />
      ))}
    </div>
  );
}
