# Dokumentasi Fitur: Admin Authentication

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend (Admin App)  
**Lokasi:** `admin/src/`

---

## Alur Data Semantik

```
[Admin Akses /admin/*]
    -> [AdminAuthGuard Check isAuthenticated]
    -> [NOT Authenticated] -> Redirect ke /admin/sign-in-2
        -> [Login Form: email + password]
        -> [Submit] -> API POST /admin/login
        -> [Success] -> Store tokens di localStorage
        -> [Redirect ke stored location atau Dashboard]
    -> [Authenticated] -> Render AuthenticatedLayout
        -> [AppSidebar + Content Area]
        -> [Dashboard / Plans / Users / etc.]
```

---

## A. Laporan Implementasi Fitur Admin Authentication

### Deskripsi Fungsional

Fitur ini mengelola autentikasi admin untuk mengakses admin panel. Sistem autentikasi terpisah dari user app â€” menggunakan endpoint, context, dan token storage yang berbeda.

**Komponen Utama:**

| Komponen | Fungsi |
|----------|--------|
| `AdminAuthContext` | Global state untuk admin auth (login, logout, isAuthenticated) |
| `AdminAuthGuard` | Komponen guard untuk protected routes |
| `SignIn2` | Halaman sign-in dengan split-screen layout |
| `UserAuthForm` | Form login dengan email + password |
| `AuthenticatedLayout` | Layout wrapper dengan sidebar untuk authenticated pages |

**Token Storage:**

| Key | Deskripsi |
|-----|-----------|
| `admin_token` | JWT access token |
| `admin_refresh_token` | JWT refresh token |
| `admin_user` | JSON user object (id, email, full_name, role) |
| `admin_redirect` | Intended destination sebelum redirect ke login |

### Visualisasi

> [PLACEHOLDER SCREENSHOT - SIGN IN PAGE]
> *Gambar 1: Admin Sign In page dengan split-screen layout (form kiri, dashboard preview kanan).*

> [PLACEHOLDER SCREENSHOT - LOGIN FORM]
> *Gambar 2: Login form dengan email, password, dan social login buttons.*

> [PLACEHOLDER SCREENSHOT - LOADING STATE]
> *Gambar 3: Loading spinner saat auth state checking.*

> [PLACEHOLDER SCREENSHOT - DASHBOARD AFTER LOGIN]
> *Gambar 4: Dashboard setelah login berhasil dengan sidebar.*

> [PLACEHOLDER SCREENSHOT - SIDEBAR NAVIGATION]
> *Gambar 5: App sidebar dengan menu navigasi admin.*

---

## B. Bedah Arsitektur & Komponen

---

### `admin/src/contexts/AdminAuthContext.tsx`
**Layer Terdeteksi:** `Context Provider (Auth State Management)`

**Narasi Operasional:**

Context ini menyimpan state autentikasi admin secara global. Saat mount, effect mengecek `admin_token` dan `admin_user` di localStorage untuk restore session. Menyediakan `login` function yang memanggil API dan menyimpan response tokens.

```tsx
interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    role: 'admin';
}

interface AdminAuthContextType {
    admin: AdminUser | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        const storedAdmin = localStorage.getItem('admin_user');

        if (token && storedAdmin) {
            try {
                setAdmin(JSON.parse(storedAdmin));
            } catch (error) {
                console.error('Failed to parse stored admin data:', error);
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/admin/login`, { email, password });

            // Response: { access_token, refresh_token, user: { id, email, full_name, role } }
            const { access_token, refresh_token, user } = response.data.data;

            const adminUser: AdminUser = {
                id: user.id,
                email: user.email,
                full_name: user.full_name || 'Admin',
                role: user.role || 'admin'
            };

            localStorage.setItem('admin_token', access_token);
            if (refresh_token) {
                localStorage.setItem('admin_refresh_token', refresh_token);
            }
            localStorage.setItem('admin_user', JSON.stringify(adminUser));

            setAdmin(adminUser);
        } catch (error) {
            console.error('Admin login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setAdmin(null);
    };

    return (
        <AdminAuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin, isLoading }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};
```
*Caption: Snippet 1: AdminAuthContext dengan login, logout, dan session restore.*

---

### `admin/src/components/auth/AdminAuthGuard.tsx`
**Layer Terdeteksi:** `Route Guard Component`

**Narasi Operasional:**

Komponen ini melindungi routes yang membutuhkan autentikasi. Menggunakan `useEffect` untuk redirect ke sign-in jika tidak authenticated. Menyimpan intended destination di `admin_redirect` localStorage untuk redirect back setelah login.

```tsx
export function AdminAuthGuard() {
    const { isAuthenticated, isLoading } = useAdminAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Store intended destination
            const currentPath = window.location.pathname;
            if (currentPath !== '/sign-in-2') {
                localStorage.setItem('admin_redirect', currentPath);
            }
            navigate({ to: '/sign-in-2' });
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <Outlet />;
}
```
*Caption: Snippet 2: AdminAuthGuard dengan redirect dan loading state.*

---

### `admin/src/features/auth/sign-in/sign-in-2.tsx`
**Layer Terdeteksi:** `Page Component (Sign In Page)`

**Narasi Operasional:**

Halaman sign-in dengan split-screen layout: form di sisi kiri, dashboard preview image di sisi kanan. Responsive â€” pada mobile hanya menampilkan form. Includes logo, title, form, terms/privacy links.

```tsx
export function SignIn2() {
    return (
        <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
            <div className='lg:p-8'>
                <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
                    <div className='mb-4 flex items-center justify-center'>
                        <Logo className='me-2' />
                        <h1 className='text-xl font-medium'>Notefiber Administrator</h1>
                    </div>
                </div>
                <div className='mx-auto flex w-full max-w-sm flex-col justify-center space-y-2'>
                    <div className='flex flex-col space-y-2 text-start'>
                        <h2 className='text-lg font-semibold tracking-tight'>Sign in</h2>
                        <p className='text-muted-foreground text-sm'>
                            Enter your email and password below <br />
                            to log into your account
                        </p>
                    </div>
                    <UserAuthForm />
                    <p className='text-muted-foreground px-8 text-center text-sm'>
                        By clicking sign in, you agree to our{' '}
                        <a href='/terms' className='hover:text-primary underline underline-offset-4'>Terms of Service</a>
                        {' '}and{' '}
                        <a href='/privacy' className='hover:text-primary underline underline-offset-4'>Privacy Policy</a>.
                    </p>
                </div>
            </div>

            {/* Dashboard Preview - Hidden on Mobile */}
            <div className={cn('bg-muted relative h-full overflow-hidden max-lg:hidden', '...')}>
                <img src={dashboardLight} className='dark:hidden' alt='Dashboard Preview' />
                <img src={dashboardDark} className='hidden dark:block' alt='Dashboard Preview' />
            </div>
        </div>
    )
}
```
*Caption: Snippet 3: Sign-in page dengan split-screen layout.*

---

### `admin/src/features/auth/sign-in/components/user-auth-form.tsx`
**Layer Terdeteksi:** `Form Component (Login Form)`

**Narasi Operasional:**

Form login dengan validasi Zod. Setelah login berhasil, redirect ke stored location atau dashboard. Includes social login buttons (GitHub, Facebook) yang saat ini disabled.

```tsx
const formSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string()
        .min(1, 'Please enter your password')
        .min(7, 'Password must be at least 7 characters long'),
})

export function UserAuthForm({ className, redirectTo, ...props }: UserAuthFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useAdminAuth()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: '', password: '' },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setIsLoading(true)

        try {
            await login(data.email, data.password)

            toast.success(`Welcome back, ${data.email}!`)

            // Redirect to stored location or default to dashboard
            const storedRedirect = localStorage.getItem('admin_redirect')
            let targetPath = storedRedirect || redirectTo || '/'

            // Strip /admin prefix if present (router basepath handles it)
            if (targetPath.startsWith('/admin')) {
                targetPath = targetPath.replace(/^\/admin/, '') || '/'
            }

            if (storedRedirect) {
                localStorage.removeItem('admin_redirect')
            }

            navigate({ to: targetPath, replace: true })
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } }
            toast.error(err.response?.data?.message || 'Invalid email or password. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn('grid gap-3', className)}>
                <FormField control={form.control} name='email' render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder='name@example.com' {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name='password' render={({ field }) => (
                    <FormItem className='relative'>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <PasswordInput placeholder='********' {...field} />
                        </FormControl>
                        <FormMessage />
                        <Link to='/forgot-password' className='text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75'>
                            Forgot password?
                        </Link>
                    </FormItem>
                )} />
                <Button className='mt-2' disabled={isLoading}>
                    {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
                    Sign in
                </Button>

                {/* Social Login Divider */}
                <div className='relative my-2'>
                    <div className='absolute inset-0 flex items-center'><span className='w-full border-t' /></div>
                    <div className='relative flex justify-center text-xs uppercase'>
                        <span className='bg-background text-muted-foreground px-2'>Or continue with</span>
                    </div>
                </div>

                {/* Social Login Buttons */}
                <div className='grid grid-cols-2 gap-2'>
                    <Button variant='outline' type='button' disabled={isLoading}><IconGithub /> GitHub</Button>
                    <Button variant='outline' type='button' disabled={isLoading}><IconFacebook /> Facebook</Button>
                </div>
            </form>
        </Form>
    )
}
```
*Caption: Snippet 4: Login form dengan validation dan redirect logic.*

---

### `admin/src/components/layout/authenticated-layout.tsx`
**Layer Terdeteksi:** `Layout Component (Authenticated Shell)`

**Narasi Operasional:**

Layout wrapper untuk semua authenticated pages. Menyediakan sidebar dengan navigation dan content area. Menggunakan Sidebar Provider untuk collapsible state yang disimpan di cookie.

```tsx
export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
    const defaultOpen = getCookie('sidebar_state') !== 'false'
    return (
        <SearchProvider>
            <LayoutProvider>
                <SidebarProvider defaultOpen={defaultOpen}>
                    <SkipToMain />
                    <AppSidebar />
                    <SidebarInset className={cn(
                        '@container/content',
                        'has-data-[layout=fixed]:h-svh',
                        'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'
                    )}>
                        {children ?? <Outlet />}
                    </SidebarInset>
                </SidebarProvider>
            </LayoutProvider>
        </SearchProvider>
    )
}
```
*Caption: Snippet 5: Authenticated layout dengan sidebar.*

---

### `admin/src/main.tsx`
**Layer Terdeteksi:** `App Entry Point`

**Narasi Operasional:**

Entry point admin app yang dikonfigurasi dengan basepath `/admin`. Membungkus aplikasi dengan providers: QueryClient, AdminAuthProvider, ThemeProvider. Handle 401 errors dengan redirect ke sign-in.

```tsx
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                if (failureCount > 3) return false
                return !(error instanceof AxiosError && [401, 403].includes(error.response?.status ?? 0))
            },
            refetchOnWindowFocus: import.meta.env.PROD,
            staleTime: 10 * 1000, // 10s
        },
        mutations: {
            onError: (error) => handleServerError(error),
        },
    },
    queryCache: new QueryCache({
        onError: (error) => {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    toast.error('Session expired!')
                    useAuthStore.getState().auth.reset()
                    const redirect = `${router.history.location.href}`
                    router.navigate({ to: '/sign-in', search: { redirect } })
                }
                if (error.response?.status === 500) {
                    toast.error('Internal Server Error!')
                }
            }
        },
    }),
})

// Router with basepath for /admin mounting
const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    basepath: '/admin',  // <-- All admin routes prefixed with /admin
})

export default function AdminApp() {
    return (
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <AdminAuthProvider>
                    <ThemeProvider>
                        <FontProvider>
                            <DirectionProvider>
                                <RouterProvider router={router} />
                            </DirectionProvider>
                        </FontProvider>
                    </ThemeProvider>
                </AdminAuthProvider>
            </QueryClientProvider>
        </StrictMode>
    )
}
```
*Caption: Snippet 6: Admin app entry dengan basepath dan providers.*

---

### Route Files
**Layer Terdeteksi:** `Route Definitions`

**Routes Authentication:**

```tsx
// routes/(auth)/sign-in-2.tsx
import { createFileRoute } from '@tanstack/react-router'
import { SignIn2 } from '@admin/features/auth/sign-in/sign-in-2'

export const Route = createFileRoute('/(auth)/sign-in-2')({
    component: SignIn2,
})
```

**Routes Authenticated:**

```tsx
// routes/_authenticated/route.tsx
import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@admin/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
    component: AuthenticatedLayout,
})

// routes/_authenticated/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@admin/features/dashboard'

export const Route = createFileRoute('/_authenticated/')({
    component: Dashboard,
})
```
*Caption: Snippet 7: Route definitions untuk auth dan authenticated pages.*

---

## C. Ringkasan Ketergantungan Komponen

| Komponen | Menerima Dari | Meneruskan Ke |
|----------|---------------|---------------|
| `AdminApp (main.tsx)` | - | `AdminAuthProvider`, Router |
| `AdminAuthProvider` | localStorage | All components via hook |
| `AdminAuthGuard` | `useAdminAuth()` | Redirect atau `<Outlet />` |
| `SignIn2` | - | `UserAuthForm` |
| `UserAuthForm` | `useAdminAuth().login` | Navigate on success |
| `AuthenticatedLayout` | Route | Sidebar + Content |

---

## D. Diagram Authentication Flow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    Admin Authentication Flow                     â”‚
â”‚                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  User Accesses Protected Route (/admin/plans)             â”‚   â”‚
â”‚  â”‚                         â”‚                                 â”‚   â”‚
â”‚  â”‚                         â–¼                                 â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚   â”‚
â”‚  â”‚  â”‚  AdminAuthGuard checks isAuthenticated             â”‚  â”‚   â”‚
â”‚  â”‚  â”‚                    â”‚                               â”‚  â”‚   â”‚
â”‚  â”‚  â”‚         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                   â”‚  â”‚   â”‚
â”‚  â”‚  â”‚         â–¼                     â–¼                   â”‚  â”‚   â”‚
â”‚  â”‚  â”‚     isLoading          !isAuthenticated            â”‚  â”‚   â”‚
â”‚  â”‚  â”‚         â”‚                     â”‚                   â”‚  â”‚   â”‚
â”‚  â”‚  â”‚         â–¼                     â–¼                   â”‚  â”‚   â”‚
â”‚  â”‚  â”‚   [Spinner]        [Store admin_redirect]          â”‚  â”‚   â”‚
â”‚  â”‚  â”‚                           â”‚                       â”‚  â”‚   â”‚
â”‚  â”‚  â”‚                           â–¼                       â”‚  â”‚   â”‚
â”‚  â”‚  â”‚              [Redirect to /sign-in-2]              â”‚  â”‚   â”‚
â”‚  â”‚  â”‚                           â”‚                       â”‚  â”‚   â”‚
â”‚  â”‚  â”‚                           â–¼                       â”‚  â”‚   â”‚
â”‚  â”‚  â”‚              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”              â”‚  â”‚   â”‚
â”‚  â”‚  â”‚              â”‚   SignIn2 Page      â”‚              â”‚  â”‚   â”‚
â”‚  â”‚  â”‚              â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚              â”‚  â”‚   â”‚
â”‚  â”‚  â”‚              â”‚   â”‚ UserAuthForm  â”‚ â”‚              â”‚  â”‚   â”‚
â”‚  â”‚  â”‚              â”‚   â”‚ [Email_____]  â”‚ â”‚              â”‚  â”‚   â”‚
â”‚  â”‚  â”‚              â”‚   â”‚ [Password__]  â”‚ â”‚              â”‚  â”‚   â”‚
â”‚  â”‚  â”‚              â”‚   â”‚ [Sign In]     â”‚ â”‚              â”‚  â”‚   â”‚
â”‚  â”‚  â”‚              â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚              â”‚  â”‚   â”‚
â”‚  â”‚  â”‚              â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜              â”‚  â”‚   â”‚
â”‚  â”‚  â”‚                           â”‚                       â”‚  â”‚   â”‚
â”‚  â”‚  â”‚                           â–¼                       â”‚  â”‚   â”‚
â”‚  â”‚  â”‚              [Submit: POST /api/admin/login]       â”‚  â”‚   â”‚
â”‚  â”‚  â”‚                           â”‚                       â”‚  â”‚   â”‚
â”‚  â”‚  â”‚         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”‚  â”‚   â”‚
â”‚  â”‚  â”‚         â–¼                                   â–¼     â”‚  â”‚   â”‚
â”‚  â”‚  â”‚      Success                             Error    â”‚  â”‚   â”‚
â”‚  â”‚  â”‚         â”‚                                   â”‚     â”‚  â”‚   â”‚
â”‚  â”‚  â”‚         â–¼                                   â–¼     â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  [Store tokens]                    [Toast error]  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  [setAdmin(user)]                                 â”‚  â”‚   â”‚
â”‚  â”‚  â”‚         â”‚                                         â”‚  â”‚   â”‚
â”‚  â”‚  â”‚         â–¼                                         â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  [Navigate to admin_redirect || /]                â”‚  â”‚   â”‚
â”‚  â”‚  â”‚         â”‚                                         â”‚  â”‚   â”‚
â”‚  â”‚  â”‚         â–¼                                         â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â”‚  AuthenticatedLayout                        â”‚  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â”‚  â”‚AppSidebarâ”‚ â”‚     Content Area         â”‚ â”‚  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â”‚  â”‚          â”‚ â”‚     (Dashboard/Plans/..) â”‚ â”‚  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚  â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## E. Token Storage & API Integration

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Token Storage Architecture                                      â”‚
â”‚                                                                  â”‚
â”‚  localStorage:                                                   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚ admin_token: "eyJhbGciOiJIUzI1NiIs..."                      â”‚ â”‚
â”‚  â”‚ admin_refresh_token: "eyJhbGciOiJIUzI1NiIs..."              â”‚ â”‚
â”‚  â”‚ admin_user: '{"id":"...","email":"...","role":"admin"}'     â”‚ â”‚
â”‚  â”‚ admin_redirect: "/plans"  (temporary, cleared after use)    â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                  â”‚
â”‚  API Client (admin-api.ts):                                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚ apiClient.interceptors.request.use((config) => {           â”‚ â”‚
â”‚  â”‚     const token = localStorage.getItem('admin_token')       â”‚ â”‚
â”‚  â”‚     if (token) {                                            â”‚ â”‚
â”‚  â”‚         config.headers.Authorization = `Bearer ${token}`    â”‚ â”‚
â”‚  â”‚     }                                                       â”‚ â”‚
â”‚  â”‚     return config                                           â”‚ â”‚
â”‚  â”‚ })                                                          â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                  â”‚
â”‚  Login Endpoint:                                                 â”‚
â”‚  POST /api/admin/login                                           â”‚
â”‚  Body: { email, password }                                       â”‚
â”‚  Response: { success, data: { access_token, refresh_token, user }}â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
