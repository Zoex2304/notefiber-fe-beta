/**
 * Panel Gambar untuk Section 3
 *
 * DIPERBARUI: Lebar kaku 'lg:w-[...]' dihapus dan
 * diganti dengan 'lg:flex-1' untuk mengisi "sisa ruang".
 */
export function ImagePanelContent3() {
  return (
    // Container
    <div
      className="
        flex w-full flex-shrink-0 items-center justify-center
        lg:flex-1 
        lg:min-w-0 
        rounded-2xl overflow-hidden
      "
    >
      {/* Gambar */}
      <img
        src="/images/landing/illustrations/cat-sec-3.svg"
        alt="Feature illustration"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
