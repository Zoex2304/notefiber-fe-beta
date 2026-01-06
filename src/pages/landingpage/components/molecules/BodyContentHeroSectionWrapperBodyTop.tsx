// src/pages/landingpage/components/molecules/BodyContentHeroSectionWrapperBodyTop.tsx
import { Tag } from "@/components/shadui/Tag";
import { TextAreaIntro } from "./TextAreaIntro";

interface BodyContentHeroSectionWrapperBodyTopProps {
  tagText?: string;
  title?: string;
  description?: string;
}


export function BodyContentHeroSectionWrapperBodyTop({
  tagText = "Best Productivity Management",
  title,
  description,
}: BodyContentHeroSectionWrapperBodyTopProps) {
  const defaultDescription =
    "Streamline your note-taking and workflows with our AI-integrated SaaS platform. Designed to scale, our solution turns complex information into actionable knowledge.";

  return (
    <div className="flex w-full flex-col items-center gap-4 lg:gap-7">
      {/* Tag (Ukuran font mobile: text-body-3 / 13px) */}
      <Tag iconSrc="/images/landing/logo/logo_symbol.svg">
        {tagText}
      </Tag>

      {/* Wrapper untuk "Enhance..." dan "TextAreaIntro" */}
      <div className="flex w-full flex-col items-center gap-1 lg:gap-1">
        {title ? (
          <h1
            className="
            text-center text-customFont-dark-base 
            text-display-h3
            leading-[1.2] 
            lg:text-[74.835px] 
            lg:leading-[1.4]
          "
          >
            {title}
          </h1>
        ) : (
          <>
            {/* Teks "Enhance..." (Weight mobile: font-semibold) */}
            <h1
              className="
            text-center text-customFont-dark-base 
            text-display-h3
            leading-[1.2] 
            lg:text-[74.835px] 
            lg:leading-[1.4]
          "
            >
              Enhance your productivity
            </h1>

            {/* Komponen "textarea-intro" */}
            <TextAreaIntro />
          </>
        )}
      </div>

      {/* Teks "Streamline" dengan max-width untuk alignment */}
      <p
        className="
          text-center font-normal text-customFont-base 
          text-body-5
          tracking-wide
          lg:text-body-base lg:max-w-2xl
        "
      >
        {description || defaultDescription}
      </p>
    </div>
  );
}
