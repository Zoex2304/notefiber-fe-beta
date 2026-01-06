# Dokumentasi Fitur Frontend: Alur Sign Up Lengkap & Landing Page

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend  
**Cakupan Fitur:** 
1. Alur Sign Up End-to-End (Registrasi â†’ Verifikasi OTP â†’ Sign In)
2. Landing Page (Home & Subpages)

---

# BAGIAN I: ALUR SIGN UP LENGKAP

## Alur Data Semantik (End-to-End)

```
[User Mengisi Formulir Sign Up]
    -> [Validasi Client-Side]
    -> [API Request Register]
    -> [Redirect ke Halaman Verifikasi]
    -> [User Memasukkan Kode OTP 6 Digit]
    -> [API Request Verify Email]
    -> [Redirect ke Halaman Sign In]
    -> [User Berhasil Terdaftar & Siap Login]
```

---

## A. Laporan Implementasi Fitur Alur Sign Up

### Deskripsi Fungsional

Fitur ini menyediakan alur registrasi pengguna secara menyeluruh dalam dua tahap utama:

**Tahap 1 - Registrasi Kredensial:**
Pengguna memasukkan data identitas (Full Name, Email, Password) melalui formulir dengan validasi real-time. Setelah data dikirim ke backend dan berhasil diproses, sistem membuat akun dalam status "unverified" dan mengirim kode OTP ke email pengguna.

**Tahap 2 - Verifikasi Email:**
Pengguna menerima email berisi kode OTP 6 digit yang harus dimasukkan ke halaman verifikasi. Setelah kode divalidasi oleh backend, status akun berubah menjadi "verified" dan pengguna dialihkan ke halaman Sign In untuk memulai sesi.

Kedua halaman (Sign Up dan Validate Code) dilindungi dengan **reverse authentication guard** â€” pengguna yang sudah memiliki token aktif akan dialihkan otomatis ke aplikasi utama.

### Visualisasi Alur

> [PLACEHOLDER SCREENSHOT - STEP 1]
> *Gambar 1: Halaman Sign Up dengan formulir registrasi, validasi real-time, dan indikator kekuatan password.*

> [PLACEHOLDER SCREENSHOT - STEP 2]
> *Gambar 2: Halaman Validate Code dengan input OTP 6 digit dan informasi email tujuan.*

> [PLACEHOLDER SCREENSHOT - STEP 3]
> *Gambar 3: Halaman Sign In sebagai destinasi akhir setelah verifikasi berhasil.*

---

## B. Bedah Arsitektur & Komponen - Tahap 1: Registrasi

---

### [src/routes/(auth)/signup.tsx](file:///d:/notetaker/notefiber-FE/src/routes/%28auth%29/signup.tsx)
**Layer Terdeteksi:** `Route Definition (TanStack Router)`

**Narasi Operasional:**

File ini mendefinisikan route `/signup` dan menghubungkannya dengan page component [SignUp](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx#44-228). Hook [beforeLoad](file:///d:/notetaker/notefiber-FE/src/routes/%28auth%29/validate-code.tsx#6-16) melakukan pemeriksaan keberadaan token di localStorage sebelum halaman dirender â€” jika token ditemukan, pengguna dianggap sudah terauthentikasi dan dialihkan ke `/app`. Mekanisme ini mencegah pengguna yang sudah login mengakses halaman registrasi secara tidak sengaja.

```tsx
export const Route = createFileRoute('/(auth)/signup')({
    component: SignUp,
    beforeLoad: async () => {
        const token = localStorage.getItem('token')
        const refreshToken = localStorage.getItem('refreshToken')

        if (token && refreshToken) {
            throw redirect({ to: '/app', replace: true })
        }
    },
})
```
*Caption: Snippet 1: Route definition dengan reverse auth guard.*

---

### [src/pages/auth/SignUp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx)
**Layer Terdeteksi:** `Page Component (Form Orchestration)`

**Narasi Operasional:**

Komponen ini mengorkestrasi seluruh interaksi registrasi. Formulir dikelola oleh React Hook Form dengan validasi Zod yang mencakup aturan untuk setiap field termasuk cross-field validation untuk password confirmation. State lokal `password` diteruskan ke [PasswordStrengthMeter](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/PasswordStrengthMeter.tsx#8-70) untuk memberikan umpan balik visual secara real-time.

Saat form di-submit, handler [onSubmit](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx#60-75) memanggil hook [useRegister](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useRegister.ts#7-12) dengan payload yang dipetakan dari field formulir. Jika registrasi berhasil, callback [onSuccess](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx#68-72) mengarahkan pengguna ke `/validate-code` dengan menyertakan email sebagai search parameter â€” email ini akan ditampilkan di halaman verifikasi sebagai referensi pengguna.

```tsx
function onSubmit(values: SignUpFormValues) {
    register(
        {
            full_name: values.fullName,
            email: values.email,
            password: values.password,
        },
        {
            onSuccess: () => {
                navigate({ to: '/validate-code', search: { email: values.email } });
            },
        }
    );
}
```
*Caption: Snippet 2: Form submission dengan navigasi ke halaman verifikasi.*

---

### [src/hooks/auth/useRegister.ts](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useRegister.ts)
**Layer Terdeteksi:** `Custom Hook (API Integration)`

**Narasi Operasional:**

Hook ini mengenkapsulasi panggilan API registrasi menggunakan TanStack Query `useMutation`. Menerima data dari page component, meneruskannya ke `authService.register`, dan mengembalikan state mutation (`isPending`, `error`, `mutate`) untuk dikonsumsi oleh form. Type generics memastikan konsistensi tipe antara request dan response.

```tsx
export const useRegister = () => {
    return useMutation<ApiResponse<RegisterData>, ApiError, RegisterRequest>({
        mutationFn: (data) => authService.register(data),
    });
};
```
*Caption: Snippet 3: Hook mutation untuk operasi registrasi.*

---

### [src/pages/auth/components/PasswordStrengthMeter.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/PasswordStrengthMeter.tsx)
**Layer Terdeteksi:** `UI Component (Real-time Feedback)`

**Narasi Operasional:**

Komponen ini mengevaluasi kekuatan password berdasarkan empat kriteria: panjang minimal, keberadaan angka, huruf kapital, dan karakter spesial. Progress bar bersegmen menampilkan skor kekuatan dengan kode warna (merah/kuning/hijau), sementara checklist di bawahnya menunjukkan status setiap kriteria. Komponen beroperasi secara independen dan tidak mempengaruhi validasi form â€” fungsinya murni sebagai panduan visual.

```tsx
const requirements = [
    { label: "At least 6 characters", valid: password.length >= 6 },
    { label: "Contains a number", valid: /\d/.test(password) },
    { label: "Contains an uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Contains a special character", valid: /[^A-Za-z0-9]/.test(password) },
];
```
*Caption: Snippet 4: Evaluasi kriteria kekuatan password.*

---

## C. Bedah Arsitektur & Komponen - Tahap 2: Verifikasi Email

---

### [src/routes/(auth)/validate-code.tsx](file:///d:/notetaker/notefiber-FE/src/routes/%28auth%29/validate-code.tsx)
**Layer Terdeteksi:** `Route Definition (TanStack Router)`

**Narasi Operasional:**

File ini mendefinisikan route `/validate-code` dengan mekanisme guard yang identik dengan halaman signup. Pengguna yang sudah terauthentikasi akan dialihkan ke `/app`, memastikan hanya pengguna yang belum login yang dapat mengakses halaman verifikasi OTP.

```tsx
export const Route = createFileRoute('/(auth)/validate-code')({
    component: ValidateCode,
    beforeLoad: async () => {
        const token = localStorage.getItem('token')
        const refreshToken = localStorage.getItem('refreshToken')

        if (token && refreshToken) {
            throw redirect({ to: '/app', replace: true })
        }
    },
})
```
*Caption: Snippet 5: Route definition untuk halaman verifikasi.*

---

### [src/pages/auth/ValidateCode.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/ValidateCode.tsx)
**Layer Terdeteksi:** `Page Component (OTP Verification)`

**Narasi Operasional:**

Komponen ini menangani tahap kedua registrasi yaitu verifikasi email. Hook `useSearch` mengekstrak parameter `email` dari URL yang dikirim oleh halaman signup sebelumnya â€” email ini ditampilkan sebagai informasi kepada pengguna mengenai ke mana kode OTP dikirim.

State lokal `otp` menyimpan nilai input dari komponen [OtpInput](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/OtpInput.tsx#11-86). Saat tombol validasi ditekan, handler [handleValidate](file:///d:/notetaker/notefiber-FE/src/pages/auth/ValidateCode.tsx#19-37) memanggil hook [useVerifyEmail](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useVerifyEmail.ts#7-12) dengan payload berisi email dan token OTP. Jika verifikasi berhasil, callback [onSuccess](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx#68-72) mengarahkan pengguna ke `/signin`, menandakan alur registrasi telah selesai dan akun siap digunakan.

```tsx
const handleValidate = () => {
    verifyEmail(
        {
            email: email === "your email" ? "" : email,
            token: otp
        },
        {
            onSuccess: () => {
                debugLog.info("ValidateCode: Success, Redirecting to /signin");
                navigate({ to: "/signin" });
            },
            onError: (error) => {
                debugLog.error("ValidateCode: Failed", error);
            }
        }
    );
};
```
*Caption: Snippet 6: Handler verifikasi OTP dengan redirect ke Sign In.*

---

### [src/hooks/auth/useVerifyEmail.ts](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useVerifyEmail.ts)
**Layer Terdeteksi:** `Custom Hook (API Integration)`

**Narasi Operasional:**

Hook ini menyediakan abstraksi untuk operasi verifikasi email. Menggunakan `useMutation` untuk memanggil `authService.verifyEmail` dan mengembalikan state mutation untuk dikonsumsi oleh page component. Response bertipe `null` karena endpoint ini hanya mengembalikan status sukses tanpa data tambahan.

```tsx
export const useVerifyEmail = () => {
    return useMutation<ApiResponse<null>, ApiError, VerifyEmailRequest>({
        mutationFn: (data) => authService.verifyEmail(data),
    });
};
```
*Caption: Snippet 7: Hook mutation untuk verifikasi email.*

---

### [src/pages/auth/components/OtpInput.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/OtpInput.tsx)
**Layer Terdeteksi:** `UI Component (Specialized Input)`

**Narasi Operasional:**

Komponen ini menyediakan input OTP dengan pengalaman pengguna yang optimal. Menggunakan array referensi untuk mengelola fokus antar input box â€” saat pengguna memasukkan digit, fokus otomatis berpindah ke box berikutnya; saat menghapus dengan backspace, fokus kembali ke box sebelumnya. Fitur paste didukung dengan validasi numerik, memungkinkan pengguna menempelkan kode OTP lengkap sekaligus. Visual feedback berupa perubahan warna border dan background saat digit terisi memberikan konfirmasi visual kepada pengguna.

```tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (isNaN(Number(val))) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    onChange(newOtp.join(""));

    if (val && index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
    }
};
```
*Caption: Snippet 8: Handler input dengan auto-focus ke digit berikutnya.*

---

### [src/api/services/auth/auth.service.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts)
**Layer Terdeteksi:** `Service Layer (API Client)`

**Narasi Operasional:**

File ini mengonsolidasikan seluruh operasi API untuk modul authentikasi. Method [register](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts#7-11) mengirim HTTP POST ke endpoint `/auth/register` untuk membuat akun baru, sementara method [verifyEmail](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts#12-16) mengirim request ke `/auth/verify-email` untuk memvalidasi kode OTP. Kedua method menggunakan `apiClient` sebagai HTTP client terpusat dan mengembalikan response dalam format `ApiResponse<T>`.

```tsx
register: async (data: Types.RegisterRequest): Promise<ApiResponse<Types.RegisterData>> => {
    const response = await apiClient.post<ApiResponse<Types.RegisterData>>(ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
},

verifyEmail: async (data: Types.VerifyEmailRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(ENDPOINTS.AUTH.VERIFY_EMAIL, data);
    return response.data;
},
```
*Caption: Snippet 9: Method service untuk registrasi dan verifikasi email.*

---

### [src/api/services/auth/auth.schemas.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.schemas.ts)
**Layer Terdeteksi:** `Schema Definition (Validation Contract)`

**Narasi Operasional:**

File ini mendefinisikan skema validasi Zod untuk request API authentikasi. Schema `registerRequestSchema` memvalidasi payload registrasi dengan aturan: `full_name` 2-100 karakter, `email` sesuai format, dan `password` sesuai aturan keamanan di `passwordSchema`. Schema `verifyEmailRequestSchema` memvalidasi kombinasi email dan token OTP 6 digit. Skema-skema ini juga digunakan untuk inferensi tipe di [auth.types.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.types.ts).

```tsx
export const registerRequestSchema = z.object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: emailSchema,
    password: passwordSchema,
});

export const verifyEmailRequestSchema = z.object({
    email: emailSchema,
    token: z.string().length(6, 'OTP must be 6 digits'),
});
```
*Caption: Snippet 10: Skema validasi untuk request register dan verify email.*

---

### [src/pages/auth/components/AuthLayout.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/AuthLayout.tsx)
**Layer Terdeteksi:** `Layout Component (Shared Presentation)`

**Narasi Operasional:**

Komponen ini menyediakan struktur tata letak konsisten untuk seluruh halaman authentikasi (Sign Up, Sign In, Validate Code). Layout menggunakan pendekatan split-screen: sisi kiri menampilkan ilustrasi visual, sisi kanan menampung formulir yang diterima melalui prop `children`. Logo aplikasi diposisikan secara absolut di pojok kiri atas. Komponen ini memastikan branding dan UX yang seragam di seluruh modul authentikasi.

```tsx
export function AuthLayout({ children, title }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full bg-white relative">
            <div className="absolute top-8 left-8 z-50">
                <Link to="/"><Logo variant="horizontal" size="lg" /></Link>
            </div>
            <div className="hidden lg:flex w-1/2 bg-royal-violet-light/10 relative overflow-hidden">
                <img src="/src/assets/images/landing/illustrations/auth ilustration.svg" alt="Auth Illustration" />
            </div>
            <div className="flex w-full lg:w-1/2 items-center justify-center p-8 lg:p-16 relative">
                <div className="w-full max-w-md flex flex-col gap-8">
                    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    {children}
                </div>
            </div>
        </div>
    );
}
```
*Caption: Snippet 11: Struktur layout split-screen untuk halaman authentikasi.*

---

# BAGIAN II: LANDING PAGE

## Alur Data Semantik (Landing Page)

```
[User Mengakses URL /landing]
    -> [Route Mapping ke LandingPage Component]
    -> [Ekstraksi Query Parameter 'page']
    -> [Conditional Rendering Berdasarkan Nilai 'page']
    -> [Render Subpage (Features/Pricing/AboutUs/Contact) ATAU Default Home Sections]
```

---

## A. Laporan Implementasi Landing Page

### Deskripsi Fungsional

Landing Page berfungsi sebagai portal informasi publik yang memperkenalkan produk kepada calon pengguna. Implementasi menggunakan **Single-Route Multi-Page Pattern** â€” satu route `/landing` mengelola lima variasi konten berdasarkan query parameter `page`:

| Parameter | Konten | Tujuan Bisnis |
|-----------|--------|---------------|
| (kosong/default) | Home dengan 8 sections | Presentasi produk utama |
| `features` | Features page | Detail fitur produk |
| `pricing` | Pricing page | Informasi harga dan paket |
| `about-us` | About Us page | Profil perusahaan |
| `contact` | Contact page | Formulir kontak |

Arsitektur komponen menggunakan **Atomic Design Pattern** dengan pemisahan antara Section Wrapper (menangani spacing/styling) dan Main Content (konten murni). Navbar terintegrasi dalam Hero Section untuk setiap halaman.

### Visualisasi

> [PLACEHOLDER SCREENSHOT - HOME]
> *Gambar 4: Landing Page Home dengan Hero Section, value proposition, dan call-to-action.*

> [PLACEHOLDER SCREENSHOT - FEATURES]
> *Gambar 5: Features Page menampilkan daftar fitur produk dengan ilustrasi.*

> [PLACEHOLDER SCREENSHOT - PRICING]
> *Gambar 6: Pricing Page dengan kartu paket langganan.*

> [PLACEHOLDER SCREENSHOT - ABOUT US]
> *Gambar 7: About Us Page dengan profil perusahaan dan tim.*

> [PLACEHOLDER SCREENSHOT - CONTACT]
> *Gambar 8: Contact Page dengan formulir kontak dan informasi lokasi.*

---

## B. Bedah Arsitektur & Komponen - Landing Page

---

### [src/routes/landing.tsx](file:///d:/notetaker/notefiber-FE/src/routes/landing.tsx)
**Layer Terdeteksi:** `Route Definition (TanStack Router)`

**Narasi Operasional:**

File ini mendefinisikan route `/landing` tanpa mekanisme guard â€” halaman ini bersifat publik dan dapat diakses oleh siapa saja. Route langsung memetakan ke komponen [LandingPage](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/LandingPage.tsx#19-57) yang bertugas menentukan konten mana yang akan ditampilkan berdasarkan query parameter.

```tsx
export const Route = createFileRoute('/landing')({
    component: LandingPage,
})
```
*Caption: Snippet 12: Route definition untuk Landing Page publik.*

---

### [src/pages/landingpage/LandingPage.tsx](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/LandingPage.tsx)
**Layer Terdeteksi:** `Page Component (Content Router)`

**Narasi Operasional:**

Komponen ini berperan sebagai "router internal" untuk berbagai variasi konten landing page. Hook `useSearch` mengekstrak query parameter `page` dari URL. Fungsi [renderPageContent](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/LandingPage.tsx#23-48) menggunakan switch-case untuk menentukan komponen mana yang dirender: [Features](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/Features.tsx#7-23), [Pricing](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/Pricing.tsx#7-22), [AboutUs](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/AboutUs.tsx#9-27), [Contact](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/Contact.tsx#7-23), atau default Home sections. Pendekatan ini memungkinkan navigasi antar subpage tanpa hard page reload sambil mempertahankan struktur URL yang bersih.

Default Home terdiri dari 8 sections yang di-compose secara sequential: [HeroSection](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/components/organisms/HeroSection.tsx#15-38), [Section2](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/components/organisms/Section2.tsx#6-21) hingga [Section8](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/components/organisms/Section8.tsx#4-20), masing-masing menampilkan konten berbeda dari value proposition hingga footer.

```tsx
const renderPageContent = () => {
    switch (page) {
      case "features":
        return <Features />;
      case "pricing":
        return <Pricing />;
      case "about-us":
        return <AboutUs />;
      case "contact":
        return <Contact />;
      default:
        return (
          <>
            <HeroSection />
            <Section2 />
            <Section3 />
            <Section4 />
            <Section5 />
            <Section6 />
            <Section7 />
            <Section8 />
          </>
        );
    }
};
```
*Caption: Snippet 13: Routing internal berdasarkan query parameter.*

---

### [src/pages/landingpage/Features.tsx](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/Features.tsx)
**Layer Terdeteksi:** `Subpage Component (Features)`

**Narasi Operasional:**

Komponen ini menyusun halaman Features dengan meng-compose beberapa section spesifik. [HeroSection](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/components/organisms/HeroSection.tsx#15-38) dikustomisasi dengan props yang relevan: `tagText` "Features", `title` yang menekankan value proposition, dan `imageSrc` ilustrasi khusus. Section-section pendukung mencakup `FeaturesSection1` untuk daftar fitur, `FAQSection` untuk pertanyaan umum, `PricingCallToAction` untuk konversi, dan [Section8](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/components/organisms/Section8.tsx#4-20) sebagai footer.

```tsx
export default function Features() {
  return (
    <div className="flex w-full flex-col items-center bg-white">
      <HeroSection
        tagText="Features"
        title="Powerful Features for You"
        description="Explore the tools that will revolutionize your workflow..."
        imageSrc="/src/assets/images/landing/illustrations/ilustration of feature page hero.png"
      />
      <FeaturesSection1 />
      <FAQSection />
      <PricingCallToAction />
      <Section8 />
    </div>
  );
}
```
*Caption: Snippet 14: Komposisi halaman Features.*

---

### [src/pages/landingpage/Pricing.tsx](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/Pricing.tsx)
**Layer Terdeteksi:** `Subpage Component (Pricing)`

**Narasi Operasional:**

Halaman Pricing menggunakan pola serupa dengan Features namun dengan diferensiasi pada Hero Section. Prop `customHeroContent` menerima komponen `PricingContent` yang berisi kartu-kartu harga, menggantikan ilustrasi default. Struktur ini memungkinkan variasi konten hero yang fleksibel tanpa mengubah arsitektur dasar komponen.

```tsx
export default function Pricing() {
  return (
    <div className="flex w-full flex-col items-center bg-white">
      <HeroSection
        tagText="Pricing"
        title="Simple, Transparent Pricing"
        description="Choose the plan that fits your needs..."
        customHeroContent={<PricingContent />}
      />
      <FAQSection />
      <PricingCallToAction />
      <Section8 />
    </div>
  );
}
```
*Caption: Snippet 15: Hero Section dengan custom content untuk Pricing.*

---

### [src/pages/landingpage/AboutUs.tsx](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/AboutUs.tsx)
**Layer Terdeteksi:** `Subpage Component (About Us)`

**Narasi Operasional:**

Halaman About Us menyediakan informasi profil perusahaan dengan tiga section khusus: `AboutUsSection2` untuk misi/visi, `AboutUsSection3` untuk profil tim, dan `AboutUsSection4` untuk achievement/testimonial. Hero Section menggunakan ilustrasi "podium" yang merefleksikan tema kesuksesan dan leadership.

```tsx
export default function AboutUs() {
  return (
    <div className="flex w-full flex-col items-center bg-white">
      <HeroSection
        tagText="About Us"
        title="We Help You Work Smarter"
        description="Our mission is to empower teams with tools..."
        imageSrc="/src/assets/images/landing/illustrations/podium.svg"
      />
      <AboutUsSection2 />
      <AboutUsSection3 />
      <AboutUsSection4 />
      <FAQSection />
      <PricingCallToAction />
      <Section8 />
    </div>
  );
}
```
*Caption: Snippet 16: Komposisi halaman About Us dengan section khusus.*

---

### [src/pages/landingpage/Contact.tsx](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/Contact.tsx)
**Layer Terdeteksi:** `Subpage Component (Contact)`

**Narasi Operasional:**

Halaman Contact menyediakan channel komunikasi dengan calon pengguna. `ContactFormSection` berisi formulir kontak yang memungkinkan pengiriman pesan langsung. Section-section pendukung yang sama (FAQ, Pricing CTA, Footer) tetap dipertahankan untuk konsistensi navigasi dan konversi.

```tsx
export default function Contact() {
  return (
    <div className="flex w-full flex-col items-center bg-white">
      <HeroSection
        tagText="Contact Us"
        title="Get in Touch"
        description="Have questions? We're here to help..."
        imageSrc="/src/assets/images/landing/illustrations/ilustration of hero contact page.svg"
      />
      <ContactFormSection />
      <FAQSection />
      <PricingCallToAction />
      <Section8 />
    </div>
  );
}
```
*Caption: Snippet 17: Halaman Contact dengan formulir kontak.*

---

### [src/pages/landingpage/components/organisms/HeroSection.tsx](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/components/organisms/HeroSection.tsx)
**Layer Terdeteksi:** `Organism Component (Section Wrapper)`

**Narasi Operasional:**

Komponen ini berfungsi sebagai wrapper untuk Hero Section yang digunakan di seluruh halaman landing. Menerima props konfigurasi (`tagText`, `title`, `description`, `imageSrc`, `customHeroContent`) dan meneruskannya ke [MainContentHeroSection](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/components/organisms/MainContentHeroSection.tsx#14-51). Struktur wrapper-content memisahkan concern styling/spacing dari konten murni.

```tsx
export function HeroSection({ tagText, title, description, imageSrc, customHeroContent }: HeroSectionProps) {
  return (
    <section className="flex w-full flex-col items-start gap-3 px-4 lg:max-w-[1766.593px]">
      <WrapperHeroSection>
        <MainContentHeroSection
          tagText={tagText}
          title={title}
          description={description}
          imageSrc={imageSrc}
          customHeroContent={customHeroContent}
        />
      </WrapperHeroSection>
    </section>
  );
}
```
*Caption: Snippet 18: Hero Section dengan pattern wrapper-content.*

---

### [src/pages/landingpage/components/organisms/MainContentHeroSection.tsx](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/components/organisms/MainContentHeroSection.tsx)
**Layer Terdeteksi:** `Organism Component (Content Container)`

**Narasi Operasional:**

Komponen ini berisi konten utama Hero Section: navbar, body content (tag, title, description), dan area visual (ilustrasi atau custom content). Prop `customHeroContent` memungkinkan substitusi ilustrasi default dengan komponen kustom seperti kartu pricing, memberikan fleksibilitas tinggi untuk variasi hero di berbagai halaman.

```tsx
export function MainContentHeroSection({
  tagText,
  title,
  description,
  imageSrc = "/src/assets/images/landing/illustrations/interface.svg",
  customHeroContent,
}: MainContentHeroSectionProps) {
  return (
    <>
      <MainContentHeroSectionNavbar />
      <BodyContentHeroSection tagText={tagText} title={title} description={description} />
      {customHeroContent ? customHeroContent : (
        <img src={imageSrc} alt="Interface Illustration" className="w-full max-w-6xl rounded-lg" />
      )}
    </>
  );
}
```
*Caption: Snippet 19: Content Hero dengan conditional rendering untuk custom content.*

---

### [src/pages/landingpage/components/organisms/MainContentHeroSectionNavbar.tsx](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/components/organisms/MainContentHeroSectionNavbar.tsx)
**Layer Terdeteksi:** `Organism Component (Navigation)`

**Narasi Operasional:**

Komponen ini menyediakan navbar dalam Hero Section dengan styling responsif. Pada mobile, navbar memiliki border sederhana; pada desktop, navbar memiliki background putih dengan rounded corners dan padding yang lebih besar. Komponen `MainContentHeroSectionNavbarNav` berisi item-item navigasi aktual.

```tsx
export function MainContentHeroSectionNavbar() {
  return (
    <nav className="flex w-full flex-col items-start rounded-lg border border-customBorder-primary 
         bg-transparent px-0 py-0 lg:max-w-[1197.357px] lg:rounded-[73.608px] lg:bg-white 
         lg:px-[39.258px] lg:py-[24.536px]">
      <MainContentHeroSectionNavbarNav />
    </nav>
  );
}
```
*Caption: Snippet 20: Navbar responsif dalam Hero Section.*

---

### [src/pages/landingpage/components/organisms/Section2.tsx](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/components/organisms/Section2.tsx)
**Layer Terdeteksi:** `Organism Component (Section Pattern)`

**Narasi Operasional:**

Komponen ini mendemonstrasikan pola arsitektur yang digunakan di seluruh section landing page. `SectionContainer` menangani styling wrapper (padding, spacing, background), sementara `MainContentSection2` berisi konten murni. Pemisahan ini memungkinkan konsistensi styling antar section sambil menjaga fleksibilitas konten.

```tsx
export function Section2() {
  return (
    <SectionContainer>
      <MainContentSection2 />
    </SectionContainer>
  );
}
```
*Caption: Snippet 21: Pattern SectionContainer + MainContent.*

---

### [src/pages/landingpage/components/organisms/Section8.tsx](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/components/organisms/Section8.tsx)
**Layer Terdeteksi:** `Organism Component (Footer)`

**Narasi Operasional:**

Section 8 berfungsi sebagai footer yang digunakan di semua halaman landing. Menggunakan pola yang sama dengan section lain namun dengan customization melalui prop `panelClassName` untuk styling khusus (padding lebih besar dan background abu-abu). `MainContentSection8` berisi konten footer seperti links, copyright, dan social media.

```tsx
export function Section8() {
  return (
    <SectionContainer panelClassName="lg:p-24 bg-cool-grey-2">
      <MainContentSection8 />
    </SectionContainer>
  );
}
```
*Caption: Snippet 22: Footer section dengan custom styling.*

---

## C. Ringkasan Ketergantungan Komponen

### Alur Sign Up

| Tahap | Komponen | Menerima Dari | Meneruskan Ke |
|-------|----------|---------------|---------------|
| 1 | [signup.tsx](file:///d:/notetaker/notefiber-FE/src/routes/%28auth%29/signup.tsx) | Browser URL | [SignUp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx) |
| 1 | [SignUp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx) | User Input | [useRegister](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useRegister.ts#7-12), navigasi ke `/validate-code` |
| 1 | [useRegister.ts](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useRegister.ts) | [SignUp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx) | [auth.service.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts) â†’ Backend |
| 2 | [validate-code.tsx](file:///d:/notetaker/notefiber-FE/src/routes/%28auth%29/validate-code.tsx) | Browser URL (+email param) | [ValidateCode.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/ValidateCode.tsx) |
| 2 | [ValidateCode.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/ValidateCode.tsx) | User Input (OTP) | [useVerifyEmail](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useVerifyEmail.ts#7-12), navigasi ke `/signin` |
| 2 | [useVerifyEmail.ts](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useVerifyEmail.ts) | [ValidateCode.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/ValidateCode.tsx) | [auth.service.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts) â†’ Backend |

### Landing Page

| Komponen | Mengorkestrasi |
|----------|----------------|
| [LandingPage.tsx](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/LandingPage.tsx) | Routing internal ke subpages |
| [Features.tsx](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/Features.tsx) | HeroSection + FeaturesSection1 + FAQ + CTA + Footer |
| [Pricing.tsx](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/Pricing.tsx) | HeroSection (+ PricingContent) + FAQ + CTA + Footer |
| [AboutUs.tsx](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/AboutUs.tsx) | HeroSection + AboutUsSections + FAQ + CTA + Footer |
| [Contact.tsx](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/Contact.tsx) | HeroSection + ContactFormSection + FAQ + CTA + Footer |
| [HeroSection.tsx](file:///d:/notetaker/notefiber-FE/src/pages/landingpage/components/organisms/HeroSection.tsx) | Wrapper + Navbar + Body + Visual/CustomContent |

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
