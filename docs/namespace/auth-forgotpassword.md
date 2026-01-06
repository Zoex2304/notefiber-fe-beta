# Dokumentasi Fitur: Forgot Password (Lupa Kata Sandi)

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend  
**Cakupan:** Request Reset Link â†’ Set New Password â†’ Sign In

---

## Alur Data Semantik (End-to-End)

```
[User Memasukkan Email di Forgot Password]
    -> [API Request ke Backend]
    -> [Backend Mengirim Email dengan Reset Link]
    -> [Tampilan Konfirmasi "Check Your Email"]
    -> [User Klik Link di Email]
    -> [Redirect ke Reset Password dengan Token]
    -> [User Memasukkan Password Baru]
    -> [API Request Reset Password]
    -> [Tampilan Sukses]
    -> [Redirect ke Sign In]
```

---

## A. Laporan Implementasi Fitur Forgot Password

### Deskripsi Fungsional

Fitur ini menyediakan mekanisme pemulihan akun bagi pengguna yang lupa kata sandi. Proses terdiri dari dua tahap terpisah:

**Tahap 1 - Request Reset Link:**
Pengguna memasukkan email yang terdaftar di halaman Forgot Password. Sistem mengirim request ke backend yang akan memproses dan mengirimkan email berisi link reset. Setelah request berhasil, UI berubah menjadi konfirmasi dengan instruksi untuk mengecek email.

**Tahap 2 - Reset Password:**
Pengguna mengakses link dari email yang membawa mereka ke halaman Reset Password dengan token terenkripsi sebagai query parameter. Pengguna memasukkan password baru dua kali (dengan confirm password). Setelah reset berhasil, UI menampilkan pesan sukses dengan tombol navigasi ke halaman Sign In.

**Penanganan Error:**
- Jika token tidak ada atau invalid, halaman Reset Password menampilkan pesan error dengan opsi untuk request link baru
- Jika password tidak sesuai criteria, validasi client-side memberikan feedback
- Error dari backend ditampilkan dalam alert box

### Visualisasi Alur

> [PLACEHOLDER SCREENSHOT - STEP 1]
> *Gambar 1: Halaman Forgot Password dengan field email.*

> [PLACEHOLDER SCREENSHOT - STEP 2]
> *Gambar 2: Konfirmasi "Check Your Email" setelah request berhasil.*

> [PLACEHOLDER SCREENSHOT - STEP 3]
> *Gambar 3: Halaman Reset Password dengan form password baru dan strength meter.*

> [PLACEHOLDER SCREENSHOT - STEP 4]
> *Gambar 4: Konfirmasi sukses setelah password berhasil direset.*

> [PLACEHOLDER SCREENSHOT - ERROR]
> *Gambar 5: Tampilan error ketika link reset invalid atau expired.*

---

## B. Bedah Arsitektur & Komponen - Tahap 1: Request Reset Link

---

### [src/routes/(auth)/forgot-password.tsx](file:///d:/notetaker/notefiber-FE/src/routes/%28auth%29/forgot-password.tsx)
**Layer Terdeteksi:** `Route Definition (TanStack Router)`

**Narasi Operasional:**

File ini mendefinisikan route `/forgot-password` dan menghubungkannya dengan page component [ForgotPassword](file:///d:/notetaker/notefiber-FE/src/pages/auth/ForgotPassword.tsx#27-123). Hook [beforeLoad](file:///d:/notetaker/notefiber-FE/src/routes/%28auth%29/validate-code.tsx#6-16) menerapkan reverse authentication guard â€” pengguna yang sudah memiliki token aktif di localStorage akan dialihkan ke `/app`, mencegah akses tidak perlu ke halaman recovery.

```tsx
export const Route = createFileRoute('/(auth)/forgot-password')({
    component: ForgotPassword,
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

### [src/pages/auth/ForgotPassword.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/ForgotPassword.tsx)
**Layer Terdeteksi:** `Page Component (Multi-State UI)`

**Narasi Operasional:**

Komponen ini mengelola dua state UI dalam satu halaman: form request dan konfirmasi sukses. State lokal `isSuccess` digunakan untuk toggle antara kedua tampilan. Formulir menggunakan React Hook Form dengan validasi Zod untuk memastikan format email valid.

Saat form di-submit, handler [onSubmit](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignIn.tsx#46-61) memanggil hook [useForgotPassword](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useForgotPassword.ts#7-12) dengan payload email. Jika request berhasil, callback [onSuccess](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignIn.tsx#54-58) mengubah `isSuccess` menjadi `true`, memicu render ulang yang menampilkan konfirmasi dengan email yang telah disubmit.

Tampilan konfirmasi mencakup ikon centang hijau, pesan informatif yang menyebutkan email tujuan, dan tombol untuk kembali ke Sign In.

```tsx
const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
});
```
*Caption: Snippet 2: Skema validasi sederhana untuk email.*

```tsx
function onSubmit(values: ForgotPasswordFormValues) {
    forgotPassword(
        { email: values.email },
        {
            onSuccess: () => {
                setIsSuccess(true);
            },
        }
    );
}
```
*Caption: Snippet 3: Handler submit dengan toggle state sukses.*

```tsx
if (isSuccess) {
    return (
        <AuthLayout title="Check your email">
            <div className="flex flex-col gap-6 text-center">
                <div className="flex justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <p className="text-gray-600">
                    We have sent a password reset link to <span className="font-medium">{form.getValues("email")}</span>.
                </p>
                <Link to="/signin" className="w-full">
                    <Button className="w-full">Back to Sign In</Button>
                </Link>
            </div>
        </AuthLayout>
    );
}
```
*Caption: Snippet 4: Tampilan konfirmasi setelah request berhasil.*

---

### [src/hooks/auth/useForgotPassword.ts](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useForgotPassword.ts)
**Layer Terdeteksi:** `Custom Hook (API Integration)`

**Narasi Operasional:**

Hook ini mengenkapsulasi panggilan API untuk request reset password menggunakan TanStack Query `useMutation`. Menerima email dari page component, meneruskannya ke `authService.forgotPassword`, dan mengembalikan state mutation untuk dikonsumsi oleh form. Response bertipe `null` karena endpoint hanya mengembalikan status sukses tanpa data tambahan.

```tsx
export const useForgotPassword = () => {
    return useMutation<ApiResponse<null>, ApiError, ForgotPasswordRequest>({
        mutationFn: (data) => authService.forgotPassword(data),
    });
};
```
*Caption: Snippet 5: Hook mutation untuk request forgot password.*

---

## C. Bedah Arsitektur & Komponen - Tahap 2: Reset Password

---

### [src/routes/(auth)/reset-password.tsx](file:///d:/notetaker/notefiber-FE/src/routes/%28auth%29/reset-password.tsx)
**Layer Terdeteksi:** `Route Definition (TanStack Router)`

**Narasi Operasional:**

File ini mendefinisikan route `/reset-password` dengan pola guard yang sama seperti forgot-password. Route ini diakses melalui link email yang membawa query parameter `token` yang digunakan untuk validasi dan otorisasi perubahan password.

```tsx
export const Route = createFileRoute('/(auth)/reset-password')({
    component: ResetPassword,
    beforeLoad: async () => {
        const token = localStorage.getItem('token')
        const refreshToken = localStorage.getItem('refreshToken')

        if (token && refreshToken) {
            throw redirect({ to: '/app', replace: true })
        }
    },
})
```
*Caption: Snippet 6: Route definition untuk halaman reset password.*

---

### [src/pages/auth/ResetPassword.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/ResetPassword.tsx)
**Layer Terdeteksi:** `Page Component (Conditional Multi-State)`

**Narasi Operasional:**

Komponen ini mengelola tiga kondisi UI berbeda: form reset, konfirmasi sukses, dan error invalid token. Hook `useSearch` mengekstrak parameter `token` dari URL yang dibawa oleh link reset dari email.

**Kondisi 1 - Token Valid:** Menampilkan form dengan dua field password (new dan confirm) beserta [PasswordStrengthMeter](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/PasswordStrengthMeter.tsx#8-70) untuk panduan visual. Validasi cross-field memastikan kedua password identik.

**Kondisi 2 - Reset Sukses:** Setelah API berhasil, `isSuccess` di-set `true` dan menampilkan konfirmasi dengan ikon centang dan tombol navigasi ke Sign In.

**Kondisi 3 - Token Invalid/Missing:** Jika parameter `token` tidak ada, menampilkan pesan error dengan opsi untuk request link baru.

```tsx
const resetPasswordSchema = z
    .object({
        newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
```
*Caption: Snippet 7: Skema validasi dengan cross-field validation.*

```tsx
function onSubmit(values: ResetPasswordFormValues) {
    if (!token) return;

    resetPassword(
        {
            token: token,
            new_password: values.newPassword,
            confirm_password: values.confirmPassword,
        },
        {
            onSuccess: () => {
                setIsSuccess(true);
            },
        }
    );
}
```
*Caption: Snippet 8: Handler submit dengan payload token dari URL.*

```tsx
if (!token) {
    return (
        <AuthLayout title="Invalid Link">
            <div className="flex flex-col gap-6 text-center">
                <div className="flex justify-center">
                    <AlertTriangle className="h-12 w-12 text-red-500" />
                </div>
                <p className="text-gray-600">
                    This password reset link is invalid or has expired.
                </p>
                <Link to="/forgot-password" className="w-full">
                    <Button className="w-full">Request New Link</Button>
                </Link>
            </div>
        </AuthLayout>
    );
}
```
*Caption: Snippet 9: Penanganan kondisi token invalid atau expired.*

---

### [src/hooks/auth/useResetPassword.ts](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useResetPassword.ts)
**Layer Terdeteksi:** `Custom Hook (API Integration)`

**Narasi Operasional:**

Hook ini mengenkapsulasi panggilan API untuk reset password. Menerima payload berisi `token`, `new_password`, dan `confirm_password` dari form, meneruskannya ke `authService.resetPassword`. State mutation dikembalikan untuk mengelola loading dan error states di UI.

```tsx
export const useResetPassword = () => {
    return useMutation<ApiResponse<null>, ApiError, ResetPasswordRequest>({
        mutationFn: (data) => authService.resetPassword(data),
    });
};
```
*Caption: Snippet 10: Hook mutation untuk reset password.*

---

### [src/api/services/auth/auth.service.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts)
**Layer Terdeteksi:** `Service Layer (API Client)`

**Narasi Operasional:**

File ini mengonsolidasikan method API untuk kedua tahap recovery. Method [forgotPassword](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts#22-26) mengirim POST ke endpoint `/auth/forgot-password` dengan email. Method [resetPassword](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts#27-31) mengirim POST ke endpoint `/auth/reset-password` dengan token dan password baru. Kedua method menggunakan `apiClient` terpusat.

```tsx
forgotPassword: async (data: Types.ForgotPasswordRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    return response.data;
},

resetPassword: async (data: Types.ResetPasswordRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>(ENDPOINTS.AUTH.RESET_PASSWORD, data);
    return response.data;
},
```
*Caption: Snippet 11: Method service untuk forgot dan reset password.*

---

### [src/api/services/auth/auth.schemas.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.schemas.ts)
**Layer Terdeteksi:** `Schema Definition (Validation Contract)`

**Narasi Operasional:**

File ini mendefinisikan skema Zod untuk request API. Schema `forgotPasswordRequestSchema` hanya memerlukan email valid. Schema `resetPasswordRequestSchema` memvalidasi token, password baru, dan confirm password dengan cross-field validation untuk memastikan kecocokan.

```tsx
export const forgotPasswordRequestSchema = z.object({
    email: emailSchema,
});

export const resetPasswordRequestSchema = z.object({
    token: z.string(),
    new_password: passwordSchema,
    confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});
```
*Caption: Snippet 12: Skema validasi untuk request forgot dan reset password.*

---

### [src/pages/auth/components/AuthLayout.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/AuthLayout.tsx)
**Layer Terdeteksi:** `Layout Component (Shared Presentation)`

**Narasi Operasional:**

Komponen ini digunakan kembali oleh kedua halaman (Forgot Password dan Reset Password) untuk memastikan konsistensi visual. Layout split-screen dengan ilustrasi di kiri dan form di kanan. Prop `title` dinamis sesuai konteks halaman.

---

### [src/pages/auth/components/PasswordStrengthMeter.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/PasswordStrengthMeter.tsx)
**Layer Terdeteksi:** `UI Component (Visual Feedback)`

**Narasi Operasional:**

Komponen ini digunakan di halaman Reset Password untuk memberikan panduan visual tentang kekuatan password baru. Mengevaluasi empat kriteria (panjang, angka, huruf kapital, karakter khusus) dan menampilkan progress bar dengan kode warna.

---

## D. Ringkasan Ketergantungan Komponen

| Tahap | Komponen | Menerima Dari | Meneruskan Ke |
|-------|----------|---------------|---------------|
| 1 | [forgot-password.tsx](file:///d:/notetaker/notefiber-FE/src/routes/%28auth%29/forgot-password.tsx) (Route) | Browser URL | [ForgotPassword.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/ForgotPassword.tsx) |
| 1 | [ForgotPassword.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/ForgotPassword.tsx) (Page) | User Input (Email) | [useForgotPassword](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useForgotPassword.ts#7-12) â†’ UI Success State |
| 1 | [useForgotPassword.ts](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useForgotPassword.ts) (Hook) | [ForgotPassword.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/ForgotPassword.tsx) | `authService.forgotPassword` â†’ Backend |
| 2 | [reset-password.tsx](file:///d:/notetaker/notefiber-FE/src/routes/%28auth%29/reset-password.tsx) (Route) | Email Link (dengan token) | [ResetPassword.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/ResetPassword.tsx) |
| 2 | [ResetPassword.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/ResetPassword.tsx) (Page) | URL Token + User Input | [useResetPassword](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useResetPassword.ts#7-12) â†’ UI Success State |
| 2 | [useResetPassword.ts](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useResetPassword.ts) (Hook) | [ResetPassword.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/ResetPassword.tsx) | `authService.resetPassword` â†’ Backend |

---

## E. Diagram Alur Pemulihan Password

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   User Input    â”‚â”€â”€â”€â”€>â”‚ useForgotPass   â”‚â”€â”€â”€â”€>â”‚  Backend API    â”‚
â”‚   (Email)       â”‚     â”‚   (Mutation)    â”‚     â”‚  /forgot-pass   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                        â”‚
                                                        â–¼
                                                â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                                                â”‚  Email dengan   â”‚
                                                â”‚  Reset Link     â”‚
                                                â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                        â”‚
                                                        â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   Sign In       â”‚<â”€â”€â”€â”€â”‚ useResetPass    â”‚<â”€â”€â”€â”€â”‚   User Input    â”‚
â”‚   Page          â”‚     â”‚   (Mutation)    â”‚     â”‚  (New Password) â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
