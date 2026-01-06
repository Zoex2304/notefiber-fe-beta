# Dokumentasi Fitur: Authentikasi - Sign Up User Credential

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend  
**Metode Registrasi:** Traditional Credential (Email & Password)

---

## Alur Data Semantik (Scope: Frontend)

```
[User Input Formulir] 
    -> [Validasi Client-Side (Zod Schema)] 
    -> [Evaluasi Kekuatan Password] 
    -> [Form Submission Trigger] 
    -> [Hook Mutation (useRegister)] 
    -> [API Request ke Backend] 
    -> [Redirect ke Halaman Verifikasi Email]
```

---

## A. Laporan Implementasi Fitur Sign Up User Credential

### Deskripsi Fungsional

Fitur ini menyediakan mekanisme registrasi akun pengguna baru menggunakan kredensial tradisional berupa **Full Name**, **Email**, dan **Password**. Sistem mengimplementasikan validasi dua lapis: validasi client-side secara real-time sebelum data dikirim ke server, dan umpan balik visual mengenai kekuatan password untuk membantu pengguna membuat kredensial yang aman.

Setelah pengguna mengisi formulir dan menyetujui Terms & Privacy Policy, data dikirim ke endpoint backend `/auth/register`. Jika registrasi berhasil, sistem mengarahkan pengguna ke halaman verifikasi kode OTP dengan membawa parameter email sebagai identifier.

**Proteksi Akses Route:** Halaman signup dilindungi dengan **reverse guard** â€” pengguna yang sudah terauthentikasi (memiliki token di localStorage) akan dialihkan secara otomatis ke halaman aplikasi utama (`/app`).

> [PLACEHOLDER SCREENSHOT]
> *Gambar 1: Tampilan halaman Sign Up dengan formulir registrasi dan indikator kekuatan password.*

---

## B. Bedah Arsitektur & Komponen

Berikut adalah rincian komponen yang menyusun fitur Sign Up di sisi Frontend.

---

### [src/routes/(auth)/signup.tsx](file:///d:/notetaker/notefiber-FE/src/routes/%28auth%29/signup.tsx)
**Layer Terdeteksi:** `Route Definition (TanStack Router)`

**Narasi Operasional:**

File ini mendefinisikan route `/signup` dalam sistem routing TanStack Router. Komponen ini menghubungkan path URL dengan komponen presentasi [SignUp](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx#44-228) yang berasal dari `@/pages/auth/SignUp`. Sebelum komponen di-render, hook [beforeLoad](file:///d:/notetaker/notefiber-FE/src/routes/%28auth%29/signup.tsx#6-16) memeriksa keberadaan `token` dan [refreshToken](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts#37-41) di localStorage. Jika kedua token ditemukan, pengguna dianggap sudah terauthentikasi dan dialihkan secara paksa ke `/app` menggunakan mekanisme redirect. Konfigurasi ini memastikan pengguna yang sudah login tidak dapat mengakses halaman registrasi secara langsung.

```tsx
// Implementasi route guard untuk redirect pengguna terauthentikasi
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
*Caption: Snippet 1: Definisi route dengan mekanisme redirect untuk pengguna terauthentikasi.*

---

### [src/pages/auth/SignUp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx)
**Layer Terdeteksi:** `Page Component (Presentational Logic)`

**Narasi Operasional:**

Komponen ini merupakan page utama yang mengorkestrasi seluruh alur registrasi pengguna. File ini mengintegrasikan beberapa komponen anak dan hook untuk membangun pengalaman registrasi yang lengkap. Formulir dikelola menggunakan React Hook Form dengan resolver `zodResolver` yang menghubungkan skema validasi `signUpSchema` dengan state formulir.

Skema validasi mendefinisikan aturan untuk setiap field: `fullName` minimal 2 karakter, `email` harus valid, `password` minimal 8 karakter, `confirmPassword` harus identik dengan password, dan `agreeTerms` wajib bernilai `true`. Hook [useRegister](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useRegister.ts#7-12) dipanggil untuk menangani pengiriman data ke backend â€” saat mutation berhasil, callback [onSuccess](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx#68-72) mengarahkan pengguna ke halaman `/validate-code` dengan menyertakan email sebagai search parameter untuk proses verifikasi selanjutnya.

State lokal `password` digunakan untuk meneruskan nilai password secara real-time ke komponen [PasswordStrengthMeter](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/PasswordStrengthMeter.tsx#8-70), sehingga umpan balik kekuatan password dapat ditampilkan tanpa menunggu form submission. Tampilan error dari backend ditangani melalui objek `error` yang dikembalikan oleh hook mutation.

```tsx
// Skema validasi formulir menggunakan Zod
const signUpSchema = z
    .object({
        fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
        email: z.string().email({ message: "Please enter a valid email address." }),
        password: z.string().min(8, { message: "Password must be at least 8 characters." }),
        confirmPassword: z.string(),
        agreeTerms: z.boolean().refine((val) => val === true, {
            message: "You must agree to the terms and privacy policy.",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
```
*Caption: Snippet 2: Definisi skema validasi dengan cross-field validation untuk password confirmation.*

```tsx
// Handler submit dengan integrasi mutation dan redirect
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
*Caption: Snippet 3: Transformasi data form ke format API request dan penanganan navigasi post-registrasi.*

---

### [src/hooks/auth/useRegister.ts](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useRegister.ts)
**Layer Terdeteksi:** `Custom Hook (API Integration Layer)`

**Narasi Operasional:**

Hook ini menyediakan abstraksi untuk operasi registrasi dengan memanfaatkan TanStack Query `useMutation`. Hook menerima data dari page component, meneruskannya ke `authService.register`, dan mengembalikan state mutation (`isPending`, `error`, `mutate`) yang dikonsumsi oleh komponen pemanggil. Type generics memastikan type-safety antara request ([RegisterRequest](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.types.ts#6-7)), response (`ApiResponse<RegisterData>`), dan error (`ApiError`). Dengan pendekatan ini, logika komunikasi API terpisah dari logika presentasi, sehingga page component tetap fokus pada rendering dan user interaction.

```tsx
// Implementasi hook mutation untuk registrasi
export const useRegister = () => {
    return useMutation<ApiResponse<RegisterData>, ApiError, RegisterRequest>({
        mutationFn: (data) => authService.register(data),
    });
};
```
*Caption: Snippet 4: Hook mutation yang mengenkapsulasi panggilan API registrasi.*

---

### [src/api/services/auth/auth.service.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts)
**Layer Terdeteksi:** `Service Layer (API Client Abstraction)`

**Narasi Operasional:**

File ini mengkonsolidasikan seluruh operasi API yang berkaitan dengan modul authentikasi. Method [register](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts#7-11) menerima payload dari hook layer, mengirim HTTP POST request ke endpoint yang didefinisikan di konstanta `ENDPOINTS.AUTH.REGISTER`, dan mengembalikan response body dalam format `ApiResponse<RegisterData>`. Service ini menggunakan `apiClient` sebagai HTTP client terpusat yang menangani konfigurasi base URL, interceptors, dan header management. Arsitektur ini memungkinkan penambahan atau modifikasi endpoint authentikasi lainnya (login, verify email, forgot password, dll) secara terpusat dalam satu modul.

```tsx
// Method register dalam auth service
register: async (data: Types.RegisterRequest): Promise<ApiResponse<Types.RegisterData>> => {
    const response = await apiClient.post<ApiResponse<Types.RegisterData>>(ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
},
```
*Caption: Snippet 5: Implementasi method register yang mengirim request ke endpoint `/auth/register`.*

---

### [src/api/services/auth/auth.types.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.types.ts)
**Layer Terdeteksi:** `Type Definition (Contract Layer)`

**Narasi Operasional:**

File ini mendefinisikan kontrak tipe data untuk seluruh operasi authentikasi menggunakan inferensi dari Zod schema. Type [RegisterRequest](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.types.ts#6-7) menentukan struktur payload yang dikirim ke API, sementara [RegisterData](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.types.ts#20-21) mendefinisikan struktur response yang diharapkan dari server. Dengan memanfaatkan `z.infer`, tipe-tipe ini secara otomatis sinkron dengan skema validasi di [auth.schemas.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.schemas.ts), menghilangkan duplikasi definisi dan memastikan konsistensi antara validasi runtime dan compile-time type checking.

```tsx
// Definisi tipe request dan response untuk registrasi
export type RegisterRequest = z.infer<typeof schemas.registerRequestSchema>;
export type RegisterData = z.infer<typeof schemas.registerResponseSchema>;
```
*Caption: Snippet 6: Type inference dari Zod schema untuk request dan response registrasi.*

---

### [src/api/services/auth/auth.schemas.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.schemas.ts)
**Layer Terdeteksi:** `Schema Definition (Validation Contract)`

**Narasi Operasional:**

File ini menyimpan skema validasi Zod untuk request dan response API authentikasi. Schema `registerRequestSchema` mendefinisikan validasi untuk payload registrasi: `full_name` minimal 2 karakter dan maksimal 100 karakter, `email` divalidasi menggunakan reusable schema `emailSchema`, dan `password` divalidasi dengan `passwordSchema` yang memiliki aturan keamanan lebih ketat. Schema `registerResponseSchema` mendefinisikan struktur response sukses yang berisi [id](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.types.ts#23-24) dan `email` pengguna yang baru terdaftar. Skema-skema ini digunakan untuk inferensi tipe di [auth.types.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.types.ts) dan dapat juga digunakan untuk validasi response dari backend jika diperlukan.

```tsx
// Schema untuk request registrasi
export const registerRequestSchema = z.object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: emailSchema,
    password: passwordSchema,
});

// Schema untuk response registrasi
export const registerResponseSchema = z.object({
    id: z.string(),
    email: z.string().email(),
});
```
*Caption: Snippet 7: Definisi skema Zod untuk validasi request dan response registrasi.*

---

### [src/pages/auth/components/AuthLayout.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/AuthLayout.tsx)
**Layer Terdeteksi:** `Layout Component (Presentational)`

**Narasi Operasional:**

Komponen ini menyediakan struktur tata letak konsisten untuk seluruh halaman authentikasi (Sign Up, Sign In, dll). Layout menggunakan pendekatan split-screen: sisi kiri menampilkan ilustrasi visual, sisi kanan menampung formulir yang diterima melalui prop `children`. Logo aplikasi diposisikan secara absolut di pojok kiri atas dengan link navigasi ke halaman utama. Prop `title` dirender sebagai heading utama di atas konten formulir. Komponen ini memastikan branding dan UX yang seragam di seluruh modul authentikasi tanpa duplikasi markup di setiap halaman.

```tsx
// Struktur layout dengan ilustrasi dan area formulir
export function AuthLayout({ children, title }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full bg-white relative">
            <div className="absolute top-8 left-8 z-50">
                <Link to="/">
                    <Logo variant="horizontal" size="lg" />
                </Link>
            </div>

            <div className="hidden lg:flex w-1/2 bg-royal-violet-light/10 relative overflow-hidden">
                <img src="/src/assets/images/landing/illustrations/auth ilustration.svg" alt="Auth Illustration" className="absolute inset-0 w-full h-full object-cover" />
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
*Caption: Snippet 8: Implementasi layout split-screen untuk halaman authentikasi.*

---

### [src/pages/auth/components/PasswordInput.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/PasswordInput.tsx)
**Layer Terdeteksi:** `UI Component (Form Element)`

**Narasi Operasional:**

Komponen ini memperluas fungsionalitas input standar dengan menambahkan kemampuan toggle visibility untuk field password. Menggunakan pattern `forwardRef` untuk mempertahankan kompatibilitas dengan React Hook Form yang memerlukan akses langsung ke DOM element. Prop `showToggle` mengontrol apakah tombol toggle ditampilkan â€” dalam konteks Sign Up, toggle dinonaktifkan untuk field password utama (karena sudah ada [PasswordStrengthMeter](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/PasswordStrengthMeter.tsx#8-70)), namun diaktifkan untuk field confirm password. CSS tambahan menyembunyikan native password reveal button di browser Edge/IE untuk menjaga konsistensi visual.

```tsx
// Implementasi password input dengan toggle visibility
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, showToggle = true, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);

        return (
            <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    className={cn("hide-password-toggle pr-10", className)}
                    ref={ref}
                    {...props}
                />
                {showToggle && (
                    <Button type="button" variant="ghost" size="sm"
                        onClick={() => setShowPassword((prev) => !prev)}>
                        {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                )}
            </div>
        );
    }
);
```
*Caption: Snippet 9: Komponen password input dengan fitur toggle visibility.*

---

### [src/pages/auth/components/PasswordStrengthMeter.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/PasswordStrengthMeter.tsx)
**Layer Terdeteksi:** `UI Component (Feedback Element)`

**Narasi Operasional:**

Komponen ini menerima nilai password dari parent component dan menampilkan umpan balik visual secara real-time mengenai kekuatan password. Empat kriteria dievaluasi: panjang minimal 6 karakter, keberadaan angka, huruf kapital, dan karakter spesial. Setiap kriteria yang terpenuhi meningkatkan skor kekuatan yang divisualisasikan dalam progress bar bersegmen â€” warna merah untuk skor rendah (1-2), kuning untuk sedang (3), dan hijau untuk kuat (4). Checklist di bawah progress bar menampilkan status setiap kriteria dengan ikon centang atau silang. Komponen ini beroperasi secara independen dan tidak mempengaruhi validasi form â€” fungsinya murni sebagai panduan visual untuk membantu pengguna membuat password yang lebih aman.

```tsx
// Definisi kriteria dan logika evaluasi kekuatan password
const requirements = [
    { label: "At least 6 characters", valid: password.length >= 6 },
    { label: "Contains a number", valid: /\d/.test(password) },
    { label: "Contains an uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Contains a special character", valid: /[^A-Za-z0-9]/.test(password) },
];

const strength = requirements.filter((req) => req.valid).length;
```
*Caption: Snippet 10: Evaluasi kekuatan password berdasarkan empat kriteria keamanan.*

---

## C. Ringkasan Ketergantungan Komponen

| Komponen | Menerima Data Dari | Meneruskan Data Ke |
|---|---|---|
| [signup.tsx](file:///d:/notetaker/notefiber-FE/src/routes/%28auth%29/signup.tsx) (Route) | Browser URL | [SignUp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx) |
| [SignUp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx) (Page) | User Input | [useRegister](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useRegister.ts#7-12), [PasswordStrengthMeter](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/PasswordStrengthMeter.tsx#8-70) |
| [useRegister.ts](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useRegister.ts) (Hook) | [SignUp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx) | [auth.service.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts) |
| [auth.service.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts) (Service) | [useRegister.ts](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useRegister.ts) | Backend API |
| [auth.schemas.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.schemas.ts) (Schema) | - | [auth.types.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.types.ts) |
| [auth.types.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.types.ts) (Types) | [auth.schemas.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.schemas.ts) | [useRegister.ts](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useRegister.ts), [auth.service.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts) |
| [AuthLayout.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/AuthLayout.tsx) (Layout) | [SignUp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx) | Rendered Output |
| [PasswordInput.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/PasswordInput.tsx) (UI) | [SignUp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx) | User Visual Feedback |
| [PasswordStrengthMeter.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/PasswordStrengthMeter.tsx) (UI) | [SignUp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx) | User Visual Feedback |

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
