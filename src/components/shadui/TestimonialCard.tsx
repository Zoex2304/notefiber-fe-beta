import { Star } from "lucide-react";

// Data untuk satu card
export interface Testimonial {
  name: string;
  avatarUrl: string; // Placeholder, kita bisa ganti dengan path svg
  stars: number;
  testimonial: string;
  date: string;
}

interface TestimonialCardProps {
  data: Testimonial;
}

/**
 * Komponen Atom "Testimonial Card"
 */
export function TestimonialCard({ data }: TestimonialCardProps) {
  const { name, avatarUrl, stars, testimonial, date } = data;

  return (
    // Container Card (Specs: h-[318.861px], p, rounded, border, shadow)
    <div
      className="
        flex h-auto flex-col justify-between self-stretch
        rounded-[21.143px] border-[1.41px] border-customBorder-secondary
        bg-white p-6 shadow-[8.457px_7.358px_29.037px_-2.819px_rgba(0,0,0,0.05)]
        lg:h-[318.861px] lg:p-[35.565px]
      "
    >
      {/* --- Bagian Atas --- */}
      {/* Specs: flex-col, gap-[17.169px] */}
      <div className="flex flex-col items-start gap-4 lg:gap-[17.169px]">
        {/* Instance Avatar (Avatar + Info) */}
        <div className="flex items-center gap-3">
          {/* Avatar (Specs: 45.106px, rounded, border, bg) */}
          <img
            src={avatarUrl}
            alt={name}
            className="
              h-10 w-10 rounded-full border-[0.65px] border-[#F5F6F9]
              bg-royal-violet-muted object-cover
              lg:h-[45.106px] lg:w-[45.106px]
            "
          />
          {/* Frame (Nama + Bintang) */}
          {/* Specs: flex, items-center, gap-[5.638px] */}
          <div className="flex flex-col items-start lg:flex-row lg:items-center lg:gap-[5.638px]">
            {/* Nama (Specs: 18.324px) */}
            <span
              className="
                font-normal text-customFont-dark-base
                text-body-base lg:text-[18.324px]
              "
            >
              {name}
            </span>
            {/* Rating Bintang */}
            <div className="flex">
              {Array(stars)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Teks Testimoni (Specs: 18.324px) */}
        <p
          className="
            font-normal text-customFont-dark-base
            text-body-base lg:text-[18.324px] lg:leading-[1.4]
          "
        >
          {testimonial}
        </p>
      </div>

      {/* --- Bagian Bawah --- */}
      {/* Tanggal (Specs: 18.324px) */}
      <p
        className="
          mt-4 font-normal text-customFont-dark-base
          text-body-base lg:mt-0 lg:text-[18.324px]
        "
      >
        {date}
      </p>
    </div>
  );
}
