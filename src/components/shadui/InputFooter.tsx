import { Button } from "./button";
import { cn } from "@/lib/utils";
import { useState } from "react"; // 1. Import useState

interface InputFooterProps {
  placeholder?: string;
  buttonText?: string;
}

/**
 * Komponen Reusable Input Footer
 *
 * DIPERBARUI: Sekarang menjadi <form> fungsional
 * dengan <input type="email"> yang sebenarnya.
 */
export function InputFooter({
  placeholder = "Your email address",
  buttonText = "Subscribe",
}: InputFooterProps) {
  // 2. Tambahkan state untuk mengontrol input
  const [email, setEmail] = useState("");

  // 3. Handle submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Di sinilah Anda akan menambahkan logic
    // untuk mengirim email ke service Anda.
    console.log("Email submitted:", email);
    // Kosongkan input setelah submit
    setEmail("");
  };

  return (
    // 4. Ubah 'div' menjadi 'form' dan tambahkan onSubmit
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex h-auto w-full items-center justify-between",
        "rounded-full border-[0.613px] border-customFont-base",
        "p-2 lg:h-[66.225px] lg:p-[12.264px] lg:pl-[29.433px]",
        "transition-all duration-200",
        // Tambahkan feedback visual saat input di-fokus
        "focus-within:ring-2 focus-within:ring-royal-violet-base/80"
      )}
    >
      {/* 5. Ganti 'span' dengan '<input>' yang sebenarnya */}
      <input
        type="email"
        placeholder={placeholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="
          flex-1 bg-transparent 
          border-none outline-none ring-0 
          focus:ring-0 
          text-customFont-dark-base
          placeholder:text-customFont-base
          text-body-3 lg:text-[15.943px] 
          font-normal leading-[1.4]
          ml-4 lg:ml-0
        "
      />

      {/* 6. Tambahkan type="submit" ke Button */}
      <Button
        type="submit"
        variant="default"
        size="subscribe"
        className="flex-shrink-0" // Mencegah tombol mengecil
      >
        {buttonText}
      </Button>
    </form>
  );
}
