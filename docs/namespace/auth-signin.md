# Dokumentasi Fitur: Authentikasi - Sign In hingga Workspace

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend  
**Metode Login:** Traditional Credential (Email & Password)

---

## Alur Data Semantik (End-to-End)

```
[User Mengisi Formulir Sign In]
    -> [Validasi Client-Side]
    -> [API Request Login]
    -> [Response: Access Token + User Data]
    -> [Penyimpanan Token ke localStorage]
    -> [Update Auth Context (isAuthenticated = true)]
    -> [Navigasi ke /app]
    -> [AuthGuard Memvalidasi Status Autentikasi]
    -> [Render Halaman Workspace (MainApp)]
```

---

## A. Laporan Implementasi Fitur Sign In

### Deskripsi Fungsional

Fitur ini menyediakan mekanisme login pengguna menggunakan kredensial email dan password. Sistem mengimplementasikan validasi client-side untuk memastikan format email valid dan password terisi sebelum pengiriman ke backend.

**Alur Operasional:**
1. Pengguna memasukkan email dan password di formulir Sign In
2. Opsional: Pengguna dapat mengaktifkan "Remember Me" untuk sesi yang lebih panjang
3. Setelah submit, hook [useLogin](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useLogin.ts#10-33) mengirim request ke endpoint `/auth/login`
4. Jika berhasil, sistem menerima `access_token`, `refresh_token`, dan data user
5. Token disimpan ke localStorage, dan AuthContext diupdate dengan data user
6. Pengguna dialihkan ke `/app` (halaman Workspace)
7. AuthGuard memvalidasi status autentikasi sebelum merender Workspace

**Proteksi Route:**
- Halaman Sign In dilindungi dengan **reverse guard** â€” pengguna yang sudah terauthentikasi dialihkan ke `/app`
- Halaman Workspace dilindungi dengan **AuthGuard** â€” pengguna yang tidak terauthentikasi dialihkan ke `/signin`

### Visualisasi Alur

> [PLACEHOLDER SCREENSHOT - STEP 1]
> *Gambar 1: Halaman Sign In dengan formulir login, opsi "Remember Me", dan link ke Forgot Password.*

> [PLACEHOLDER SCREENSHOT - STEP 2]
> *Gambar 2: Loading state saat proses autentikasi berlangsung.*

> [PLACEHOLDER SCREENSHOT - STEP 3]
> *Gambar 3: Halaman Workspace (MainApp) setelah berhasil login â€” menampilkan sidebar notebooks dan area editor.*

---

## B. Bedah Arsitektur & Komponen

---

### [src/routes/(auth)/signin.tsx](file:///d:/notetaker/notefiber-FE/src/routes/%28auth%29/signin.tsx)
**Layer Terdeteksi:** `Route Definition (TanStack Router)`

**Narasi Operasional:**

File ini mendefinisikan route `/signin` dan menghubungkannya dengan page component [SignIn](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignIn.tsx#33-169). Hook [beforeLoad](file:///d:/notetaker/notefiber-FE/src/routes/%28auth%29/signup.tsx#6-16) memeriksa keberadaan token di localStorage sebelum halaman dirender â€” jika `token` dan [refreshToken](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts#37-41) ditemukan, pengguna dianggap sudah terauthentikasi dan dialihkan ke `/app` menggunakan mekanisme redirect. Konfigurasi ini mencegah pengguna yang sudah login mengakses halaman sign in secara tidak sengaja.

```tsx
export const Route = createFileRoute('/(auth)/signin')({
    component: SignIn,
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

### [src/pages/auth/SignIn.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignIn.tsx)
**Layer Terdeteksi:** `Page Component (Form Orchestration)`

**Narasi Operasional:**

Komponen ini mengorkestrasi seluruh interaksi login pengguna. Formulir dikelola oleh React Hook Form dengan validasi Zod yang mencakup tiga field: `email` (format valid), `password` (wajib diisi), dan `rememberMe` (boolean). Hook [useLogin](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useLogin.ts#10-33) dipanggil untuk menangani pengiriman data ke backend.

Saat form di-submit, handler [onSubmit](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignIn.tsx#46-61) mentransformasi data form ke format API request dengan pemetaan `rememberMe` â†’ `remember_me`. Jika login berhasil, callback [onSuccess](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignIn.tsx#54-58) mengarahkan pengguna ke `/app`. Tampilan error dari backend ditangani melalui objek `error` yang dikembalikan oleh hook mutation.

Formulir juga menyediakan link ke halaman "Forgot Password" dan opsi alternatif Google Sign In (di luar scope dokumentasi ini).

```tsx
const signInSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
    rememberMe: z.boolean(),
});
```
*Caption: Snippet 2: Skema validasi formulir Sign In.*

```tsx
function onSubmit(values: SignInFormValues) {
    login(
        {
            email: values.email,
            password: values.password,
            remember_me: values.rememberMe,
        },
        {
            onSuccess: () => {
                debugLog.info("SignIn: Redirecting to /app");
                navigate({ to: "/app" });
            },
        }
    );
}
```
*Caption: Snippet 3: Form submission dengan navigasi ke Workspace setelah sukses.*

---

### [src/hooks/auth/useLogin.ts](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useLogin.ts)
**Layer Terdeteksi:** `Custom Hook (API Integration + State Management)`

**Narasi Operasional:**

Hook ini mengenkapsulasi logika login yang kompleks dengan menggabungkan panggilan API dan manajemen state autentikasi. Menggunakan TanStack Query `useMutation` untuk mengirim request ke `authService.login`, hook ini juga mengintegrasikan [useAuth](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useAuth.ts#3-6) untuk memperbarui AuthContext setelah login berhasil.

Callback [onSuccess](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignIn.tsx#54-58) menangani tiga operasi penting:
1. Menyimpan `refresh_token` ke localStorage melalui `tokenStorage`
2. Memanggil function [login](file:///d:/notetaker/notefiber-FE/src/contexts/AuthContext.tsx#120-125) dari AuthContext dengan `access_token` dan data `user`
3. Memperbarui state global sehingga komponen lain dapat mengetahui status autentikasi

Callback [onError](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useLogin.ts#28-31) mencatat kegagalan login untuk keperluan debugging.

```tsx
export const useLogin = () => {
    const { login } = useAuth();

    return useMutation<ApiResponse<LoginData>, ApiError, LoginRequest>({
        mutationFn: async (data) => {
            debugLog.info("useLogin: Attempting login", { email: data.email });
            return await authService.login(data);
        },
        onSuccess: (response) => {
            debugLog.info("useLogin: Success", response);
            if (response.data) {
                if (response.data.refresh_token) {
                    tokenStorage.setRefreshToken(response.data.refresh_token);
                }
                login(response.data.access_token, response.data.user);
            }
        },
        onError: (error) => {
            debugLog.error("useLogin: Failed", error);
        }
    });
};
```
*Caption: Snippet 4: Hook mutation dengan integrasi AuthContext dan token storage.*

---

### [src/contexts/AuthContext.tsx](file:///d:/notetaker/notefiber-FE/src/contexts/AuthContext.tsx)
**Layer Terdeteksi:** `Context Provider (Global State Management)`

**Narasi Operasional:**

Komponen ini menyediakan state autentikasi global yang dapat diakses oleh seluruh aplikasi melalui React Context. State yang dikelola mencakup: `user` (data pengguna), `isAuthenticated` (status login), dan `isLoading` (status inisialisasi).

Saat aplikasi dimuat, effect [initAuth](file:///d:/notetaker/notefiber-FE/src/contexts/AuthContext.tsx#27-116) melakukan serangkaian pemeriksaan:
1. Mengecek keberadaan token di URL (untuk OAuth redirect) atau localStorage
2. Jika token ditemukan, memvalidasi dengan memanggil `userService.getProfile`
3. Jika validasi gagal, mencoba refresh token menggunakan `authService.refreshToken`
4. Jika semuanya gagal, membersihkan storage dan mengeset user ke null

Function [login](file:///d:/notetaker/notefiber-FE/src/contexts/AuthContext.tsx#120-125) yang dipanggil oleh [useLogin](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useLogin.ts#10-33) menyimpan token dan data user ke localStorage, kemudian memperbarui state `user`. Perubahan ini menyebabkan `isAuthenticated` menjadi `true`, yang memicu re-render pada komponen yang bergantung pada status autentikasi.

```tsx
const login = (token: string, userData: User) => {
    tokenStorage.setToken(token);
    tokenStorage.setUserData(userData);
    setUser(userData);
};
```
*Caption: Snippet 5: Function login yang memperbarui storage dan state.*

```tsx
return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser }}>
        {children}
    </AuthContext.Provider>
);
```
*Caption: Snippet 6: Provider dengan nilai `isAuthenticated` yang diturunkan dari state `user`.*

---

### [src/hooks/auth/useAuth.ts](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useAuth.ts)
**Layer Terdeteksi:** `Custom Hook (Context Accessor)`

**Narasi Operasional:**

Hook ini menyediakan akses sederhana ke AuthContext. Merupakan thin wrapper di atas [useAuthContext](file:///d:/notetaker/notefiber-FE/src/contexts/AuthContext.tsx#157-164) yang memungkinkan komponen dan hook lain mengakses state dan function autentikasi (`user`, `isAuthenticated`, `isLoading`, [login](file:///d:/notetaker/notefiber-FE/src/contexts/AuthContext.tsx#120-125), [logout](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts#32-36), [updateUser](file:///d:/notetaker/notefiber-FE/src/contexts/AuthContext.tsx#145-149)) tanpa harus import context secara langsung.

```tsx
export const useAuth = () => {
    return useAuthContext();
};
```
*Caption: Snippet 7: Accessor hook untuk AuthContext.*

---

### [src/routes/_authenticated.tsx](file:///d:/notetaker/notefiber-FE/src/routes/_authenticated.tsx)
**Layer Terdeteksi:** `Route Layout (Protected Route Parent)`

**Narasi Operasional:**

File ini mendefinisikan layout route untuk semua halaman yang memerlukan autentikasi. Menggunakan komponen [AuthGuard](file:///d:/notetaker/notefiber-FE/src/components/auth/AuthGuard.tsx#5-33) sebagai component utama, semua child route di bawah path `/_authenticated` akan melewati pengecekan autentikasi terlebih dahulu. Jika pengguna tidak terauthentikasi, mereka akan dialihkan ke halaman sign in.

```tsx
export const Route = createFileRoute('/_authenticated')({
    component: AuthGuard,
})
```
*Caption: Snippet 8: Layout route dengan AuthGuard sebagai gatekeeper.*

---

### [src/components/auth/AuthGuard.tsx](file:///d:/notetaker/notefiber-FE/src/components/auth/AuthGuard.tsx)
**Layer Terdeteksi:** `Guard Component (Route Protection)`

**Narasi Operasional:**

Komponen ini berfungsi sebagai gatekeeper untuk semua route yang memerlukan autentikasi. Menggunakan hook [useAuth](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useAuth.ts#3-6) untuk mendapatkan status autentikasi, komponen ini menangani tiga kondisi:

1. **Loading:** Saat `isLoading` bernilai `true`, menampilkan spinner loading untuk mencegah flash of content
2. **Not Authenticated:** Saat `isAuthenticated` bernilai `false`, effect `useEffect` mengarahkan pengguna ke `/signin` dengan menyertakan path asli sebagai search parameter `from` (untuk redirect kembali setelah login)
3. **Authenticated:** Saat `isAuthenticated` bernilai `true`, merender `<Outlet />` yang menampilkan child route (seperti Workspace)

```tsx
export const AuthGuard = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const router = useRouter();
    const location = router.state.location;

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            console.log("AuthGuard: Redirecting to signin", { isLoading, isAuthenticated, path: location.pathname });
            navigate({ to: "/signin", search: { from: location.pathname } });
        }
    }, [isLoading, isAuthenticated, navigate, location]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <Outlet />;
};
```
*Caption: Snippet 9: AuthGuard dengan penanganan loading, redirect, dan rendering child routes.*

---

### [src/routes/_authenticated/app.tsx](file:///d:/notetaker/notefiber-FE/src/routes/_authenticated/app.tsx)
**Layer Terdeteksi:** `Route Definition (Nested Layout)`

**Narasi Operasional:**

File ini mendefinisikan route `/app` sebagai nested layout di bawah `_authenticated`. Komponen hanya merender `<Outlet />` yang memungkinkan child route (seperti [app.index.tsx](file:///d:/notetaker/notefiber-FE/src/routes/_authenticated/app.index.tsx)) ditampilkan. Struktur ini memisahkan concern routing dari concern rendering komponen aktual.

```tsx
export const Route = createFileRoute('/_authenticated/app')({
    component: () => <Outlet />,
})
```
*Caption: Snippet 10: Nested route layout untuk path /app.*

---

### [src/routes/_authenticated/app.index.tsx](file:///d:/notetaker/notefiber-FE/src/routes/_authenticated/app.index.tsx)
**Layer Terdeteksi:** `Route Definition (Index Route)`

**Narasi Operasional:**

File ini mendefinisikan index route untuk path `/app/` yang menghubungkan ke komponen [MainApp](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx#37-437). Ketika pengguna mengakses `/app`, route ini akan dicocokkan dan merender halaman Workspace utama.

```tsx
export const Route = createFileRoute('/_authenticated/app/')({
    component: MainApp,
})
```
*Caption: Snippet 11: Index route yang memetakan ke MainApp.*

---

### [src/pages/MainApp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx)
**Layer Terdeteksi:** `Page Component (Workspace Dashboard)`

**Narasi Operasional:**

Komponen ini merupakan halaman utama aplikasi yang ditampilkan setelah pengguna berhasil login. MainApp menyediakan antarmuka Workspace lengkap dengan beberapa area fungsional:

**Komponen Utama:**
- **TopBar:** Navigasi global dengan tombol Search dan AI Chat
- **Sidebar:** Panel kiri yang menampilkan hierarki Notebooks dan Notes dengan fitur drag-and-drop
- **NoteEditor:** Area utama untuk mengedit konten note yang dipilih
- **Empty State:** Tampilan placeholder saat tidak ada note yang dipilih

**State Management:**
Komponen mengelola berbagai state lokal untuk notebooks, notes, selection, dan status operasi (creating, deleting, moving). Effect `useEffect` memanggil [fetchAllNotebooks](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx#59-90) saat mount untuk mengambil data awal dari backend.

**Integrasi Subscription:**
Menggunakan `useSubscription` dan `useUsageLimits` untuk memeriksa permission dan batas penggunaan sebelum operasi seperti create notebook/note atau akses fitur premium (AI Chat, Semantic Search).

```tsx
export default function MainApp() {
  const { checkPermission } = useSubscription();
  const { checkCanCreateNotebook, checkCanCreateNote, checkCanUseAiChat, checkCanUseSemanticSearch } = useUsageLimits();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  // ... state lainnya

  useEffect(() => {
    fetchAllNotebooks();
  }, []);
  // ...
}
```
*Caption: Snippet 12: Inisialisasi state dan data fetching pada MainApp.*

```tsx
return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <TopBar onSearchClick={handleSearchClick} onChatClick={handleChatClick} />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          {/* Action Buttons & Sidebar */}
          <Sidebar notebooks={notebooks} notes={notes} {...props} />
        </div>
        <div className="flex-1 flex flex-col bg-white overflow-x-hidden">
          {currentNote ? (
            <NoteEditor note={currentNote} onUpdate={handleNoteUpdate} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              {/* Empty State */}
            </div>
          )}
        </div>
      </div>
      {/* Dialogs */}
    </div>
);
```
*Caption: Snippet 13: Struktur layout MainApp dengan TopBar, Sidebar, dan area konten utama.*

---

### [src/api/services/auth/auth.service.ts](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts)
**Layer Terdeteksi:** `Service Layer (API Client)`

**Narasi Operasional:**

File ini mengonsolidasikan seluruh operasi API untuk modul authentikasi. Method [login](file:///d:/notetaker/notefiber-FE/src/contexts/AuthContext.tsx#120-125) mengirim HTTP POST ke endpoint `/auth/login` dengan payload berisi email, password, dan remember_me flag. Response berisi `access_token`, `refresh_token` (opsional), dan data `user` yang dikembalikan ke hook pemanggil.

```tsx
login: async (data: Types.LoginRequest): Promise<ApiResponse<Types.LoginData>> => {
    const response = await apiClient.post<ApiResponse<Types.LoginData>>(ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
},
```
*Caption: Snippet 14: Method login dalam auth service.*

---

### [src/pages/auth/components/AuthLayout.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/components/AuthLayout.tsx)
**Layer Terdeteksi:** `Layout Component (Shared Presentation)`

**Narasi Operasional:**

Komponen ini menyediakan struktur tata letak konsisten untuk seluruh halaman authentikasi. Layout menggunakan pendekatan split-screen: sisi kiri menampilkan ilustrasi visual, sisi kanan menampung formulir. Komponen ini dibagi dengan halaman Sign Up dan digunakan oleh Sign In untuk memastikan konsistensi branding dan UX.

```tsx
export function AuthLayout({ children, title }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full bg-white relative">
            <div className="absolute top-8 left-8 z-50">
                <Link to="/"><Logo variant="horizontal" size="lg" /></Link>
            </div>
            <div className="hidden lg:flex w-1/2 bg-royal-violet-light/10 relative overflow-hidden">
                <img src="..." alt="Auth Illustration" />
            </div>
            <div className="flex w-full lg:w-1/2 items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-md flex flex-col gap-8">
                    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    {children}
                </div>
            </div>
        </div>
    );
}
```
*Caption: Snippet 15: Layout split-screen untuk halaman authentikasi.*

---

## C. Ringkasan Ketergantungan Komponen

| Tahap | Komponen | Menerima Dari | Meneruskan Ke |
|-------|----------|---------------|---------------|
| 1 | [signin.tsx](file:///d:/notetaker/notefiber-FE/src/routes/%28auth%29/signin.tsx) (Route) | Browser URL | [SignIn.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignIn.tsx) |
| 1 | [SignIn.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignIn.tsx) (Page) | User Input | [useLogin](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useLogin.ts#10-33) â†’ navigasi ke `/app` |
| 2 | [useLogin.ts](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useLogin.ts) (Hook) | [SignIn.tsx](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignIn.tsx) | `authService.login` â†’ `AuthContext.login` |
| 2 | [AuthContext.tsx](file:///d:/notetaker/notefiber-FE/src/contexts/AuthContext.tsx) (Context) | [useLogin.ts](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useLogin.ts) | State global `isAuthenticated` |
| 3 | [_authenticated.tsx](file:///d:/notetaker/notefiber-FE/src/routes/_authenticated.tsx) (Layout) | TanStack Router | [AuthGuard.tsx](file:///d:/notetaker/notefiber-FE/src/components/auth/AuthGuard.tsx) |
| 3 | [AuthGuard.tsx](file:///d:/notetaker/notefiber-FE/src/components/auth/AuthGuard.tsx) (Guard) | [useAuth](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useAuth.ts#3-6) (AuthContext) | `<Outlet />` atau redirect ke `/signin` |
| 4 | [app.tsx](file:///d:/notetaker/notefiber-FE/src/routes/_authenticated/app.tsx) (Route) | [AuthGuard](file:///d:/notetaker/notefiber-FE/src/components/auth/AuthGuard.tsx#5-33) | `<Outlet />` |
| 4 | [app.index.tsx](file:///d:/notetaker/notefiber-FE/src/routes/_authenticated/app.index.tsx) (Route) | [app.tsx](file:///d:/notetaker/notefiber-FE/src/routes/_authenticated/app.tsx) | [MainApp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx) |
| 5 | [MainApp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx) (Page) | Route System | Render Workspace UI |

---

## D. Diagram Alur Autentikasi

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   User Input    â”‚â”€â”€â”€â”€>â”‚   useLogin      â”‚â”€â”€â”€â”€>â”‚  Backend API    â”‚
â”‚ (Email + Pass)  â”‚     â”‚   (Mutation)    â”‚     â”‚  /auth/login    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                        â”‚
                                                        â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   MainApp       â”‚<â”€â”€â”€â”€â”‚   AuthGuard     â”‚<â”€â”€â”€â”€â”‚   AuthContext   â”‚
â”‚   (Workspace)   â”‚     â”‚   (Validator)   â”‚     â”‚  (State Update) â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
