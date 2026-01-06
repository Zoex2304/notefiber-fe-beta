import { Tag } from './Tag';
import { HeaderRegular } from './HeaderRegular';
import { Button } from './button';

// Definisikan data untuk satu blog card
export interface BlogCardData {
  id: string;
  imageUrl: string;
  labels: string[];
  subject: string;
  description: string;
}

interface BlogCardProps {
  data: BlogCardData;
}

/**
 * Komponen Reusable "Blog Card"
 *
 * (File ini sudah benar, masalahnya ada di HeaderRegular)
 */
export function BlogCard({ data }: BlogCardProps) {
  return (
    // Container Card
    <div
      className="
        flex w-[300px] flex-shrink-0 flex-col 
        gap-6 
        rounded-[24.003px] border-[0.364px] border-customFont-base
        p-5 
        lg:w-[399.324px] lg:p-[27.64px]
      "
    >
      {/* === Frame 20 (Gambar + Label) === */}
      <div className="flex flex-col items-start gap-2 lg:gap-[7.274px]">
        {/* 1. Gambar */}
        <img
          src={data.imageUrl}
          alt={data.subject}
          className="
            w-full rounded-lg object-cover 
            h-auto lg:h-[309.858px]
          "
        />

        {/* 2. 'frame 22' (Label Trailer) */}
        <div className="flex flex-wrap items-start gap-2 lg:gap-[7.274px]">
          {data.labels.map((label) => (
            <Tag key={label} size="small">
              {label}
            </Tag>
          ))}
        </div>
      </div>

      {/* === Frame 19 (Teks) === */}
      <HeaderRegular
        subject={data.subject}
        description={data.description}
      />
        
      {/* 4. Tombol "Read More" */}
      <Button variant="outline" size="card-outline">
        Read More
      </Button>
    </div>
  );
}

