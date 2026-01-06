# Dokumentasi Fitur: User Profile CRUD Management

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend  
**Perspektif:** User (Account Settings)

---

## Alur Data Semantik

```
[User Akses Profile Menu di TopBar]
    -> [Klik "Account Settings"]
    -> [Navigate ke /app/settings]
    -> [Read: Data Profile dari AuthContext]
    -> [Update Name: Edit -> Submit Form -> API PUT -> Toast Notification]
    -> [Update Avatar: Select Image -> Crop Dialog -> API POST (FormData) -> Refresh Profile]
    -> [Delete Account: Confirm Dialog -> API DELETE -> Logout -> Redirect to Sign In]
```

---

## A. Laporan Implementasi Fitur User Profile Management

### Deskripsi Fungsional

Fitur ini menyediakan halaman pengaturan akun dimana pengguna dapat mengelola informasi profil mereka. Halaman terbagi menjadi tiga section utama:

**Operasi yang Didukung:**

| Operasi | Trigger | API Endpoint | Hasil |
|---------|---------|--------------|-------|
| **Read Profile** | Auto dari AuthContext | - (context) | Data user ditampilkan |
| **Update Name** | Edit + Submit | `PUT /user/profile` | Nama diperbarui |
| **Upload Avatar** | Select + Crop + Save | `POST /user/avatar` | Avatar diperbarui |
| **Delete Account** | Confirm Dialog | `DELETE /user/account` | Akun dihapus, logout |

**Fitur Khusus:**
- **Avatar Cropping:** Image editor dengan crop circular, zoom slider, drag reposition
- **Inline Form:** Update nama tanpa halaman terpisah
- **Danger Zone:** Section khusus untuk aksi destruktif dengan konfirmasi berlapis
- **Profile Menu:** Akses cepat dari TopBar ke settings

### Visualisasi

> [PLACEHOLDER SCREENSHOT - PROFILE MENU]
> *Gambar 1: Dropdown menu profile di TopBar dengan opsi Settings dan Logout.*

> [PLACEHOLDER SCREENSHOT - SETTINGS PAGE]
> *Gambar 2: Halaman Account Settings dengan section Profile, Account Details, dan Danger Zone.*

> [PLACEHOLDER SCREENSHOT - AVATAR UPLOAD]
> *Gambar 3: Dialog crop avatar dengan preview circular dan zoom slider.*

> [PLACEHOLDER SCREENSHOT - DELETE CONFIRM]
> *Gambar 4: AlertDialog konfirmasi sebelum delete account.*

---

## B. Bedah Arsitektur & Komponen

---

### [src/components/common/UserProfileMenu.tsx](file:///d:/notetaker/notefiber-FE/src/components/common/UserProfileMenu.tsx)
**Layer Terdeteksi:** `UI Component (Navigation Entry Point)`

**Narasi Operasional:**

Komponen ini menyediakan dropdown menu di TopBar untuk akses cepat ke profil dan pengaturan. Avatar user ditampilkan sebagai trigger button dengan fallback ke initials jika gambar tidak tersedia.

Menu items mencakup: informasi user (nama + email), link ke Subscription Management, link ke Account Settings, dan tombol Logout. Handler [handleLogout](file:///d:/notetaker/notefiber-FE/src/components/common/UserProfileMenu.tsx#28-32) memanggil [logout()](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts#32-36) dari AuthContext dan redirect ke `/signin`.

```tsx
export function UserProfileMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const initials = user?.full_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    const handleLogout = () => {
        logout();
        navigate({ to: "/signin" });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                        <AvatarImage src={user?.avatar_url || ""} alt={user?.full_name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>
                    <p className="font-medium">{user?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate({ to: "/subscription" })}>
                    <CreditCard /> Manage Subscription
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })}>
                    <Settings /> Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut /> Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
```
*Caption: Snippet 1: Profile menu dengan avatar, navigation, dan logout.*

---

### [src/pages/user/AccountSettings.tsx](file:///d:/notetaker/notefiber-FE/src/pages/user/AccountSettings.tsx)
**Layer Terdeteksi:** `Page Component (Settings Dashboard)`

**Narasi Operasional:**

Komponen ini merender halaman Account Settings dengan tiga section terpisah. Data user diambil dari [useAuth()](file:///d:/notetaker/notefiber-FE/src/hooks/auth/useAuth.ts#3-6) hook yang menyediakan akses ke AuthContext.

**Section 1 - Profile:**
Form untuk update nama menggunakan React Hook Form dengan validasi Zod (minimum 2 karakter). [AvatarUploader](file:///d:/notetaker/notefiber-FE/src/components/common/AvatarUploader.tsx#30-190) component menangani upload avatar dengan cropping. Handler [handleAvatarUpload](file:///d:/notetaker/notefiber-FE/src/pages/user/AccountSettings.tsx#71-102) mengirim FormData ke endpoint `/user/avatar`.

**Section 2 - Account Details:**
Menampilkan informasi read-only: Plan status (via `PlanStatusPill`), Email, User ID, dan Role. Data ini tidak dapat diedit langsung.

**Section 3 - Danger Zone:**
Section dengan styling merah memuat tombol Delete Account yang membuka `AlertDialog` untuk konfirmasi. Setelah konfirmasi, [deleteAccount()](file:///d:/notetaker/notefiber-FE/src/api/services/user/user.service.ts#17-21) mutation dipanggil yang kemudian trigger logout.

```tsx
const profileSchema = z.object({
    full_name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
});

export default function AccountSettings() {
    const { user, updateUser } = useAuth();
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
    const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: { full_name: user?.full_name || "" },
    });

    function onSubmit(data: ProfileFormValues) {
        updateProfile(data, {
            onSuccess: () => toast.success("Profile updated successfully"),
            onError: () => toast.error("Failed to update profile"),
        });
    }
```
*Caption: Snippet 2: Setup form dengan validasi dan hooks.*

```tsx
    const handleAvatarUpload = async (blob: Blob) => {
        const formData = new FormData();
        formData.append('avatar', blob, 'avatar.jpg');

        try {
            const response = await apiClient.post(`/user/avatar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data?.user) {
                updateUser(response.data.user);
            } else {
                // Fallback: fetch profile
                const profileResponse = await userService.getProfile();
                if (profileResponse.success && profileResponse.data) {
                    updateUser(profileResponse.data);
                }
            }

            toast.success("Avatar updated successfully");
        } catch (error) {
            toast.error("Failed to upload avatar");
        }
    };
```
*Caption: Snippet 3: Handler avatar upload dengan FormData.*

```tsx
    return (
        <div className="p-10 pb-16 max-w-5xl mx-auto">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" onClick={() => router.history.go(-1)}>
                    <MoveLeft />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold">Settings</h2>
                    <p className="text-muted-foreground">Manage your account settings.</p>
                </div>
            </div>

            {/* Profile Section */}
            <AvatarUploader currentAvatarUrl={user?.avatar_url} onUpload={handleAvatarUpload} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField name="full_name" render={...} />
                    <Button type="submit" disabled={isUpdating}>Update</Button>
                </form>
            </Form>

            {/* Account Details (Read-Only) */}
            <div>
                <span>Plan</span> <PlanStatusPill />
                <span>Email</span> <span>{user?.email}</span>
                <span>User ID</span> <span>{user?.id}</span>
                <span>Role</span> <span>{user?.role}</span>
            </div>

            {/* Danger Zone */}
            <AlertDialog>
                <AlertDialogTrigger>
                    <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete your account and all data.
                    </AlertDialogDescription>
                    <AlertDialogAction onClick={() => deleteAccount()} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
```
*Caption: Snippet 4: Layout tiga section dengan action buttons.*

---

### [src/components/common/AvatarUploader.tsx](file:///d:/notetaker/notefiber-FE/src/components/common/AvatarUploader.tsx)
**Layer Terdeteksi:** `UI Component (Image Cropper)`

**Narasi Operasional:**

Komponen ini menyediakan UI untuk upload dan crop avatar. Menggunakan library `react-easy-crop` untuk editing gambar dengan crop circular.

**Flow:**
1. User klik avatar atau button camera
2. File input di-trigger, user select image
3. Image di-load sebagai data URL, dialog crop terbuka
4. User dapat drag untuk reposition dan gunakan slider untuk zoom
5. Klik Save memanggil `getCroppedImg` utility dan meneruskan blob ke parent via `onUpload`

State `croppedAreaPixels` menyimpan koordinat area crop yang digunakan untuk generate final image.

```tsx
export function AvatarUploader({ currentAvatarUrl, onUpload, isUploading = false }: AvatarUploaderProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setImageSrc(reader.result as string);
                setIsDialogOpen(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        await onUpload(croppedBlob);
        handleClose();
    };
```
*Caption: Snippet 5: State management dan handlers untuk crop flow.*

```tsx
    return (
        <div className="relative group">
            <input type="file" accept="image/*" onChange={onFileChange} className="hidden" ref={fileInputRef} />

            <div className="h-32 w-32 rounded-full overflow-hidden">
                {currentAvatarUrl ? (
                    <img src={currentAvatarUrl} alt="Avatar" />
                ) : (
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="text-white" />
                </div>
            </div>

            <Dialog open={isDialogOpen}>
                <DialogContent>
                    <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
                    <Slider value={[zoom]} min={1} max={3} step={0.1} onValueChange={(v) => setZoom(v[0])} />
                    <Button onClick={handleSave}>Save & Upload</Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}
```
*Caption: Snippet 6: Avatar display dengan hover overlay dan crop dialog.*

---

### [src/hooks/user/useUpdateProfile.ts](file:///d:/notetaker/notefiber-FE/src/hooks/user/useUpdateProfile.ts)
**Layer Terdeteksi:** `Custom Hook (API Mutation)`

**Narasi Operasional:**

Hook ini mengenkapsulasi panggilan API untuk update profile menggunakan TanStack Query `useMutation`. Setelah update berhasil, query cache untuk profile di-invalidate untuk memastikan data terbaru.

```tsx
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<null>, ApiError, UpdateProfileRequest>({
        mutationFn: (data) => userService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
        },
    });
};
```
*Caption: Snippet 7: Mutation hook dengan cache invalidation.*

---

### [src/hooks/user/useDeleteAccount.ts](file:///d:/notetaker/notefiber-FE/src/hooks/user/useDeleteAccount.ts)
**Layer Terdeteksi:** `Custom Hook (Destructive Mutation)`

**Narasi Operasional:**

Hook ini mengenkapsulasi aksi delete account. Setelah API berhasil, [logout()](file:///d:/notetaker/notefiber-FE/src/api/services/auth/auth.service.ts#32-36) dari AuthContext dipanggil untuk membersihkan session dan redirect user.

```tsx
export const useDeleteAccount = () => {
    const { logout } = useAuth();

    return useMutation<ApiResponse<null>, ApiError>({
        mutationFn: () => userService.deleteAccount(),
        onSuccess: () => {
            logout();
        },
    });
};
```
*Caption: Snippet 8: Mutation hook dengan auto-logout setelah delete.*

---

### [src/hooks/user/useUserProfile.ts](file:///d:/notetaker/notefiber-FE/src/hooks/user/useUserProfile.ts)
**Layer Terdeteksi:** `Custom Hook (API Query)`

**Narasi Operasional:**

Hook ini menyediakan akses ke profile user via TanStack Query. Digunakan untuk fetch profile independen dari AuthContext, misalnya untuk refresh data setelah update. Parameter `enabled` memungkinkan conditional fetching.

```tsx
export const useUserProfile = (enabled = true) => {
    return useQuery<ApiResponse<UserProfile>, ApiError>({
        queryKey: ['user', 'profile'],
        queryFn: () => userService.getProfile(),
        enabled,
    });
};
```
*Caption: Snippet 9: Query hook dengan conditional fetching.*

---

### [src/api/services/user/user.service.ts](file:///d:/notetaker/notefiber-FE/src/api/services/user/user.service.ts)
**Layer Terdeteksi:** `Service Layer (API Client)`

**Narasi Operasional:**

File ini mengonsolidasikan method API untuk operasi user. [getProfile](file:///d:/notetaker/notefiber-FE/src/api/services/user/user.service.ts#7-11) fetch data profil, [updateProfile](file:///d:/notetaker/notefiber-FE/src/api/services/user/user.service.ts#12-16) update nama, dan [deleteAccount](file:///d:/notetaker/notefiber-FE/src/api/services/user/user.service.ts#17-21) menghapus akun secara permanen.

```tsx
export const userService = {
    getProfile: async (): Promise<ApiResponse<UserProfile>> => {
        const response = await apiClient.get<ApiResponse<UserProfile>>(ENDPOINTS.USER.PROFILE);
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<null>> => {
        const response = await apiClient.put<ApiResponse<null>>(ENDPOINTS.USER.PROFILE, data);
        return response.data;
    },

    deleteAccount: async (): Promise<ApiResponse<null>> => {
        const response = await apiClient.delete<ApiResponse<null>>(ENDPOINTS.USER.ACCOUNT);
        return response.data;
    }
};
```
*Caption: Snippet 10: Service methods untuk profile operations.*

---

### [src/api/services/user/user.schemas.ts](file:///d:/notetaker/notefiber-FE/src/api/services/user/user.schemas.ts)
**Layer Terdeteksi:** `Schema Definition (Validation Contract)`

**Narasi Operasional:**

File ini mendefinisikan skema Zod untuk validasi request dan response. `updateProfileRequestSchema` hanya mencakup `full_name` yang optional. `profileResponseSchema` extends `userSchema` dengan field tambahan seperti `status`, `ai_daily_usage`, dan timestamps.

```tsx
export const updateProfileRequestSchema = z.object({
    full_name: z.string().min(2).max(100).optional(),
});

export const profileResponseSchema = userSchema.extend({
    status: z.string(),
    ai_daily_usage: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
});
```
*Caption: Snippet 11: Skema validasi untuk update dan response profile.*

---

## C. Ringkasan Ketergantungan Komponen

| Komponen | Menerima Dari | Meneruskan Ke |
|----------|---------------|---------------|
| [UserProfileMenu.tsx](file:///d:/notetaker/notefiber-FE/src/components/common/UserProfileMenu.tsx) | [AuthContext](file:///d:/notetaker/notefiber-FE/src/contexts/AuthContext.tsx#157-164) (user) | Navigation to Settings |
| [AccountSettings.tsx](file:///d:/notetaker/notefiber-FE/src/pages/user/AccountSettings.tsx) | [AuthContext](file:///d:/notetaker/notefiber-FE/src/contexts/AuthContext.tsx#157-164), hooks | [AvatarUploader](file:///d:/notetaker/notefiber-FE/src/components/common/AvatarUploader.tsx#30-190), Forms, API |
| [AvatarUploader.tsx](file:///d:/notetaker/notefiber-FE/src/components/common/AvatarUploader.tsx) | [AccountSettings](file:///d:/notetaker/notefiber-FE/src/pages/user/AccountSettings.tsx#47-255) (avatarUrl) | Parent callback (blob) |
| [useUpdateProfile.ts](file:///d:/notetaker/notefiber-FE/src/hooks/user/useUpdateProfile.ts) | [AccountSettings](file:///d:/notetaker/notefiber-FE/src/pages/user/AccountSettings.tsx#47-255) | `userService.updateProfile` |
| [useDeleteAccount.ts](file:///d:/notetaker/notefiber-FE/src/hooks/user/useDeleteAccount.ts) | [AccountSettings](file:///d:/notetaker/notefiber-FE/src/pages/user/AccountSettings.tsx#47-255) | `userService.deleteAccount` â†’ logout |

---

## D. Diagram Alur Profile Management

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         TopBar                                   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚   Logo       â”‚                        â”‚ UserProfileMenu  â”‚   â”‚
â”‚  â”‚              â”‚                        â”‚   [Avatar â–¼]     â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                        â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                    â”‚
                                    Click "Account Settings"
                                                    â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    AccountSettings Page                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  [â†] Settings                                             â”‚   â”‚
â”‚  â”‚      Manage your account settings and preferences.        â”‚   â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤   â”‚
â”‚  â”‚  PROFILE                                                  â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”                                               â”‚   â”‚
â”‚  â”‚  â”‚ Avatar â”‚  [AvatarUploader]                            â”‚   â”‚
â”‚  â”‚  â”‚   ðŸ“·   â”‚                                               â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                               â”‚   â”‚
â”‚  â”‚  Full Name: [______________] [Update]                     â”‚   â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤   â”‚
â”‚  â”‚  ACCOUNT DETAILS (read-only)                              â”‚   â”‚
â”‚  â”‚  Plan:    [Pro Plan âœ“]                                    â”‚   â”‚
â”‚  â”‚  Email:   user@example.com                                â”‚   â”‚
â”‚  â”‚  User ID: 550e8400-e29b-41d4-a716-446655440000           â”‚   â”‚
â”‚  â”‚  Role:    user                                            â”‚   â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤   â”‚
â”‚  â”‚  âš ï¸ DANGER ZONE                                           â”‚   â”‚
â”‚  â”‚  [Delete Account] â†’ AlertDialog â†’ API DELETE â†’ Logout    â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## E. Avatar Crop Flow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  1. User clicks avatar or camera button                         â”‚
â”‚                    â–¼                                             â”‚
â”‚  2. Hidden file input triggered                                  â”‚
â”‚                    â–¼                                             â”‚
â”‚  3. User selects image file                                      â”‚
â”‚                    â–¼                                             â”‚
â”‚  4. FileReader loads image as data URL                           â”‚
â”‚                    â–¼                                             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  Crop Dialog                                              â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                   â”‚   â”‚
â”‚  â”‚  â”‚                                    â”‚                   â”‚   â”‚
â”‚  â”‚  â”‚         [Cropper Area]             â”‚   â† Drag to move â”‚   â”‚
â”‚  â”‚  â”‚            â•­â”€â”€â”€â•®                   â”‚                   â”‚   â”‚
â”‚  â”‚  â”‚            â”‚   â”‚  â† Circular crop  â”‚                   â”‚   â”‚
â”‚  â”‚  â”‚            â•°â”€â”€â”€â•¯                   â”‚                   â”‚   â”‚
â”‚  â”‚  â”‚                                    â”‚                   â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                   â”‚   â”‚
â”‚  â”‚  [-] â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â—â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• [+]  â† Zoom slider â”‚   â”‚
â”‚  â”‚  [Cancel]                        [Save & Upload]          â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                    â–¼                                             â”‚
â”‚  5. getCroppedImg() generates cropped blob                       â”‚
â”‚                    â–¼                                             â”‚
â”‚  6. onUpload(blob) sends FormData to /user/avatar                â”‚
â”‚                    â–¼                                             â”‚
â”‚  7. updateUser() refreshes AuthContext                           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
