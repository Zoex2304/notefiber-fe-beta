# Dokumentasi Fitur: Payment Flow

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend  
**Payment Gateway:** Midtrans Snap

---

## Alur Data Semantik (End-to-End)

```
[User Melihat Pricing Plans]
    -> [Klik "Subscribe" pada Plan]
    -> [Navigate ke /checkout?plan={slug}]
    -> [Fetch Order Summary dari Backend]
    -> [User Isi Billing Form (Country -> State -> City -> Zip)]
    -> [Submit Checkout -> API POST -> Dapat Snap Token]
    -> [Midtrans Snap Popup Opens]
    -> [User Selesaikan Pembayaran di Midtrans]
    -> [Callback: onSuccess/onPending/onError/onClose]
    -> [Redirect ke Workspace (/app)]
```

---

## A. Laporan Implementasi Fitur Payment Flow

### Deskripsi Fungsional

Fitur ini menyediakan alur pembayaran lengkap dari melihat pricing hingga menyelesaikan transaksi. Menggunakan **Midtrans Snap** sebagai payment gateway yang menampilkan popup pembayaran dengan berbagai metode (CC, bank transfer, e-wallet, dll).

**Tahapan Flow:**

| Tahap | Halaman/Komponen | Tujuan |
|-------|------------------|--------|
| 1. View Plans | [AppPricing.tsx](file:///d:/notetaker/notefiber-FE/src/pages/pricing/AppPricing.tsx) / [PricingModal.tsx](file:///d:/notetaker/notefiber-FE/src/components/modals/PricingModal.tsx) | Lihat dan pilih paket |
| 2. Checkout | [Checkout.tsx](file:///d:/notetaker/notefiber-FE/src/pages/checkout/Checkout.tsx) | Isi billing info |
| 3. Payment | Midtrans Snap Popup | Selesaikan pembayaran |
| 4. Callback | [Checkout.tsx](file:///d:/notetaker/notefiber-FE/src/pages/checkout/Checkout.tsx) handlers | Handle hasil payment |

**API Endpoints:**

| Operation | Endpoint | Deskripsi |
|-----------|----------|-----------|
| Get Plans | `GET /plans` | List paket untuk pricing modal |
| Get Summary | `GET /payment/summary?plan_id=` | Kalkulasi harga (subtotal, tax, total) |
| Checkout | `POST /payment/checkout` | Initiate transaction, dapat snap_token |

### Visualisasi

> [PLACEHOLDER SCREENSHOT - PRICING PAGE]
> *Gambar 1: Halaman pricing dengan pilihan paket Free, Pro, dan Premium.*

> [PLACEHOLDER SCREENSHOT - CHECKOUT PAGE]
> *Gambar 2: Halaman checkout dengan billing form (kiri) dan order summary (kanan).*

> [PLACEHOLDER SCREENSHOT - BILLING FORM]
> *Gambar 3: Form dengan cascading dropdowns (Country -> State -> City -> ZIP).*

> [PLACEHOLDER SCREENSHOT - MIDTRANS POPUP]
> *Gambar 4: Midtrans Snap popup dengan opsi pembayaran.*

> [PLACEHOLDER SCREENSHOT - PAYMENT SUCCESS]
> *Gambar 5: Toast notification "Payment successful!" sebelum redirect.*

---

## B. Bedah Arsitektur & Komponen

---

### [src/pages/pricing/AppPricing.tsx](file:///d:/notetaker/notefiber-FE/src/pages/pricing/AppPricing.tsx)
**Layer Terdeteksi:** `Page Component (Plan Selection)`

**Narasi Operasional:**

Halaman ini menampilkan pricing plans dalam aplikasi (untuk user yang sudah login). Menggunakan komponen `PricingDisplay` yang reusable dan menambahkan header dengan tombol back ke workspace. User yang memilih paket akan diarahkan ke halaman checkout.

```tsx
export default function AppPricing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col py-12">
            <div className="w-full max-w-7xl mx-auto px-4">
                <div className="flex justify-center items-center relative">
                    <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/app' })}>
                        <ArrowLeft />
                    </Button>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">Subscription Plans</h1>
                        <p className="text-gray-500">Choose the perfect plan for your needs</p>
                    </div>
                </div>

                <PricingDisplay showSwitcher={true} />
            </div>
        </div>
    );
}
```
*Caption: Snippet 1: Halaman pricing dengan header dan reusable display.*

---

### [src/components/modals/PricingModal.tsx](file:///d:/notetaker/notefiber-FE/src/components/modals/PricingModal.tsx)
**Layer Terdeteksi:** `UI Component (Upgrade Prompt)`

**Narasi Operasional:**

Modal ini muncul saat user mencapai limit fitur (notebook, note, AI chat, dll). Menampilkan informasi limit yang terpakai dan opsi untuk upgrade. Menggunakan `PricingDisplay` yang sama dengan halaman pricing untuk konsistensi.

Handler [handleSelectPlan](file:///d:/notetaker/notefiber-FE/src/components/modals/PricingModal.tsx#35-43) menutup modal dan navigate ke pricing page untuk paket berbayar, atau ke workspace untuk paket free.

```tsx
export function PricingModal({
    isOpen,
    onClose,
    featureName = "This feature",
    limitInfo,
    currentPlanSlug
}: PricingModalProps) {
    const navigate = useNavigate();

    const handleSelectPlan = (planSlug: string) => {
        onClose();
        if (planSlug === 'free') {
            navigate({ to: "/app" });
        } else {
            navigate({ to: "/pricing" });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[1400px]">
                <DialogHeader>
                    <DialogTitle>Upgrade Your Plan</DialogTitle>
                    <DialogDescription>
                        {limitInfo ? (
                            <span>You've used <strong>{limitInfo.used}/{limitInfo.limit}</strong> {featureName}.</span>
                        ) : (
                            <span><strong>{featureName}</strong> is available on higher plans.</span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <PricingDisplay onPlanSelect={handleSelectPlan} currentPlanSlug={currentPlanSlug} showSwitcher={true} />

                <DialogFooter>
                    <Button onClick={onClose}>Maybe Later</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
```
*Caption: Snippet 2: Modal upgrade dengan limit info dan pricing display.*

---

### [src/pages/checkout/Checkout.tsx](file:///d:/notetaker/notefiber-FE/src/pages/checkout/Checkout.tsx)
**Layer Terdeteksi:** `Page Component (Payment Orchestrator)`

**Narasi Operasional:**

Komponen ini adalah pusat alur checkout. Mengambil `plan` dari URL query param, fetch paket dari backend, dan menampilkan billing form + order summary.

**Flow:**
1. Redirect ke signin jika tidak authenticated
2. Parse `plan` slug dari URL
3. Fetch plans dan cari yang matching
4. Redirect ke /app jika free plan (tidak perlu checkout)
5. Fetch order summary untuk kalkulasi harga
6. Handle form submit dengan `checkoutMutation`
7. Buka Midtrans Snap popup dengan snap_token
8. Handle callbacks (success/pending/error/close)

```tsx
export default function Checkout() {
    const search = useSearch({ strict: false });
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate({ to: "/signin", search: { redirect: "/checkout" } });
        }
    }, [isAuthenticated, navigate]);

    // Get Data
    const planSlug = (search as { plan?: string }).plan || "pro";
    const { data: plansResponse, isLoading: isLoadingPlans } = useSubscriptionPlans();
    const checkoutMutation = useCheckout();

    const plans = plansResponse?.data || [];
    const selectedPlan = plans.find(p => p.slug === planSlug) || plans[0];

    // Redirect Free Plan to Dashboard
    useEffect(() => {
        if (!isLoadingPlans && selectedPlan) {
            if (selectedPlan.price === 0 || selectedPlan.slug === 'free') {
                toast.info("Free plan selected. Redirecting to dashboard...");
                navigate({ to: "/app" });
            }
        }
    }, [selectedPlan, isLoadingPlans, navigate]);

    const { data: orderSummaryResponse, isLoading: isLoadingSummary } = useOrderSummary(selectedPlan?.id);
    const orderSummary = orderSummaryResponse?.data;
```
*Caption: Snippet 3: Setup dengan authentication guard dan data fetching.*

```tsx
    async function handleCheckout(data: CheckoutFormValues) {
        if (!selectedPlan?.id) {
            toast.error("Invalid plan selected");
            return;
        }

        const checkoutPayload = {
            plan_id: selectedPlan.id,
            ...data  // Billing info from form
        };

        checkoutMutation.mutate(checkoutPayload, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    const { snap_token, snap_redirect_url } = response.data;

                    if (window.snap) {
                        // Open Midtrans Snap popup
                        window.snap.pay(snap_token, {
                            onSuccess: function () {
                                toast.success("Payment successful!");
                                navigate({ to: "/app" });
                            },
                            onPending: function () {
                                toast.info("Payment pending...");
                                navigate({ to: "/app" });
                            },
                            onError: function (result) {
                                toast.error("Payment failed");
                                console.error(result);
                            },
                            onClose: function () {
                                toast.warning("Payment window closed");
                            }
                        });
                    } else if (snap_redirect_url) {
                        // Fallback: redirect to Midtrans page
                        window.location.href = snap_redirect_url;
                    } else {
                        toast.error("Payment gateway not initialized");
                    }
                }
            },
            onError: (error) => {
                toast.error(error.message || "An error occurred during checkout");
            }
        });
    }
```
*Caption: Snippet 4: Handler checkout dengan Midtrans Snap integration.*

```tsx
    return (
        <CheckoutLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Billing Form */}
                <div className="lg:col-span-2">
                    <BillingForm user={user} onSubmit={handleCheckout} isPending={checkoutMutation.isPending} />
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <OrderSummary
                        isLoading={isLoadingSummary || isLoadingPlans}
                        planName={orderSummary?.plan_name}
                        billingPeriod={orderSummary?.billing_period}
                        pricePerUnit={orderSummary?.price_per_unit}
                        subtotal={orderSummary?.subtotal}
                        tax={orderSummary?.tax}
                        total={orderSummary?.total}
                        currency={orderSummary?.currency}
                    />
                    <div className="mt-6 text-center text-gray-500">
                        ðŸ”’ Secure SSL Payment
                    </div>
                </div>
            </div>
        </CheckoutLayout>
    );
}
```
*Caption: Snippet 5: Layout checkout dengan billing form dan order summary.*

---

### [src/pages/checkout/components/BillingForm.tsx](file:///d:/notetaker/notefiber-FE/src/pages/checkout/components/BillingForm.tsx)
**Layer Terdeteksi:** `UI Component (Form with Cascading Dropdowns)`

**Narasi Operasional:**

Form ini mengumpulkan informasi billing user dengan fitur **cascading dropdowns** untuk lokasi â€” pemilihan Country mempengaruhi State, State mempengaruhi City, dan City mempengaruhi ZIP code.

**Fitur Khusus:**
- Auto-populate first/last name dari user profile
- Debounced city search (min 2 characters)
- Fallback ke manual input jika data lokasi tidak tersedia
- Reset cascading values saat parent berubah

```tsx
export function BillingForm({ user, onSubmit, isPending }: BillingFormProps) {
    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            first_name: user?.full_name?.split(" ")[0] || "",
            last_name: user?.full_name?.split(" ").slice(1).join(" ") || "",
            email: user?.email || "",
            phone: "",
            address_line1: "",
            country: "ID", // Default Indonesia
            city: "",
            state: "",
            postal_code: "",
        },
    });

    // Watch values for cascading dropdowns
    const selectedCountry = form.watch("country");
    const selectedState = form.watch("state");
    const selectedCity = form.watch("city");

    // City Search with Debounce
    const [citySearch, setCitySearch] = useState("");
    const debouncedCitySearch = useDebounce(citySearch, 500);

    // Manual Input Fallback States
    const [isManualState, setIsManualState] = useState(false);
    const [isManualCity, setIsManualCity] = useState(false);
    const [isManualZip, setIsManualZip] = useState(false);

    // Location Data Hooks
    const { data: statesData, isLoading: isLoadingStates } = useStates({ country: selectedCountry }, !!selectedCountry);
    const { data: citiesData, isLoading: isLoadingCities } = useCities({ country: selectedCountry, query: debouncedCitySearch, state: selectedStateCode }, ...);
    const { data: zipcodesData, isLoading: isLoadingZipcodes } = useZipcodes({ country: selectedCountry, city: selectedCity, state: selectedState }, ...);
```
*Caption: Snippet 6: Form setup dengan cascading dropdown state management.*

```tsx
    // Reset Logic: Country change resets all downstream
    useEffect(() => {
        form.setValue("state", "");
        form.setValue("city", "");
        form.setValue("postal_code", "");
        setIsManualState(false);
        setIsManualCity(false);
        setIsManualZip(false);
    }, [selectedCountry, form]);

    // Auto Manual Fallback: If no states available, switch to manual
    useEffect(() => {
        if (!isLoadingStates && statesData && statesData.states.length === 0 && selectedCountry) {
            setIsManualState(true);
            setIsManualCity(true);
            setIsManualZip(true);
        }
    }, [isLoadingStates, statesData, selectedCountry]);
```
*Caption: Snippet 7: Reset logic dan automatic manual fallback.*

```tsx
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField name="first_name" render={...} />
                    <FormField name="last_name" render={...} />
                </div>

                <FormField name="email" render={...} />
                <FormField name="phone" render={...} />
                <FormField name="address_line1" render={...} />

                {/* Location Cascading */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField name="country" render={({ field }) => (
                        <Combobox options={COUNTRIES} value={field.value} onChange={field.onChange} />
                    )} />
                    <FormField name="state" render={({ field }) => (
                        isManualState
                            ? <Input placeholder="Enter state manually" {...field} />
                            : <Combobox options={statesData?.states.map(...)} ... />
                    )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField name="city" render={({ field }) => (
                        isManualCity
                            ? <Input placeholder="Enter city manually" {...field} />
                            : <Combobox options={filteredCities.map(...)} onSearchChange={setCitySearch} ... />
                    )} />
                    <FormField name="postal_code" render={({ field }) => (
                        isManualZip
                            ? <Input placeholder="Enter ZIP Code" {...field} />
                            : <Combobox options={zipcodesData?.zipcodes.map(...)} ... />
                    )} />
                </div>

                <Button type="submit" disabled={isPending}>
                    {isPending ? "Processing..." : "Complete Purchase"}
                </Button>
            </form>
        </Form>
    );
}
```
*Caption: Snippet 8: Form fields dengan conditional combobox/input.*

---

### [src/pages/checkout/components/OrderSummary.tsx](file:///d:/notetaker/notefiber-FE/src/pages/checkout/components/OrderSummary.tsx)
**Layer Terdeteksi:** `UI Component (Price Display)`

**Narasi Operasional:**

Komponen ini menampilkan ringkasan pesanan dengan breakdown harga: plan name, billing period, price per unit, subtotal, tax, dan total. Data diambil dari backend `/payment/summary` endpoint untuk memastikan kalkulasi yang akurat.

```tsx
export function OrderSummary({
    planName = "Pro Plan",
    billingPeriod = "month",
    pricePerUnit = "$19.00/month",
    subtotal = 19.00,
    tax = 0,
    total = 19.00,
    currency = "USD",
    isLoading = false
}: OrderSummaryProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    };

    if (isLoading) {
        return <div className="animate-pulse">...</div>;
    }

    return (
        <div className="bg-white rounded-2xl p-6">
            <h3 className="text-lg font-semibold">Order Summary</h3>

            <div className="flex justify-between mb-4">
                <div>
                    <h4>{planName}</h4>
                    <p>Billed {billingPeriod}</p>
                </div>
                <span>{pricePerUnit}</span>
            </div>

            <Separator />

            <div className="space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(tax)}</span>
                </div>
            </div>

            <Separator />

            <div className="flex justify-between">
                <span>Total</span>
                <div>
                    <span className="text-xl font-bold">{formatCurrency(total)}</span>
                    <span className="block text-sm">due today</span>
                </div>
            </div>
        </div>
    );
}
```
*Caption: Snippet 9: Order summary dengan currency formatting.*

---

### [src/hooks/payment/useCheckout.ts](file:///d:/notetaker/notefiber-FE/src/hooks/payment/useCheckout.ts)
**Layer Terdeteksi:** `Custom Hook (API Mutation)`

**Narasi Operasional:**

Hook ini mengenkapsulasi panggilan API checkout. Mengirim billing data dan plan_id ke backend, menerima `snap_token` dan `snap_redirect_url` untuk integrasi Midtrans.

```tsx
export const useCheckout = () => {
    return useMutation<ApiResponse<CheckoutResponse>, ApiError, CheckoutRequest>({
        mutationFn: (data) => paymentService.checkout(data),
    });
};
```
*Caption: Snippet 10: Checkout mutation hook.*

---

### [src/api/services/payment/payment.service.ts](file:///d:/notetaker/notefiber-FE/src/api/services/payment/payment.service.ts)
**Layer Terdeteksi:** `Service Layer (API Client)`

**Narasi Operasional:**

File ini mengonsolidasikan method API untuk operasi payment. Mencakup fetch plans, checkout, order summary, dan subscription status.

```tsx
export const paymentService = {
    getPlans: async (): Promise<ApiResponse<Plan[]>> => {
        const response = await apiClient.get<ApiResponse<Plan[]>>(ENDPOINTS.PAYMENT.PLANS);
        return response.data;
    },

    getPublicPlans: async (): Promise<ApiResponse<PublicPlan[]>> => {
        const response = await apiClient.get<ApiResponse<PublicPlan[]>>(ENDPOINTS.PUBLIC.PLANS);
        return response.data;
    },

    checkout: async (data: CheckoutRequest): Promise<ApiResponse<CheckoutResponse>> => {
        const response = await apiClient.post<ApiResponse<CheckoutResponse>>(ENDPOINTS.PAYMENT.CHECKOUT, data);
        return response.data;
    },

    getOrderSummary: async (planId: string): Promise<ApiResponse<OrderSummaryResponse>> => {
        const response = await apiClient.get<ApiResponse<OrderSummaryResponse>>(ENDPOINTS.PAYMENT.SUMMARY, {
            params: { plan_id: planId }
        });
        return response.data;
    },

    getSubscriptionStatus: async (): Promise<ApiResponse<SubscriptionStatusResponse>> => {
        const response = await apiClient.get<ApiResponse<SubscriptionStatusResponse>>(ENDPOINTS.PAYMENT.STATUS);
        return response.data;
    },
};
```
*Caption: Snippet 11: Payment service methods.*

---

### [src/api/services/payment/payment.schemas.ts](file:///d:/notetaker/notefiber-FE/src/api/services/payment/payment.schemas.ts)
**Layer Terdeteksi:** `Schema Definition (API Contract)`

**Narasi Operasional:**

File ini mendefinisikan skema Zod untuk validasi struktur data payment. Mencakup plan, checkout request/response, order summary, dan subscription status.

```tsx
export const checkoutRequestSchema = z.object({
    plan_id: z.string(),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    phone: z.string(),
    address_line1: z.string(),
    address_line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
});

export const checkoutResponseSchema = z.object({
    subscription_id: z.string(),
    order_id: z.string(),
    status: z.string(),
    snap_token: z.string(),       // Token untuk Midtrans Snap
    snap_redirect_url: z.string(), // Fallback URL
});

export const orderSummaryResponseSchema = z.object({
    plan_name: z.string(),
    billing_period: z.string(),
    price_per_unit: z.string(),
    subtotal: z.number(),
    tax: z.number(),
    total: z.number(),
    currency: z.string(),
});
```
*Caption: Snippet 12: Schemas untuk checkout dan order summary.*

---

## C. Ringkasan Ketergantungan Komponen

| Komponen | Menerima Dari | Meneruskan Ke |
|----------|---------------|---------------|
| [AppPricing.tsx](file:///d:/notetaker/notefiber-FE/src/pages/pricing/AppPricing.tsx) | URL navigation | `PricingDisplay` |
| [PricingModal.tsx](file:///d:/notetaker/notefiber-FE/src/components/modals/PricingModal.tsx) | Limit trigger | `PricingDisplay`, Navigation |
| [Checkout.tsx](file:///d:/notetaker/notefiber-FE/src/pages/checkout/Checkout.tsx) | URL params, Auth | [BillingForm](file:///d:/notetaker/notefiber-FE/src/pages/checkout/components/BillingForm.tsx#38-377), [OrderSummary](file:///d:/notetaker/notefiber-FE/src/pages/checkout/components/OrderSummary.tsx#14-82), Midtrans |
| [BillingForm.tsx](file:///d:/notetaker/notefiber-FE/src/pages/checkout/components/BillingForm.tsx) | User data | Parent callback (onSubmit) |
| [OrderSummary.tsx](file:///d:/notetaker/notefiber-FE/src/pages/checkout/components/OrderSummary.tsx) | API summary data | Display only |
| [useCheckout.ts](file:///d:/notetaker/notefiber-FE/src/hooks/payment/useCheckout.ts) | Form data | `paymentService.checkout` |

---

## D. Diagram Payment Flow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Step 1: View Pricing                                            â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  AppPricing / PricingModal                                â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                â”‚   â”‚
â”‚  â”‚  â”‚   Free   â”‚  â”‚   Pro    â”‚  â”‚ Premium  â”‚                â”‚   â”‚
â”‚  â”‚  â”‚  $0/mo   â”‚  â”‚ $19/mo   â”‚  â”‚ $49/mo   â”‚                â”‚   â”‚
â”‚  â”‚  â”‚ [Start]  â”‚  â”‚[Subscribe]â”‚ â”‚[Subscribe]â”‚               â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                        â”‚                                         â”‚
â”‚                        â–¼                                         â”‚
â”‚  Step 2: Checkout Page (/checkout?plan=pro)                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”‚   â”‚
â”‚  â”‚  â”‚    BillingForm      â”‚  â”‚   OrderSummary      â”‚        â”‚   â”‚
â”‚  â”‚  â”‚  First Name: [___]  â”‚  â”‚   Pro Plan          â”‚        â”‚   â”‚
â”‚  â”‚  â”‚  Last Name:  [___]  â”‚  â”‚   Billed monthly    â”‚        â”‚   â”‚
â”‚  â”‚  â”‚  Email:      [___]  â”‚  â”‚                     â”‚        â”‚   â”‚
â”‚  â”‚  â”‚  Phone:      [___]  â”‚  â”‚   Subtotal: $19.00  â”‚        â”‚   â”‚
â”‚  â”‚  â”‚  Address:    [___]  â”‚  â”‚   Tax:      $0.00   â”‚        â”‚   â”‚
â”‚  â”‚  â”‚  Country:    [â–¼ID]  â”‚  â”‚   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚        â”‚   â”‚
â”‚  â”‚  â”‚  State:      [â–¼  ]  â”‚  â”‚   Total:    $19.00  â”‚        â”‚   â”‚
â”‚  â”‚  â”‚  City:       [â–¼  ]  â”‚  â”‚                     â”‚        â”‚   â”‚
â”‚  â”‚  â”‚  ZIP:        [â–¼  ]  â”‚  â”‚   ðŸ”’ Secure SSL     â”‚        â”‚   â”‚
â”‚  â”‚  â”‚                     â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â”‚   â”‚
â”‚  â”‚  â”‚  [Complete Purchase]â”‚                                  â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                  â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                â”‚                                                 â”‚
â”‚                â–¼                                                 â”‚
â”‚  Step 3: API Checkout                                            â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  POST /payment/checkout                                   â”‚   â”‚
â”‚  â”‚  Request: { plan_id, billing_info... }                    â”‚   â”‚
â”‚  â”‚  Response: { snap_token, snap_redirect_url }              â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                â”‚                                                 â”‚
â”‚                â–¼                                                 â”‚
â”‚  Step 4: Midtrans Snap Popup                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚  window.snap.pay(snap_token, { callbacks })               â”‚   â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                   â”‚   â”‚
â”‚  â”‚  â”‚     Midtrans Payment Popup         â”‚                   â”‚   â”‚
â”‚  â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚                   â”‚   â”‚
â”‚  â”‚  â”‚  â”‚  Credit Card                 â”‚  â”‚                   â”‚   â”‚
â”‚  â”‚  â”‚  â”‚  Bank Transfer (VA)          â”‚  â”‚                   â”‚   â”‚
â”‚  â”‚  â”‚  â”‚  GoPay / OVO / DANA          â”‚  â”‚                   â”‚   â”‚
â”‚  â”‚  â”‚  â”‚  Alfamart / Indomaret        â”‚  â”‚                   â”‚   â”‚
â”‚  â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚                   â”‚   â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                   â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                â”‚                                                 â”‚
â”‚    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                       â”‚
â”‚    â–¼           â–¼           â–¼            â–¼                       â”‚
â”‚  onSuccess  onPending   onError     onClose                     â”‚
â”‚  "Payment   "Payment    "Payment    "Window                     â”‚
â”‚  success!"   pending"    failed"     closed"                    â”‚
â”‚    â”‚           â”‚           â”‚            â”‚                       â”‚
â”‚    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                       â”‚
â”‚                â”‚                                                 â”‚
â”‚                â–¼                                                 â”‚
â”‚  Step 5: Redirect to /app                                        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## E. Midtrans Integration

```tsx
// Extend Window for TypeScript
interface MidtransSnap {
    pay: (token: string, options: {
        onSuccess?: (result: MidtransSnapResult) => void;
        onPending?: (result: MidtransSnapResult) => void;
        onError?: (result: MidtransSnapResult) => void;
        onClose?: () => void;
    }) => void;
}

declare global {
    interface Window {
        snap: MidtransSnap;
    }
}

// Usage
if (window.snap) {
    window.snap.pay(snap_token, {
        onSuccess: () => navigate({ to: "/app" }),
        onPending: () => navigate({ to: "/app" }),
        onError: (r) => console.error(r),
        onClose: () => toast.warning("Payment closed"),
    });
} else if (snap_redirect_url) {
    // Fallback for mobile/blocked popups
    window.location.href = snap_redirect_url;
}
```

**Note:** Script Midtrans Snap harus dimuat di `index.html`:
```html
<script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="YOUR_CLIENT_KEY"></script>
```

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
