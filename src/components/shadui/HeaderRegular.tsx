interface HeaderRegularProps {
  subject: string;
  description: string;
}

/**
 * Komponen Reusable "Header Regular"
 *
 * DIPERBARUI: Font size (rasio) dikecilkan
 * agar muat lebih baik di dalam BlogCard.
 */
export function HeaderRegular({ subject, description }: HeaderRegularProps) {
  return (
    <div
      className="
        flex flex-col items-start self-stretch
        gap-3 lg:gap-[14.547px]
      "
    >
      {/* 1. Subject (Dikecilkan ke 20px) */}
      <h3
        className="
          font-normal text-customFont-dark-base
          text-body-1 
          leading-[1.4]
          line-clamp-2
        "
      >
        {subject}
      </h3>

      {/* 2. Description (Dikecilkan ke 16px) */}
      <p
        className="
          font-normal text-customFont-base
          text-body-base 
          leading-[1.4]
          line-clamp-3
          self-stretch
        "
      >
        {description}
      </p>
    </div>
  );
}
