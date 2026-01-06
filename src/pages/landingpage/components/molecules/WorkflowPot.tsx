
import { PotIcon } from '@/components/shadui/PotIcon';
import type { LucideIcon } from 'lucide-react';

interface WorkflowPotProps {
  icon: LucideIcon;
  title: string;
  description: string;
  imageSrc: string;
}

/**
 * Komponen Reusable "Workflow Pot"
 * Merender 1 dari 4 pot workflow.
 *
 * DIPERBARUI: Menambahkan efek vignette gradasi putih pada bagian bawah gambar.
 */
export function WorkflowPot({
  icon,
  title,
  description,
  imageSrc,
}: WorkflowPotProps) {
  return (
    // Container Pot
    <div
      className="
        flex flex-shrink-0 flex-col items-start
        rounded-2xl border border-customBorder-primary
        w-full lg:w-[594.369px] 
        h-auto lg:h-[656.338px]
        p-6 pb-0 lg:p-[36.804px] lg:pb-0
      "
    >
      {/* Bagian "top" */}
      <div className="flex flex-col items-start self-stretch gap-6 lg:gap-[33.124px]">
        <PotIcon icon={icon} />

        <div className="flex flex-col items-start self-stretch gap-2 lg:gap-[9.814px]">
          <h3
            className="
              font-normal text-customFont-dark-base
              text-display-h3 
              lg:text-[47.845px] lg:leading-[1.4]
            "
          >
            {title}
          </h3>
          <p
            className="
              font-normal text-customFont-base
              text-body-base
              lg:text-[19.629px] lg:leading-[1.4]
            "
          >
            {description}
          </p>
        </div>
      </div>

      {/* Bagian "group" (Image) */}
      {/* DIPERBARUI: Menambahkan wrapper div dengan 'mask-image' untuk vignette */}
      <div
        className="
          relative flex w-full items-end justify-center 
          h-64 lg:h-[375.401px]
          mt-4 lg:mt-auto
        "
        style={{
          maskImage: 'linear-gradient(to top, transparent, black 40%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to top, transparent, black 10%, black 100%)', // Untuk kompatibilitas
        }}
      >
        <img
          src={imageSrc}
          alt={title}
          className="h-full w-auto object-contain"
        />
      </div>
    </div>
  );
}

