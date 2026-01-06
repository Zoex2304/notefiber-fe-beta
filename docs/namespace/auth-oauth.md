# Dokumentasi Fitur: Sign Up & Sign In dengan Google OAuth

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend  
**Metode Autentikasi:** Google OAuth 2.0 (Backend-Initiated Flow)

---

## Alur Data Semantik (End-to-End)

```
[User Klik "Sign in with Google"]
    -> [Redirect ke Backend OAuth Endpoint]
    -> [Backend Redirect ke Google Consent Screen]
    -> [User Memberikan Consent di Google]
    -> [Google Redirect Callback ke Backend]
    -> [Backend Generate JWT Token]
    -> [Backend Redirect ke Frontend dengan Token di URL]
    -> [AuthContext Detect Token di URL]
    -> [Token Disimpan ke localStorage]
    -> [URL Dibersihkan dari Token]
    -> [Fetch User Profile dari Backend]
    -> [AuthContext Update State isAuthenticated]
    -> [AuthGuard Izinkan Akses ke Workspace]
```

---

## A. Laporan Implementasi Fitur Google OAuth

### Deskripsi Fungsional

Fitur ini menyediakan mekanisme autentikasi menggunakan akun Google sebagai alternatif dari kredensial tradisional (email/password). Implementasi menggunakan **Backend-Initiated OAuth Flow** dimana:

1. Frontend hanya bertugas **menginisiasi redirect** ke endpoint OAuth backend
2. **Backend** menangani seluruh kompleksitas OAuth (redirect ke Google, menerima callback, validasi token Google, generate JWT)
3. Backend mengembalikan **JWT token via URL redirect** ke frontend
4. **AuthContext** secara otomatis mendeteksi dan memproses token dari URL

**Keuntungan Arsitektur Ini:**
- Client secret tidak pernah terekspos di frontend
- Frontend tetap sederhana dan tidak perlu mengelola OAuth state
- Satu button dapat digunakan untuk Sign In maupun Sign Up (backend yang menentukan apakah user baru atau existing)

### Visualisasi Alur

> [PLACEHOLDER SCREENSHOT - STEP 1]
> *Gambar 1: Halaman Sign In dengan opsi "Sign in with Google" di bagian atas.*

> [PLACEHOLDER SCREENSHOT - STEP 2]
> *Gambar 2: Halaman Sign Up dengan opsi "Sign in with Google" yang sama.*

> [PLACEHOLDER SCREENSHOT - STEP 3]
> *Gambar 3: Google Consent Screen yang muncul setelah user di-redirect.*

> [PLACEHOLDER SCREENSHOT - STEP 4]
> *Gambar 4: Halaman Workspace setelah berhasil autentikasi via Google.*

---

## B. Bedah Arsitektur & Komponen

---

### [src/pages/auth/components/GoogleSignInButton.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/GoogleSignInButton.tsx)
**Layer Terdeteksi:** `UI Component (OAuth Initiator)`

**Narasi Operasional:**

Komponen ini menyediakan tombol untuk menginisiasi alur Google OAuth. Saat diklik, handler `onClick` melakukan **hard redirect** (bukan navigasi SPA) ke endpoint backend `/api/auth/google` menggunakan `window.location.href`. Redirect ini memindahkan user sepenuhnya keluar dari aplikasi React ke server backend yang kemudian akan mengarahkan ke Google Consent Screen.

Komponen ini digunakan di dua tempat: halaman Sign In dan halaman Sign Up. Tidak ada perbedaan behavior karena penentuan apakah user baru (registrasi) atau existing (login) dilakukan oleh backend berdasarkan email Google yang diterima di callback.

```tsx
export function GoogleSignInButton() {
  return (
    <Button
      variant="outline"
      className="w-full h-12 gap-3 text-base font-normal"
      type="button"
      onClick={() => {
        // Redirect user to backend Google OAuth endpoint
        console.log("Redirecting to Google Auth Backend...");
        window.location.href = "http://localhost:3000/api/auth/google";
      }}
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="w-5 h-5"
      />
      Sign in with Google
    </Button>
  );
}
```
*Caption: Snippet 1: Button yang melakukan hard redirect ke backend OAuth.*

---

### [src/api/config/endpoints.ts](file:///d:/notetaker/notefiber-FE/src/api/config/endpoints.ts)
**Layer Terdeteksi:** `Configuration (API Endpoints)`

**Narasi Operasional:**

File ini mendefinisikan konstanta endpoint untuk seluruh API termasuk Google OAuth. Endpoint `GOOGLE` (`/auth/google`) adalah entry point yang menerima request dari frontend dan menginisiasi OAuth flow ke Google. Endpoint `GOOGLE_CALLBACK` (`/auth/google/callback`) adalah endpoint yang menerima callback dari Google setelah user memberikan consent.

Meskipun frontend tidak langsung memanggil endpoint ini via [fetch](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx#59-90) (karena menggunakan redirect), definisi disimpan untuk konsistensi dokumentasi dan kemungkinan penggunaan di masa depan.

```tsx
export const ENDPOINTS = {
    AUTH: {
        // ... other endpoints
        GOOGLE: '/auth/google',
        GOOGLE_CALLBACK: '/auth/google/callback',
    },
    // ...
} as const;
```
*Caption: Snippet 2: Definisi endpoint Google OAuth di konfigurasi.*

---

### [src/contexts/AuthContext.tsx](file:///d:/notetaker/notefiber-FE/src/contexts/AuthContext.tsx)
**Layer Terdeteksi:** `Context Provider (OAuth Token Handler)`

**Narasi Operasional:**

Komponen ini adalah pusat pengelolaan state autentikasi yang juga menangani flow OAuth. Effect [initAuth](file:///d:/notetaker/notefiber-FE/src/contexts/AuthContext.tsx#27-116) yang berjalan saat aplikasi dimuat melakukan pemeriksaan khusus untuk token di URL â€” mekanisme ini dirancang untuk menangkap token yang dikirim oleh backend setelah OAuth callback berhasil.

**Alur Penanganan OAuth Token:**
1. `URLSearchParams` mengekstrak parameter `token` atau `access_token` dari URL
2. Jika token ditemukan di URL, disimpan ke localStorage via `tokenStorage.setToken()`
3. URL dibersihkan menggunakan `window.history.replaceState()` untuk menghilangkan token dari address bar (keamanan)
4. Profile user di-fetch dari backend menggunakan token tersebut
5. Jika berhasil, state `user` diupdate dan `isAuthenticated` menjadi `true`

Mekanisme ini bersifat transparan â€” user tidak perlu melakukan aksi tambahan setelah memberikan consent di Google. AuthContext secara otomatis memproses token dan mengautentikasi user.

```tsx
useEffect(() => {
    const initAuth = async () => {
        // Check for token in URL (OAuth redirect)
        const searchParams = new URLSearchParams(window.location.search);
        const urlToken = searchParams.get('token') || searchParams.get('access_token');
        const storedToken = tokenStorage.getToken();

        debugLog.info("AuthContext Init: Checking for token", { urlToken: !!urlToken, storedToken: !!storedToken });

        const token = urlToken || storedToken;

        if (urlToken) {
            // If token comes from URL, save it and clean URL
            debugLog.info("AuthContext: Found URL token, saving...");
            tokenStorage.setToken(urlToken);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (token) {
            try {
                const response = await userService.getProfile();
                if (response.success && response.data) {
                    setUser(response.data as unknown as User);
                }
            } catch (error) {
                // Handle token refresh or clear...
            }
        }
        setIsLoading(false);
    };

    initAuth();
}, []);
```
*Caption: Snippet 3: Effect yang mendeteksi dan memproses OAuth token dari URL.*

---

### [src/utils/storage/token.storage.ts](file:///d:/notetaker/notefiber-FE/src/utils/storage/token.storage.ts)
**Layer Terdeteksi:** `Utility (Token Persistence)`

**Narasi Operasional:**

File ini menyediakan abstraksi untuk operasi penyimpanan token di localStorage. Dalam konteks OAuth, method [setToken](file:///d:/notetaker/notefiber-FE/src/utils/storage/token.storage.ts#17-20) dipanggil oleh AuthContext untuk menyimpan access token yang diterima dari URL callback. Method [getToken](file:///d:/notetaker/notefiber-FE/src/utils/storage/token.storage.ts#13-16) digunakan untuk mengambil token saat melakukan API request atau memeriksa status autentikasi.

Konstanta `STORAGE_KEYS` memastikan konsistensi key yang digunakan untuk menyimpan berbagai jenis data autentikasi.

```tsx
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
};

export const tokenStorage = {
    getToken: (): string | null => {
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    },

    setToken: (token: string): void => {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    },

    clearAll: (): void => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
};
```
*Caption: Snippet 4: Utility penyimpanan token dengan key terstandarisasi.*

---

### [src/pages/auth/SignIn.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignIn.tsx)
**Layer Terdeteksi:** `Page Component (OAuth Integration)`

**Narasi Operasional:**

Halaman Sign In mengintegrasikan [GoogleSignInButton](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/GoogleSignInButton.tsx#3-24) sebagai opsi autentikasi alternatif. Komponen ditempatkan di bagian atas form, diikuti dengan divider "Or", lalu form kredensial tradisional. Layout ini memberikan prioritas visual pada opsi OAuth sebagai metode yang lebih cepat dan convenient.

```tsx
import { GoogleSignInButton } from "./components/GoogleSignInButton";

export default function SignIn() {
    // ... form logic

    return (
        <AuthLayout title="Sign In">
            <div className="flex flex-col gap-6">
                <GoogleSignInButton />

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                </div>

                {/* Traditional credential form */}
            </div>
        </AuthLayout>
    );
}
```
*Caption: Snippet 5: Integrasi Google button di halaman Sign In.*

---

### [src/pages/auth/SignUp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignUp.tsx)
**Layer Terdeteksi:** `Page Component (OAuth Integration)`

**Narasi Operasional:**

Sama seperti Sign In, halaman Sign Up juga mengintegrasikan [GoogleSignInButton](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/GoogleSignInButton.tsx#3-24) di posisi yang sama. Ini memungkinkan user baru untuk mendaftar menggunakan akun Google tanpa harus mengisi form registrasi manual. Backend akan otomatis membuat akun baru jika email Google belum terdaftar.

```tsx
import { GoogleSignInButton } from "./components/GoogleSignInButton";

export default function SignUp() {
    // ... form logic

    return (
        <AuthLayout title="Sign Up">
            <div className="flex flex-col gap-6">
                <GoogleSignInButton />

                <div className="relative">
                    {/* Divider "Or" */}
                </div>

                {/* Traditional registration form */}
            </div>
        </AuthLayout>
    );
}
```
*Caption: Snippet 6: Integrasi Google button di halaman Sign Up.*

---

### [src/components/auth/AuthGuard.tsx](file:///d:/notetaker/notefiber-FE/src/components/auth/AuthGuard.tsx)
**Layer Terdeteksi:** `Guard Component (Post-OAuth Protection)`

**Narasi Operasional:**

Setelah OAuth berhasil dan AuthContext memperbarui state, AuthGuard memvalidasi status autentikasi untuk mengizinkan akses ke protected routes. Tidak ada logika khusus untuk OAuth â€” komponen ini hanya memeriksa `isAuthenticated` yang bernilai `true` setelah token dari OAuth diproses oleh AuthContext.

---

### [src/pages/MainApp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx)
**Layer Terdeteksi:** `Page Component (Post-OAuth Destination)`

**Narasi Operasional:**

Ini adalah halaman tujuan akhir setelah autentikasi OAuth berhasil. User yang login via Google akan melihat workspace yang sama dengan user yang login via kredensial tradisional. Data user (nama, email, avatar) yang ditampilkan berasal dari profile yang di-fetch AuthContext menggunakan token OAuth.

---

## C. Ringkasan Ketergantungan Komponen

| Tahap | Komponen | Aksi | Hasil |
|-------|----------|------|-------|
| 1 | [GoogleSignInButton.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/GoogleSignInButton.tsx) | Hard redirect ke backend | User meninggalkan SPA |
| 2 | Backend `/auth/google` | Redirect ke Google | Google Consent Screen |
| 3 | Google | User consent | Redirect callback ke backend |
| 4 | Backend `/auth/google/callback` | Generate JWT, redirect ke frontend | Frontend URL + token |
| 5 | [AuthContext.tsx](file:///d:/notetaker/notefiber-FE/src/contexts/AuthContext.tsx) | Detect token di URL | Token disimpan, URL dibersihkan |
| 6 | [AuthContext.tsx](file:///d:/notetaker/notefiber-FE/src/contexts/AuthContext.tsx) | Fetch user profile | State `isAuthenticated = true` |
| 7 | [AuthGuard.tsx](file:///d:/notetaker/notefiber-FE/src/components/auth/AuthGuard.tsx) | Validasi autentikasi | Izinkan akses ke workspace |
| 8 | [MainApp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx) | Render workspace | User melihat aplikasi |

---

## D. Diagram Alur OAuth

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                           â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   FRONTEND      â”‚                           â”‚   BACKEND       â”‚
â”‚   (React SPA)   â”‚                           â”‚   (Go Server)   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜                           â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚                                             â”‚
         â”‚  1. Click "Sign in with Google"             â”‚
         â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>
         â”‚                                             â”‚
         â”‚  2. Redirect(302) to Google                 â”‚
         <â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚
         â”‚                                             â”‚
         â”‚         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                 â”‚
         â”‚         â”‚   GOOGLE        â”‚                 â”‚
         â”‚         â”‚   (OAuth)       â”‚                 â”‚
         â”‚         â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜                 â”‚
         â”‚                  â”‚                          â”‚
         â”‚  3. User consent â”‚                          â”‚
         â”‚                  â”‚                          â”‚
         â”‚  4. Callback with auth code                 â”‚
         â”‚                  â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€>â”‚
         â”‚                  â”‚                          â”‚
         â”‚                  â”‚  5. Exchange code for    â”‚
         â”‚                  â”‚     Google token         â”‚
         â”‚                  â”‚                          â”‚
         â”‚                  â”‚  6. Get user info        â”‚
         â”‚                  â”‚                          â”‚
         â”‚                  â”‚  7. Create/Find user     â”‚
         â”‚                  â”‚     Generate JWT         â”‚
         â”‚                  â”‚                          â”‚
         â”‚  8. Redirect to frontend + token in URL     â”‚
         <â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚
         â”‚                                             â”‚
    â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                        â”‚
    â”‚ AuthContext detects     â”‚                        â”‚
    â”‚ token in URL:           â”‚                        â”‚
    â”‚ - Save to localStorage  â”‚                        â”‚
    â”‚ - Clean URL             â”‚                        â”‚
    â”‚ - Fetch user profile    â”‚                        â”‚
    â”‚ - Set isAuthenticated   â”‚                        â”‚
    â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                        â”‚
         â”‚                                             â”‚
         â”‚  User now authenticated                     â”‚
         â”‚  Render Workspace                           â”‚
         â–¼                                             â”‚
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                â”‚
    â”‚   MainApp.tsx   â”‚                                â”‚
    â”‚   (Workspace)   â”‚                                â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                â”‚
```

---

## E. Perbedaan dengan Kredensial Tradisional

| Aspek | Kredensial Tradisional | Google OAuth |
|-------|------------------------|--------------|
| **User Input** | Email, Password | Klik button saja |
| **Validasi** | Client-side (Zod) + Server | Google + Server |
| **Token Delivery** | API Response body | URL Query Parameter |
| **Registrasi** | Form terpisah (Sign Up) | Otomatis di Sign In/Up |
| **Password** | Disimpan (hashed) | Tidak ada |
| **Email Verification** | Diperlukan (OTP) | Sudah verified oleh Google |

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
