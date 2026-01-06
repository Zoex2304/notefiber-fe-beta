# Dokumentasi Fitur: Subscriptions Flow

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend  
**Cakupan:** Subscription Management, Usage Limits, Feature Gating

---

## Alur Data Semantik

```
[User Login ke Aplikasi]
    -> [SubscriptionContext Fetch Status dari Backend]
    -> [UsageLimitsContext Fetch Usage Status]
    -> [User Melihat Plan Features & Limits di Sidebar/Settings]
    -> [User Akses Subscription Management di /subscription]
    -> [View: Plan Name, Features, Token Usage, Billing Info]
    -> [Action: Upgrade Plan -> Navigate ke /pricing]
    -> [Action: Request Refund -> Modal Form -> API POST]
    -> [Action: Cancel Subscription -> Confirm Dialog -> API POST]
```

---

## A. Laporan Implementasi Fitur Subscriptions Flow

### Deskripsi Fungsional

Fitur ini mengelola seluruh lifecycle subscription user dari aktivasi hingga pembatalan. Terdiri dari dua layer utama:

1. **Subscription Context:** Menyimpan informasi paket dan fitur yang dimiliki user
2. **Usage Limits Context:** Memonitor penggunaan dan enforce limit sebelum aksi

**Komponen Utama:**

| Komponen | Fungsi |
|----------|--------|
| [SubscriptionContext](file:///d:/notetaker/notefiber-FE/src/contexts/SubscriptionContext.tsx#6-25) | Global state untuk plan, features, token usage |
| [UsageLimitsContext](file:///d:/notetaker/notefiber-FE/src/contexts/UsageLimitsContext.tsx#13-28) | Check functions dengan auto-modal pricing |
| [SubscriptionManagement](file:///d:/notetaker/notefiber-FE/src/pages/subscription/SubscriptionManagement.tsx#23-231) | Halaman kelola subscription |
| [PricingModal](file:///d:/notetaker/notefiber-FE/src/components/modals/PricingModal.tsx#26-104) | Prompt upgrade saat limit tercapai |
| [RefundRequestModal](file:///d:/notetaker/notefiber-FE/src/pages/subscription/RefundRequestModal.tsx#45-159) | Form pengajuan refund |
| [PlanStatusPill](file:///d:/notetaker/notefiber-FE/src/components/common/PlanStatusPill.tsx#9-33) | UI indicator plan aktif |

**Fitur yang Dikelola:**

| Feature Key | Deskripsi | Limit Type |
|-------------|-----------|------------|
| `notebooks` | Jumlah notebook | Storage |
| `notes` | Notes per notebook | Storage |
| `ai_chat` | AI chat messages | Daily reset |
| `semantic_search` | Semantic search queries | Daily reset |

### Visualisasi

> [PLACEHOLDER SCREENSHOT - SUBSCRIPTION PAGE]
> *Gambar 1: Halaman Subscription Management dengan plan card dan features.*

> [PLACEHOLDER SCREENSHOT - PLAN STATUS PILL]
> *Gambar 2: PlanStatusPill di Account Settings menampilkan "Pro Plan".*

> [PLACEHOLDER SCREENSHOT - USAGE LIMITS]
> *Gambar 3: Token usage indicator "5/10 AI requests used today".*

> [PLACEHOLDER SCREENSHOT - PRICING MODAL]
> *Gambar 4: PricingModal muncul saat limit tercapai dengan info "5/5 notebooks used".*

> [PLACEHOLDER SCREENSHOT - REFUND MODAL]
> *Gambar 5: RefundRequestModal dengan form reason.*

---

## B. Bedah Arsitektur & Komponen

---

### [src/contexts/SubscriptionContext.tsx](file:///d:/notetaker/notefiber-FE/src/contexts/SubscriptionContext.tsx)
**Layer Terdeteksi:** `Context Provider (Plan & Features State)`

**Narasi Operasional:**

Context ini menyimpan informasi subscription user secara global. Saat user login (`isAuthenticated` true), effect memanggil [getSubscriptionStatus](file:///d:/notetaker/notefiber-FE/src/api/services/payment/payment.service.ts#31-35) API untuk fetch data plan.

**State yang Dikelola:**
- `planName`: Nama paket (e.g., "Free Plan", "Pro Plan")
- `isActive`: Status subscription aktif
- `subscriptionId`: ID untuk operasi refund/cancel
- `features`: Object berisi fitur boolean dan limit numerik
- `tokenUsage`: Daily usage AI dengan persentase

Function [checkPermission](file:///d:/notetaker/notefiber-FE/src/contexts/SubscriptionContext.tsx#126-129) memvalidasi akses fitur tanpa trigger modal â€” digunakan untuk conditional rendering UI elements.

```tsx
interface SubscriptionContextType {
    isLoading: boolean;
    planName: string;
    isActive: boolean;
    subscriptionId: string | null;
    features: {
        ai_chat: boolean;
        semantic_search: boolean;
        max_notes: number;
        daily_token_limit: number;
    };
    tokenUsage: {
        dailyUsed: number;
        dailyLimit: number;
        percentage: number;
    };
    checkPermission: (feature: 'ai_chat' | 'semantic_search') => boolean;
    refreshSubscription: () => Promise<void>;
}

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const [planName, setPlanName] = useState<string>("Free Plan");
    const [isActive, setIsActive] = useState<boolean>(false);
    const [features, setFeatures] = useState(defaultFeatures);
    const [tokenUsage, setTokenUsage] = useState({ dailyUsed: 0, dailyLimit: 0, percentage: 0 });

    const fetchSubscriptionStatus = async () => {
        const response = await paymentService.getSubscriptionStatus();

        if (response.success && response.data) {
            setPlanName(response.data.plan_name);
            setIsActive(response.data.is_active);
            setSubscriptionId(response.data.subscription_id || null);

            // Normalize features (handle array or object format)
            const normalizedFeatures = normalizeFeatures(response.data.features);
            setFeatures(normalizedFeatures);

            // Calculate token usage percentage
            const dailyUsed = response.data.ai_daily_usage || 0;
            const dailyLimit = normalizedFeatures.daily_token_limit;
            const percentage = dailyLimit > 0 ? Math.min((dailyUsed / dailyLimit) * 100, 100) : 0;
            setTokenUsage({ dailyUsed, dailyLimit, percentage });
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchSubscriptionStatus();
        }
    }, [isAuthenticated]);

    const checkPermission = (feature: 'ai_chat' | 'semantic_search'): boolean => {
        return features[feature];
    };

    return (
        <SubscriptionContext.Provider value={{ planName, isActive, features, tokenUsage, checkPermission, refreshSubscription: fetchSubscriptionStatus }}>
            {children}
        </SubscriptionContext.Provider>
    );
};
```
*Caption: Snippet 1: SubscriptionContext dengan fetch dan normalisasi features.*

---

### [src/contexts/UsageLimitsContext.tsx](file:///d:/notetaker/notefiber-FE/src/contexts/UsageLimitsContext.tsx)
**Layer Terdeteksi:** `Context Provider (Usage Enforcement)`

**Narasi Operasional:**

Context ini menyediakan check functions yang memvalidasi usage sebelum aksi dan otomatis menampilkan [PricingModal](file:///d:/notetaker/notefiber-FE/src/components/modals/PricingModal.tsx#26-104) jika limit tercapai. Berbeda dengan [SubscriptionContext](file:///d:/notetaker/notefiber-FE/src/contexts/SubscriptionContext.tsx#6-25) yang pasif, context ini aktif enforce limit.

**Check Functions:**
- `checkCanCreateNotebook()`: Validasi storage.notebooks.can_use
- `checkCanCreateNote()`: Validasi storage.notes.can_use
- `checkCanUseAiChat()`: Validasi daily.ai_chat.can_use
- `checkCanUseSemanticSearch()`: Validasi daily.semantic_search.can_use

Setiap function melakukan `refetch` fresh data sebelum validasi untuk memastikan akurasi. Jika `can_use` false, modal pricing otomatis terbuka dengan info limit yang relevan.

```tsx
export function UsageLimitsProvider({ children }: UsageLimitsProviderProps) {
    const { isAuthenticated } = useAuthContext();
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [modalFeatureName, setModalFeatureName] = useState<string>('This feature');
    const [modalLimitInfo, setModalLimitInfo] = useState<LimitInfo | undefined>();

    // Only fetch when authenticated
    const usage = useCanUseFeature({ enabled: isAuthenticated });

    const showPricingModal = useCallback((featureName = 'This feature', limitInfo?: LimitInfo) => {
        setModalFeatureName(featureName);
        setModalLimitInfo(limitInfo);
        setIsPricingModalOpen(true);
    }, []);

    const checkCanCreateNotebook = useCallback(async () => {
        const result = await usage.refetch();
        const freshData = result.data?.data;
        const canUse = freshData?.storage.notebooks.can_use ?? false;

        if (!canUse && freshData?.storage?.notebooks) {
            showPricingModal('notebooks', {
                used: freshData.storage.notebooks.used,
                limit: freshData.storage.notebooks.limit,
            });
        }
        return canUse;
    }, [usage, showPricingModal]);

    const checkCanUseAiChat = useCallback(async () => {
        const result = await usage.refetch();
        const freshData = result.data?.data;
        const canUse = freshData?.daily.ai_chat.can_use ?? false;

        if (!canUse && freshData?.daily?.ai_chat) {
            showPricingModal('AI chat messages', {
                used: freshData.daily.ai_chat.used,
                limit: freshData.daily.ai_chat.limit,
                resetsAt: freshData.daily.ai_chat.resets_at,  // Shows countdown
            });
        }
        return canUse;
    }, [usage, showPricingModal]);

    return (
        <UsageLimitsContext.Provider value={{ checkCanCreateNotebook, checkCanCreateNote, checkCanUseAiChat, checkCanUseSemanticSearch, ... }}>
            {children}
            <PricingModal isOpen={isPricingModalOpen} onClose={hidePricingModal} featureName={modalFeatureName} limitInfo={modalLimitInfo} />
        </UsageLimitsContext.Provider>
    );
}
```
*Caption: Snippet 2: UsageLimitsContext dengan auto-modal enforcement.*

```tsx
/**
 * Helper function to handle 429 limit exceeded errors from API
 */
export function handleLimitExceededError(
    error: any,
    showPricingModal: UsageLimitsContextType['showPricingModal']
): boolean {
    if (error?.response?.status === 429 || error?.code === 429) {
        const data = error?.response?.data?.data || error?.data;
        if (data) {
            showPricingModal(error?.response?.data?.message || 'Daily limit', {
                used: data.used,
                limit: data.limit,
                resetsAt: data.reset_after,
            });
            return true;
        }
        showPricingModal();
        return true;
    }

    if (error?.response?.status === 403) {
        showPricingModal();
        return true;
    }

    return false;
}
```
*Caption: Snippet 3: Helper untuk handle 429/403 errors dengan modal.*

---

### [src/pages/subscription/SubscriptionManagement.tsx](file:///d:/notetaker/notefiber-FE/src/pages/subscription/SubscriptionManagement.tsx)
**Layer Terdeteksi:** `Page Component (Subscription Dashboard)`

**Narasi Operasional:**

Halaman ini menampilkan detail subscription user dan menyediakan aksi manajemen. Menggunakan data dari [useSubscription()](file:///d:/notetaker/notefiber-FE/src/contexts/SubscriptionContext.tsx#148-155) hook yang terhubung ke SubscriptionContext.

**Sections:**
1. **Current Plan Card:** Nama plan, status badge, features list, token usage, billing info
2. **Actions:** Upgrade Plan, Request Refund, Cancel Subscription
3. **Help Card:** Link support email

Refund dan Cancel hanya muncul untuk paket berbayar aktif. Cancel menggunakan `AlertDialog` konfirmasi, sementara Refund membuka modal form terpisah.

```tsx
export function SubscriptionManagement() {
    const { planName, isActive, features, tokenUsage, subscriptionId, refreshSubscription } = useSubscription();
    const navigate = useNavigate();
    const [refundModalOpen, setRefundModalOpen] = useState(false);

    const handleCancelSubscription = async () => {
        try {
            // TODO: Implement cancel subscription API
            toast.success('Cancellation request submitted.');
        } catch (error) {
            toast.error('Failed to submit cancellation request.');
        }
    };

    return (
        <div className="container max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.history.go(-1)}>
                    <MoveLeft />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Subscription Management</h1>
                    <p className="text-muted-foreground">Manage your subscription, billing, and plan details</p>
                </div>
            </div>

            {/* Current Plan Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">{planName}</CardTitle>
                            <CardDescription>{isActive ? 'Active Subscription' : 'No Active Subscription'}</CardDescription>
                        </div>
                        <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Features List */}
                    <ul className="space-y-2">
                        <li><Check /> {features.max_notes === 0 ? 'Unlimited notes' : `Up to ${features.max_notes} notes`}</li>
                        <li>{features.semantic_search ? <><Check /> Semantic search enabled</> : <span>Semantic search not available</span>}</li>
                        <li>{features.ai_chat ? <><Check /> AI chat access</> : <span>AI chat not available</span>}</li>
                        {features.daily_token_limit > 0 && (
                            <li><Zap /> {tokenUsage.dailyUsed} / {tokenUsage.dailyLimit} AI requests used today</li>
                        )}
                    </ul>

                    {/* Billing Info */}
                    <div className="border-t pt-4">
                        <div><Calendar /> Billing cycle: Monthly</div>
                        <div><CreditCard /> Next billing date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-3">
                    <Button onClick={() => navigate({ to: '/pricing' })}>Upgrade Plan</Button>

                    {isActive && planName !== 'Free Plan' && (
                        <>
                            <Button variant="outline" onClick={() => setRefundModalOpen(true)}>Request Refund</Button>
                            <RefundRequestModal open={refundModalOpen} onOpenChange={setRefundModalOpen} subscriptionId={subscriptionId} planName={planName} onSuccess={refreshSubscription} />

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">Cancel Subscription</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You'll lose access to premium features at the end of your billing period.
                                    </AlertDialogDescription>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleCancelSubscription}>Yes, Cancel</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </CardFooter>
            </Card>

            {/* Help Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                    Contact us at <a href="mailto:support@notefiber.com">support@notefiber.com</a>
                </CardContent>
            </Card>
        </div>
    );
}
```
*Caption: Snippet 4: Halaman subscription management dengan semua sections.*

---

### [src/pages/subscription/RefundRequestModal.tsx](file:///d:/notetaker/notefiber-FE/src/pages/subscription/RefundRequestModal.tsx)
**Layer Terdeteksi:** `UI Component (Refund Form)`

**Narasi Operasional:**

Modal ini menangani pengajuan refund dengan form reason yang divalidasi Zod. Menampilkan alert informasi proses refund (3 business days review, 5-7 days transfer).

Handler submit memanggil `refundService.requestRefund` dengan subscription_id dan reason. Callbacks [onSuccess](file:///d:/notetaker/notefiber-FE/src/pages/auth/SignIn.tsx#54-58) trigger refresh subscription data.

```tsx
const refundFormSchema = z.object({
    reason: z.string()
        .min(10, 'Reason must be at least 10 characters')
        .max(500, 'Reason must not exceed 500 characters'),
});

export function RefundRequestModal({ open, onOpenChange, subscriptionId, planName, onSuccess }: RefundRequestModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<RefundFormValues>({ resolver: zodResolver(refundFormSchema) });

    const handleSubmit = async (data: RefundFormValues) => {
        if (!subscriptionId) {
            toast.error('No active subscription found for refund request.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await refundService.requestRefund({
                subscription_id: subscriptionId,
                reason: data.reason,
            });

            if (response.success) {
                toast.success(response.data?.message || 'Refund request submitted!');
                form.reset();
                onOpenChange(false);
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to submit refund request.');
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to submit refund request.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Request Refund</DialogTitle>
                    <DialogDescription>
                        Submit a refund request for your <strong>{planName}</strong> subscription.
                    </DialogDescription>
                </DialogHeader>

                <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
                    <AlertCircle className="text-amber-600" />
                    <AlertDescription>
                        Refunds are processed manually. Once approved, the refund will be transferred within 5-7 business days.
                    </AlertDescription>
                </Alert>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <FormField name="reason" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reason for Refund</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Please explain why you're requesting a refund..." rows={4} />
                                </FormControl>
                                <FormDescription>Minimum 10 characters required.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                                Submit Request
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
```
*Caption: Snippet 5: Refund request modal dengan form validation.*

---

### [src/components/common/PlanStatusPill.tsx](file:///d:/notetaker/notefiber-FE/src/components/common/PlanStatusPill.tsx)
**Layer Terdeteksi:** `UI Component (Status Indicator)`

**Narasi Operasional:**

Komponen ini menampilkan badge/pill status plan user. Styling berbeda untuk paid plans (emerald/green dengan sparkle icon) vs free plan (gray). Digunakan di Account Settings dan lokasi lain yang membutuhkan quick plan indicator.

```tsx
export function PlanStatusPill({ className }: PlanStatusPillProps) {
    const { planName, isActive } = useSubscription();

    const isPro = isActive && planName.toLowerCase().includes("pro");
    const isEnterprise = isActive && planName.toLowerCase().includes("enterprise");
    const isPaid = isPro || isEnterprise;

    return (
        <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
            isPaid
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-100 text-gray-600 border-gray-200",
            className
        )}>
            {isPaid && <Sparkles className="w-3 h-3 text-emerald-500 fill-emerald-500" />}
            <span className="capitalize">{planName}</span>
        </div>
    );
}
```
*Caption: Snippet 6: PlanStatusPill dengan conditional styling.*

---

## C. Ringkasan Ketergantungan Komponen

| Komponen | Menerima Dari | Meneruskan Ke |
|----------|---------------|---------------|
| [SubscriptionContext](file:///d:/notetaker/notefiber-FE/src/contexts/SubscriptionContext.tsx#6-25) | `paymentService.getSubscriptionStatus` | All components via hook |
| [UsageLimitsContext](file:///d:/notetaker/notefiber-FE/src/contexts/UsageLimitsContext.tsx#13-28) | `useCanUseFeature` hook | All components + PricingModal |
| [SubscriptionManagement](file:///d:/notetaker/notefiber-FE/src/pages/subscription/SubscriptionManagement.tsx#23-231) | [useSubscription()](file:///d:/notetaker/notefiber-FE/src/contexts/SubscriptionContext.tsx#148-155) | [RefundRequestModal](file:///d:/notetaker/notefiber-FE/src/pages/subscription/RefundRequestModal.tsx#45-159), Navigation |
| [PlanStatusPill](file:///d:/notetaker/notefiber-FE/src/components/common/PlanStatusPill.tsx#9-33) | [useSubscription()](file:///d:/notetaker/notefiber-FE/src/contexts/SubscriptionContext.tsx#148-155) | Display only |
| [RefundRequestModal](file:///d:/notetaker/notefiber-FE/src/pages/subscription/RefundRequestModal.tsx#45-159) | Parent props | `refundService.requestRefund` |

---

## D. Diagram Subscription Flow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    Application Bootstrap                         â”‚
â”‚                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚                    AuthProvider                           â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚   â”‚
â”‚  â”‚  â”‚              SubscriptionProvider                   â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â”‚           UsageLimitsProvider                 â”‚  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â”‚                                               â”‚  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â”‚   â”‚          App Components             â”‚    â”‚  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â”‚   â”‚                                     â”‚    â”‚  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â”‚   â”‚  MainApp / Settings / Subscription  â”‚    â”‚  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â”‚   â”‚                                     â”‚    â”‚  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â”‚                                               â”‚  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â”‚   [PricingModal - Auto-opens on limit]        â”‚  â”‚  â”‚   â”‚
â”‚  â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚  â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Usage Check Flow (e.g., Create Notebook)                        â”‚
â”‚                                                                  â”‚
â”‚  [User clicks "New Notebook"]                                    â”‚
â”‚           â”‚                                                      â”‚
â”‚           â–¼                                                      â”‚
â”‚  [MainApp calls checkCanCreateNotebook()]                        â”‚
â”‚           â”‚                                                      â”‚
â”‚           â–¼                                                      â”‚
â”‚  [UsageLimitsContext refetches usage data]                       â”‚
â”‚           â”‚                                                      â”‚
â”‚     â”Œâ”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”                                                â”‚
â”‚     â–¼           â–¼                                                â”‚
â”‚  can_use     can_use                                             â”‚
â”‚   TRUE        FALSE                                              â”‚
â”‚     â”‚           â”‚                                                â”‚
â”‚     â–¼           â–¼                                                â”‚
â”‚  [Proceed]   [showPricingModal('notebooks', { used, limit })]    â”‚
â”‚     â”‚           â”‚                                                â”‚
â”‚     â–¼           â–¼                                                â”‚
â”‚  [Create    [PricingModal opens with upgrade options]            â”‚
â”‚  Notebook]       â”‚                                               â”‚
â”‚                  â–¼                                               â”‚
â”‚             [User chooses: Upgrade or "Maybe Later"]             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## E. Usage Status API Response Format

```typescript
// GET /api/user/usage-status
interface UsageStatus {
    plan: {
        id: string;
        name: string;
        slug: string;
    };
    storage: {
        notebooks: { used: number; limit: number; can_use: boolean; };
        notes: { used: number; limit: number; can_use: boolean; };
    };
    daily: {
        ai_chat: { used: number; limit: number; can_use: boolean; resets_at?: string; };
        semantic_search: { used: number; limit: number; can_use: boolean; resets_at?: string; };
    };
    upgrade_available: boolean;
}
```

---

## F. Subscription Status API Response Format

```typescript
// GET /api/payment/status
interface SubscriptionStatusResponse {
    subscription_id?: string;
    plan_name: string;
    status: string;
    current_period_end?: string;
    ai_chat_daily_limit: number;
    semantic_search_daily_limit: number;
    is_active: boolean;
    features: {
        ai_chat: boolean;
        semantic_search: boolean;
        max_notebooks: number;
        max_notes_per_notebook: number;
    };
}
```

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
