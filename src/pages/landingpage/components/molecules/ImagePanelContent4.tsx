/**
 * Panel Gambar Bulat untuk Section 4
 *
 * Specs: flex, w/h-[830.544px], p-[150.896px], rounded-full, border, bg-[#F0ECFD]
 * Dibuat responsif (Mobile-First).
 */
export function ImagePanelContent4() {
  return (
    // Container (responsif)
    <div
      className="
        flex flex-shrink-0 items-center justify-center
        rounded-full border-[1.227px] border-customBorder-primary
        bg-[#F0ECFD]
        w-full h-auto aspect-square
        p-16
        lg:w-[830.544px] lg:h-[830.544px] lg:p-[150.896px]
      "
    >
      {/* Placeholder untuk gambar di dalam */}
      <img
        src="/src/assets/images/landing/illustrations/circle hell.svg"
        alt="Feature illustration"
        className="h-full w-full rounded-lg object-cover"
      />
    </div>
  );
}
