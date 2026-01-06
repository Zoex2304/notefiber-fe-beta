import { InputFooter } from "@/components/shadui/InputFooter";

/**
 * Komponen Spesifik untuk "Input Section Footer" (Panel Kanan)
 *
 * (Specs: flex-col, 447.632px)
 */
export function InputSecFooter() {
  return (
    <div
      className="
        flex w-full flex-col items-start 
        gap-4 lg:gap-[22.075px]
        lg:w-[447.632px] 
        lg:flex-shrink-0
      "
    >
      {/* 1. Teks Statis (Specs: 19.622px) */}
      <h3
        className="
          font-normal text-customFont-dark-base 
          text-body-1 lg:text-[19.622px] 
          leading-[1.4]
        "
      >
        Subscribe our newsletter
      </h3>

      {/* 2. Instance Input Footer */}
      <InputFooter placeholder="Your email address" buttonText="Subscribe" />
    </div>
  );
}
