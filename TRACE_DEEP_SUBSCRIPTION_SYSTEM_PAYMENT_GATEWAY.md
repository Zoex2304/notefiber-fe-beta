# TRACE DEEP: Subscription System & Payment Gateway
## NoteFiber Frontend Architecture - Path Upstream Menuju Downstream

**Document Type:** Trace Deep Analysis  
**Focus Domain:** Payment Processing & Subscription Management  
**Payment Gateway:** Midtrans Snap  
**Last Updated:** December 25, 2024

---

## Executive Summary

Dokumen ini memetakan aliran data **upstream menuju downstream** dalam sistem pembayaran dan manajemen subscription NoteFiber. Mencakup tiga tahapan utama:

1. **Pricing Display** → User melihat plans dan memilih paket
2. **Checkout Flow** → User mengisi billing info dan initiate payment
3. **Payment Processing** → Midtrans Snap popup, user melakukan pembayaran, callback handling

Sistem ini mengintegrasikan **Midtrans Snap** sebagai payment gateway, dengan cascading dropdowns untuk billing address, optimistic order summary updates, dan complete error recovery untuk payment failures.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SUBSCRIPTION & PAYMENT SYSTEM                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LAYER 1: PRICING DISPLAY                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Pages: AppPricing.tsx / Landing Page                                 │   │
│  │ Components: PricingDisplay → [PricingCard] × N                       │   │
│  │ API: GET /api/plans (usePublicPlans hook)                            │   │
│  │ State: Monthly/Yearly toggle, plan selection                         │   │
│  │ Actions: Free plan → /app | Paid plan → /checkout?plan=slug         │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                           ↓                                                  │
│  LAYER 2: CHECKOUT FORM                                                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Page: Checkout.tsx                                                   │   │
│  │ Components: [BillingForm] + [OrderSummary]                           │   │
│  │ API: GET /payment/summary?plan_id= (useOrderSummary hook)            │   │
│  │ State: Form validation, cascading location dropdowns                 │   │
│  │ Actions: Form submit → POST /payment/checkout                        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                           ↓                                                  │
│  LAYER 3: PAYMENT GATEWAY                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Gateway: Midtrans Snap                                               │   │
│  │ Interface: window.snap.pay(snap_token, callbacks)                    │   │
│  │ Callbacks: onSuccess, onPending, onError, onClose                    │   │
│  │ Response: Subscription ID, Order ID, snap_token, snap_redirect_url   │   │
│  │ Result: Payment success → Navigate to /app                           │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Trace Deep #1: Pricing Display Flow

### Upstream: Component Mount & Data Fetching

**Entry Point:** User navigates to `/pricing` or views pricing modal

```tsx
// AppPricing.tsx - Page component
export default function AppPricing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col py-12">
            <PricingDisplay showSwitcher={true} />
        </div>
    );
}
```

**Step 1: PricingDisplay Component Mount**
- Component initializes with `usePublicPlans()` hook
- Hook triggers `GET /api/plans` API call

```tsx
// Hook: usePublicPlans (extracted from PricingDisplay)
export const usePublicPlans = () => {
    return useQuery({
        queryKey: ['publicPlans'],
        queryFn: async () => {
            const response = await paymentService.getPublicPlans();
            return response.data;
        },
    });
};
```

**Step 2: API Request Formation**

```typescript
// paymentService.ts
getPublicPlans: async (): Promise<ApiResponse<PublicPlan[]>> => {
    const response = await apiClient.get<ApiResponse<PublicPlan[]>>(
        ENDPOINTS.PAYMENT.GET_PLANS
    );
    return response.data;
}

// ENDPOINTS definition
ENDPOINTS.PAYMENT.GET_PLANS = '/api/plans'
```

**Step 3: Backend Response**

Backend returns array of `PublicPlan` objects:

```typescript
// Example response structure from payment.schemas.ts
{
    id: "plan_pro_monthly",
    name: "Pro",
    slug: "pro",
    tagline: "For growing projects",
    price: 19,  // In USD or local currency
    billing_period: "month",
    is_most_popular: true,
    limits: {
        max_notebooks: 50,
        max_notes_per_notebook: 1000,
        ai_chat_daily: 100,
        semantic_search_daily: 50
    },
    features: [
        { key: "ai_chat", text: "AI Chat", is_enabled: true },
        { key: "semantic_search", text: "Semantic Search", is_enabled: true },
        // ... more features
    ]
}
```

### Midstream: Data Transformation & UI Rendering

**Step 4: Data Processing in PricingDisplay**

```tsx
// PricingDisplay component
function PricingDisplay({ showSwitcher = false, onPlanSelect }: Props) {
    const { data: plans, isLoading } = usePublicPlans();
    const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');

    if (isLoading) return <LoadingState />;

    // Transform API data to UI format
    const filteredPlans = plans?.filter(p => p.billing_period === billingPeriod) || [];

    const cardDataList: PricingCardData[] = filteredPlans.map(plan => ({
        title: plan.name,
        price: `$${plan.price}`,
        period: plan.billing_period,
        description: plan.tagline || 'Reliable solution',
        features: plan.features.map(f => f.text),
        isPopular: plan.is_most_popular,
        slug: plan.slug,
        // Additional modal usage properties (if in modal context)
        onClick: onPlanSelect ? () => onPlanSelect(plan) : undefined,
        buttonText: onPlanSelect ? 'Upgrade' : 'Get Started',
    }));

    return (
        <div>
            {showSwitcher && (
                <SwitchPricing 
                    selected={billingPeriod} 
                    onChange={setBillingPeriod} 
                />
            )}
            <PricingSection plans={cardDataList} />
        </div>
    );
}
```

**Step 5: PricingCard Rendering**

```tsx
// PricingCard component with CTA logic
export function PricingCard({ data, className }: PricingCardProps) {
    const isFree = data.slug === 'free' || data.price === '$0.00';
    const navigate = useNavigate();

    const handleSelect = () => {
        if (data.onClick) {
            // Modal context: call custom handler
            data.onClick();
        } else if (isFree) {
            // Free plan: navigate to app
            navigate({ to: '/app' });
        } else {
            // Paid plan: navigate to checkout with plan slug
            navigate({ to: `/checkout?plan=${data.slug}` });
        }
    };

    return (
        <div className="pricing-card">
            {/* Card UI */}
            <h3>{data.title}</h3>
            <span className="text-xl font-bold">{data.price}</span>
            {data.period && <span>/{data.period}</span>}
            <p>{data.description}</p>
            
            {/* Feature List */}
            <ul>
                {data.features?.map(feature => (
                    <li key={feature}>
                        <Check className="w-4 h-4 text-green-600" />
                        {feature}
                    </li>
                ))}
            </ul>

            {/* CTA Button with "Most Popular" Badge */}
            {data.isPopular && (
                <div className="ribbon">Most Popular</div>
            )}

            <Button 
                onClick={handleSelect} 
                disabled={data.isDisabled}
            >
                {data.buttonText || 'Get Started'}
            </Button>
        </div>
    );
}
```

### Downstream: Navigation Decision

**Step 6: Route Navigation**

```
Decision Tree:
├── User clicks "Get Started" on Free Plan
│   └── Navigate to /app (direct access to dashboard)
│
├── User clicks "Get Started" on Paid Plan
│   └── Navigate to /checkout?plan=pro (or /checkout?plan=premium)
│
└── User clicks "Upgrade" in Modal (from usage limit dialog)
    └── Navigate to /pricing (or handle with navigation back)
```

**State Diagram: Pricing Flow**

```
┌──────────────────┐
│  Component Mount │
└────────┬─────────┘
         │ usePublicPlans()
         ↓
┌──────────────────────────┐
│  Fetch Plans (isLoading) │
└────────┬─────────────────┘
         │ Success
         ↓
┌──────────────────────────┐
│  Filter by Billing Period│
│  (month/year toggle)     │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│  Transform to PricingCard│
│  Data Format             │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│  Render PricingCard UI   │
│  with CTA Button         │
└────────┬─────────────────┘
         │
         ├─→ [Free Plan Click]      → Navigate to /app
         │
         └─→ [Paid Plan Click]      → Navigate to /checkout?plan=slug
                                       (Query string carries plan selection)
```

---

## Trace Deep #2: Checkout Form & Order Summary

### Upstream: Route Params & Component Initialization

**Entry Point:** User navigates to `/checkout?plan=pro`

```tsx
// Checkout.tsx - Main entry point
export default function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const planSlug = searchParams.get('plan');

    // Authentication check
    const { user, isAuthenticated } = useAuth();
    if (!isAuthenticated || !user) {
        navigate({ to: '/auth/signin' });
        return null;
    }

    // Fetch order summary
    const { 
        data: orderSummary, 
        isLoading: isLoadingSummary 
    } = useOrderSummary(planSlug || '');

    // Fetch all plans to match slug with ID
    const { 
        data: allPlans, 
        isLoading: isLoadingPlans 
    } = usePublicPlans();

    // ... rest of component
}
```

**Step 1: Plan Matching**

```tsx
// Inside Checkout component
const matchedPlan = allPlans?.find(p => p.slug === planSlug);
const planId = matchedPlan?.id;

// Handle free plan
const isFreeplan = matchedPlan?.price === 0 || planSlug === 'free';
if (isFreeplan) {
    navigate({ to: '/app' });
    return null;
}

// Fetch order summary using plan ID
useOrderSummary(planId || '');
```

**Step 2: Order Summary API Call**

```typescript
// paymentService.ts
getOrderSummary: async (planId: string): Promise<ApiResponse<OrderSummaryResponse>> => {
    const response = await apiClient.get<ApiResponse<OrderSummaryResponse>>(
        ENDPOINTS.PAYMENT.SUMMARY,
        { params: { plan_id: planId } }
    );
    return response.data;
}

// Hook wrapper
export const useOrderSummary = (planId: string) => {
    return useQuery({
        queryKey: ['orderSummary', planId],
        queryFn: () => paymentService.getOrderSummary(planId),
        enabled: !!planId,
    });
};
```

### Midstream: Billing Form & Location Cascading

**Step 3: BillingForm Component**

The form uses **cascading dropdowns** for location fields:
- Country → State → City → ZIP Code

```tsx
// BillingForm.tsx - Comprehensive form with validation
export function BillingForm({ user, onSubmit, isPending }: BillingFormProps) {
    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            first_name: user?.full_name?.split(" ")[0] || "",
            last_name: user?.full_name?.split(" ").slice(1).join(" ") || "",
            email: user?.email || "",
            phone: "",
            address_line1: "",
            address_line2: "",
            country: "ID",  // Default to Indonesia
            city: "",
            state: "",
            postal_code: "",
        },
    });

    // Watch country selection for state/city cascading
    const selectedCountry = form.watch("country");
    const selectedState = form.watch("state");
    const selectedCity = form.watch("city");

    // Fetch states based on country selection
    const { data: statesData, isLoading: isLoadingStates } = useStates({
        country: selectedCountry,
        city: "dummy"
    }, !!selectedCountry);

    // Fetch cities based on state selection
    const { data: citiesData, isLoading: isLoadingCities } = useCities({
        country: selectedCountry,
        state: selectedState || ""
    }, !!selectedCountry && !!selectedState);

    // Fetch ZIP codes based on city selection
    const { data: zipcodes, isLoading: isLoadingZips } = useZipcodes({
        country: selectedCountry,
        state: selectedState || "",
        city: selectedCity || ""
    }, !!selectedCountry && !!selectedState && !!selectedCity);

    // Form field with Combobox for cascading selection
    return (
        <Form {...form}>
            {/* Country Selection */}
            <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Combobox
                            options={COUNTRIES}
                            value={field.value}
                            onChange={field.onChange}
                        />
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* State Selection - Depends on Country */}
            <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>State</FormLabel>
                        <Combobox
                            options={statesData?.states || []}
                            isLoading={isLoadingStates}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={isLoadingStates ? "Loading..." : "Select state"}
                        />
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* City Selection - Depends on State */}
            <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>City</FormLabel>
                        <Combobox
                            options={citiesData?.cities || []}
                            isLoading={isLoadingCities}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={isLoadingCities ? "Loading..." : "Select city"}
                        />
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* ZIP Code Selection - Depends on City */}
            <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <Combobox
                            options={zipcodes?.postcodes || []}
                            isLoading={isLoadingZips}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={isLoadingZips ? "Loading..." : "Select ZIP"}
                        />
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                Proceed to Payment
            </Button>
        </Form>
    );
}
```

**Step 4: Form Validation & Schema**

```typescript
// schema.ts - Zod validation schema
export const checkoutSchema = z.object({
    first_name: z.string().min(2, "First name is required"),
    last_name: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    address_line1: z.string().min(5, "Address is required"),
    address_line2: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postal_code: z.string().min(1, "ZIP Code is required"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
```

### Parallel: Order Summary Display

**Step 5: OrderSummary Component**

```tsx
// OrderSummary.tsx - Right column showing order details
export function OrderSummary({
    planName = "Pro Plan",
    billingPeriod = "month",
    pricePerUnit = "$19.00",
    subtotal = 19.00,
    tax = 0,
    total = 19.00,
    currency = "USD",
    isLoading = false
}: OrderSummaryProps) {
    // Loading state
    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
            </div>
        );
    }

    // Render order details
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

            {/* Plan Selection */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-medium text-gray-900">{planName}</h4>
                    <p className="text-sm text-gray-500">Billed {billingPeriod}</p>
                </div>
                <div className="text-right">
                    <span className="font-semibold text-gray-900">{pricePerUnit}</span>
                </div>
            </div>

            <Separator className="my-4" />

            {/* Subtotal & Tax Breakdown */}
            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">{formatCurrency(tax)}</span>
                </div>
            </div>

            <Separator className="my-4" />

            {/* Total Amount */}
            <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <div className="text-right">
                    <span className="text-xl font-bold text-royal-violet-base">
                        {formatCurrency(total)}
                    </span>
                    <span className="text-sm text-gray-500 block">due today</span>
                </div>
            </div>

            {/* Security Badge */}
            <div className="mt-6 text-center text-sm text-gray-500">
                <span>🔒 Secure SSL Payment</span>
            </div>
        </div>
    );
}
```

### Downstream: Form Submission Flow

**Step 6: Handle Checkout Submission**

```tsx
// Inside Checkout.tsx - Form submit handler
const checkoutMutation = useCheckout();

const handleCheckout = (formData: CheckoutFormValues) => {
    // Build checkout request
    const checkoutPayload: CheckoutRequest = {
        plan_id: planId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        country: formData.country,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
    };

    // Call mutation
    checkoutMutation.mutate(checkoutPayload, {
        onSuccess: (response) => {
            // Success: response contains snap_token
            // Proceed to payment gateway (see Trace Deep #3)
        },
        onError: (error) => {
            // Error handling
            // Show toast: "Failed to initiate checkout"
        }
    });
};

// Pass handler to BillingForm
<BillingForm
    user={user}
    onSubmit={handleCheckout}
    isPending={checkoutMutation.isPending}
/>
```

**Step 7: Checkout API Request**

```typescript
// paymentService.ts
checkout: async (data: CheckoutRequest): Promise<ApiResponse<CheckoutResponse>> => {
    const response = await apiClient.post<ApiResponse<CheckoutResponse>>(
        ENDPOINTS.PAYMENT.CHECKOUT,
        data
    );
    return response.data;
}

// Hook wrapper
export const useCheckout = () => {
    return useMutation<ApiResponse<CheckoutResponse>, ApiError, CheckoutRequest>({
        mutationFn: (data) => paymentService.checkout(data),
    });
};
```

**Step 8: Backend Response**

Backend returns `CheckoutResponse`:

```typescript
// Response structure from backend
{
    subscription_id: "sub_12345",
    order_id: "order_67890",
    status: "pending_payment",
    snap_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    snap_redirect_url: "https://app.sandbox.midtrans.com/snap/v2/vtweb/abc123"
}
```

**State Diagram: Checkout Flow**

```
┌───────────────────┐
│  Checkout Mount   │
└────────┬──────────┘
         │ Fetch plan & order summary
         ↓
┌───────────────────────────────────────┐
│  Render BillingForm + OrderSummary    │
│  - Display order details              │
│  - Show location cascading dropdowns  │
└────────┬──────────────────────────────┘
         │ User fills form
         ↓
┌───────────────────────────────────────┐
│  Validate Form (Zod Schema)           │
│  - Check required fields              │
│  - Validate email, phone, address     │
└────────┬──────────────────────────────┘
         │
         ├─→ [Validation Error]  → Show field error messages
         │
         └─→ [Validation Success] → POST /payment/checkout
                 ↓
            ┌───────────────────────────────────────┐
            │  useCheckout mutation                 │
            │  - isPending = true                   │
            │  - Disable form submit button         │
            └────────┬──────────────────────────────┘
                     │
                     ├─→ [Error Response] → Show error toast
                     │                     → Log error details
                     │
                     └─→ [Success Response] → Receive snap_token
                         → Proceed to Midtrans payment (Trace #3)
```

---

## Trace Deep #3: Payment Processing with Midtrans Snap

### Upstream: Response Processing

**Entry Point:** `checkoutMutation.onSuccess` receives `CheckoutResponse`

```tsx
// Inside handleCheckout function
const handleCheckout = (formData: CheckoutFormValues) => {
    checkoutMutation.mutate(checkoutPayload, {
        onSuccess: (response) => {
            const { snap_token, snap_redirect_url } = response.data;
            
            // Handle successful checkout response
            if (snap_token || snap_redirect_url) {
                // Open Midtrans Snap payment popup
                initiateMidtransPayment(snap_token, snap_redirect_url);
            }
        },
    });
};
```

### Midstream: Midtrans Snap Integration

**Step 1: Load Midtrans Snap Library**

The Snap library must be loaded in the HTML document:

```html
<!-- In index.html -->
<script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="YOUR_CLIENT_KEY"></script>
```

This creates the global `window.snap` object.

**Step 2: Snap Interface Definition**

```typescript
// From Checkout.tsx (implicit Midtrans Snap interface)
interface MidtransSnap {
    pay: (token: string, options: MidtransSnapOptions) => void;
}

interface MidtransSnapOptions {
    onSuccess: (result: MidtransPaymentResult) => void;
    onPending: (result: MidtransPaymentResult) => void;
    onError: (result: MidtransPaymentResult) => void;
    onClose: () => void;
}

interface MidtransPaymentResult {
    status_code: string;
    status_message: string;
    transaction_id: string;
    transaction_status: string;
    fraud_status: string;
}
```

**Step 3: Initiate Payment Popup**

```tsx
// Inside Checkout.tsx
const initiateMidtransPayment = (snap_token: string, snap_redirect_url: string) => {
    if (!window.snap) {
        toast.error("Payment gateway not loaded");
        return;
    }

    // Open Midtrans Snap popup with snap_token
    window.snap.pay(snap_token, {
        // Success callback
        onSuccess: function (result) {
            // Payment successful
            // result.transaction_status === 'capture' or 'settlement'
            toast.success("Payment successful!");
            
            // Redirect to workspace
            navigate({ to: "/app" });
            
            // Optional: Refresh subscription context
            // This will trigger UsageLimitsContext to refetch subscription status
        },

        // Pending callback (user hasn't completed payment yet)
        onPending: function (result) {
            // Payment pending
            // result.transaction_status === 'pending'
            toast.info("Payment pending...");
            
            // User is still in payment process
            navigate({ to: "/app" });
            
            // Subscription will be activated when payment is confirmed by bank
        },

        // Error callback (payment failed)
        onError: function (result) {
            // Payment failed
            // result.status_code !== '200'
            toast.error("Payment failed");
            console.error("Payment error:", result);
            
            // User remains on checkout page, can retry
        },

        // Close callback (user closed popup without completing)
        onClose: function () {
            // User closed the popup
            toast.warning("Payment window closed");
            
            // User remains on checkout page, can try again
        }
    });
};
```

**Step 4: Snap Popup Behavior**

```
┌─────────────────────────────────────────────────────┐
│  window.snap.pay(snap_token, callbacks)             │
│  - Opens popup window / iframe                      │
│  - Loads Midtrans payment form                      │
│  - Displays payment methods:                        │
│    • Credit/Debit Card                              │
│    • Bank Transfer                                  │
│    • E-wallet (GCash, OVO, Dana, etc.)              │
│    • QR Code                                        │
└────────────┬────────────────────────────────────────┘
             │
             ├─→ [User Selects Payment Method]
             │   └─→ [Enters Payment Details]
             │       └─→ [Submits]
             │           ↓
             │   ┌──────────────────────┐
             │   │ Backend Processes    │
             │   │ Payment with         │
             │   │ Acquirer/Bank        │
             │   └──────────────────────┘
             │           │
             │           ├─→ [Success] → onSuccess callback
             │           ├─→ [Pending] → onPending callback  
             │           └─→ [Error]   → onError callback
             │
             └─→ [User Closes Popup] → onClose callback
```

### Downstream: Callback Handling & Navigation

**Step 5: Success Flow**

```tsx
// onSuccess callback execution
onSuccess: function (result) {
    // result structure:
    // {
    //   status_code: "200",
    //   status_message: "Success, transaction is found",
    //   transaction_id: "0511a47a-21b0-4c6f-a2ba-8b19c961ebcc",
    //   transaction_status: "capture",  // or "settlement"
    //   fraud_status: "accept"
    // }

    toast.success("Payment successful!");

    // Navigate to /app (workspace)
    navigate({ to: "/app" });

    // Behind the scenes:
    // 1. Backend webhook updates subscription status
    // 2. UsageLimitsContext.useCanUseFeature checks this on next mount
    // 3. User sees updated plan features in dashboard
}
```

**Step 6: Pending Flow (for asynchronous payment methods)**

```tsx
// onPending callback execution
// Triggered when payment method requires asynchronous confirmation
// Example: Bank transfer (user must transfer manually)
onPending: function (result) {
    // result structure:
    // {
    //   status_code: "201",
    //   status_message: "Waiting for payment verification",
    //   transaction_id: "0511a47a-21b0-4c6f-a2ba-8b19c961ebcc",
    //   transaction_status: "pending",
    //   fraud_status: "accept"
    // }

    toast.info("Payment pending...");

    // Navigate to /app
    navigate({ to: "/app" });

    // Backend watches for bank transfer confirmation
    // Once confirmed, subscription automatically activates
    // User will see "pending subscription" status in subscription context
}
```

**Step 7: Error Flow**

```tsx
// onError callback execution
// Triggered when payment fails (insufficient funds, declined card, etc.)
onError: function (result) {
    // result structure:
    // {
    //   status_code: "400",
    //   status_message: "Invalid request or payment declined",
    //   transaction_id: "0511a47a-21b0-4c6f-a2ba-8b19c961ebcc",
    //   transaction_status: "deny",
    //   fraud_status: "challenge"
    // }

    toast.error("Payment failed");
    console.error("Payment error details:", result);

    // Snap popup closes
    // User remains on checkout page
    // Can retry by submitting form again
    // Each retry generates new snap_token via POST /payment/checkout
}
```

**Step 8: Close Flow**

```tsx
// onClose callback execution
// Triggered when user clicks X button on popup without completing payment
onClose: function () {
    toast.warning("Payment window closed");

    // Snap popup closes
    // User remains on checkout page
    // No payment transaction initiated
    // Can retry anytime
}
```

**Step 9: Fallback for Redirect Mode**

```tsx
// Alternative: snap_redirect_url (if snap_token fails)
if (snap_token) {
    // Popup mode (recommended)
    window.snap.pay(snap_token, { /* callbacks */ });
} else if (snap_redirect_url) {
    // Fallback: Redirect mode
    // User is redirected to Midtrans hosted payment page
    window.location.href = snap_redirect_url;
} else {
    // Neither token nor redirect URL - payment gateway not initialized
    toast.error("Payment gateway not initialized");
}
```

**Complete State Diagram: Payment Processing**

```
┌─────────────────────────────────────────────────────────────┐
│  Checkout Form Submission Success                           │
│  (POST /payment/checkout returns snap_token)                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│  window.snap.pay(snap_token, callbacks)                     │
│  - Midtrans Snap popup opens                                │
│  - User selects payment method                              │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬─────────────────┐
    │            │            │                 │
    ↓            ↓            ↓                 ↓
┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐
│Success │ │Pending │ │ Error  │ │   Close    │
│ (200)  │ │ (201)  │ │ (400)  │ │ (x button) │
└───┬────┘ └───┬────┘ └───┬────┘ └────┬───────┘
    │          │          │            │
    │          │          │            │
    ├─→ toast.success() 
    │   Navigate to /app
    │   Subscription activated
    │   UsageLimits context refreshes
    │
    ├─→ toast.info() 
    │   Navigate to /app
    │   Pending subscription status
    │   Auto-activate on bank confirmation
    │
    ├─→ toast.error()
    │   Stay on checkout page
    │   Show error details
    │   User can retry
    │
    └─→ toast.warning()
        Stay on checkout page
        No transaction initiated
        User can retry anytime
```

---

## Type System: Complete Request/Response Types

### API Schemas (Zod)

```typescript
// PublicPlan Schema (for pricing display)
export const publicPlanSchema = z.object({
    id: z.string(),
    name: z.string(),                    // "Pro", "Premium"
    slug: z.string(),                    // "pro", "premium"
    tagline: z.string().nullable(),      // "For growing projects"
    price: z.number(),                   // 19 (in USD/local currency)
    billing_period: z.string(),          // "month" or "year"
    is_most_popular: z.boolean().optional(),
    limits: z.object({
        max_notebooks: z.number(),       // 50
        max_notes_per_notebook: z.number(), // 1000
        ai_chat_daily: z.number(),       // 100
        semantic_search_daily: z.number(), // 50
    }),
    features: z.array(z.object({
        key: z.string(),                 // "ai_chat", "semantic_search"
        text: z.string(),                // Display text
        is_enabled: z.boolean(),
    })),
});

// CheckoutRequest Schema
export const checkoutRequestSchema = z.object({
    plan_id: z.string(),                 // "plan_pro_monthly"
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    phone: z.string(),
    address_line1: z.string(),           // Street address
    address_line2: z.string().optional(),
    city: z.string(),
    state: z.string(),                   // Province/State
    postal_code: z.string(),             // ZIP/Postal code
    country: z.string(),                 // ISO country code: "ID", "US"
});

// CheckoutResponse Schema
export const checkoutResponseSchema = z.object({
    subscription_id: z.string(),         // "sub_12345"
    order_id: z.string(),                // "order_67890"
    status: z.string(),                  // "pending_payment"
    snap_token: z.string(),              // JWT token for Snap popup
    snap_redirect_url: z.string(),       // URL for redirect mode
});

// OrderSummaryResponse Schema
export const orderSummaryResponseSchema = z.object({
    plan_name: z.string(),               // "Pro Plan"
    billing_period: z.string(),          // "month" or "year"
    price_per_unit: z.string(),          // "$19.00/month"
    subtotal: z.number(),                // 19.00
    tax: z.number(),                     // 2.85 (or 0 for tax-free countries)
    total: z.number(),                   // 21.85
    currency: z.string(),                // "USD"
});
```

### TypeScript Types

```typescript
// Extracted from Zod schemas
export type PublicPlan = z.infer<typeof publicPlanSchema>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;
export type OrderSummaryResponse = z.infer<typeof orderSummaryResponseSchema>;

// CheckoutFormValues (from form schema)
export type CheckoutFormValues = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    country: string;
    city: string;
    state: string;
    postal_code: string;
};
```

---

## Error Scenarios & Recovery

### Scenario 1: Free Plan Selection

```
User clicks "Get Started" on Free Plan
    ↓
Checkout.tsx checks if isFreeplan:
    - price === 0 OR slug === 'free'
    ↓
Navigate directly to /app
    (No payment required)
    ↓
User access dashboard immediately
```

### Scenario 2: Plan Not Found

```
URL: /checkout?plan=invalid_slug
    ↓
Plan matching fails: planSlug not in allPlans
    ↓
Show error toast: "Plan not found"
    (or redirect to /pricing)
```

### Scenario 3: Payment Form Validation Error

```
User submits form with invalid email
    ↓
Zod validation fails
    ↓
Form shows field error message: "Invalid email address"
    ↓
Submit button disabled
    ↓
User corrects field and resubmits
```

### Scenario 4: Checkout API Error (422 - Validation)

```
POST /payment/checkout receives invalid data
    ↓
Backend returns 422 Unprocessable Entity
    ↓
useCheckout mutation triggers onError
    ↓
toast.error("Failed to initiate checkout")
    ↓
User remains on checkout page
    ↓
User corrects form and retries
```

### Scenario 5: Checkout API Error (409 - Already Subscribed)

```
User already has active subscription
    ↓
POST /payment/checkout returns 409 Conflict
    ↓
useCheckout mutation triggers onError
    ↓
toast.error("Already subscribed to a plan")
    ↓
Navigate to /app
```

### Scenario 6: Snap Token Invalid/Expired

```
snap_token expired after 5 minutes
    ↓
User clicks "Proceed to Payment"
    ↓
window.snap.pay(expired_token) fails
    ↓
Midtrans shows error
    ↓
User clicks back to form
    ↓
User resubmits form
    ↓
New snap_token generated
```

### Scenario 7: Payment Declined (Insufficient Funds)

```
User enters credit card with insufficient funds
    ↓
Midtrans processes payment
    ↓
Bank declines transaction
    ↓
onError callback triggered with status_code: "400"
    ↓
toast.error("Payment failed")
    ↓
Snap popup closes
    ↓
User remains on checkout page
    ↓
User tries different payment method or card
```

### Scenario 8: User Closes Popup

```
User clicks X button on Snap popup
    ↓
onClose callback triggered
    ↓
toast.warning("Payment window closed")
    ↓
Snap popup closes
    ↓
User remains on checkout page
    ↓
User can click "Proceed to Payment" again
    ↓
New snap_token generated (no payment charged)
```

---

## Data Flow Summary

### Complete Request/Response Cycle

```
┌──────────────────────────────────────────────────────────────────┐
│  PHASE 1: PRICING DISPLAY                                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Browser: GET /api/plans                                         │
│  Backend: Returns PublicPlan[]                                   │
│  Frontend: Filter by billing_period (month/year)                 │
│  Render: PricingCard × N with CTA buttons                        │
│  Action: User clicks paid plan                                   │
│  Navigate: /checkout?plan=pro                                    │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  PHASE 2: CHECKOUT FORM                                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Browser: GET /payment/summary?plan_id=pro_monthly               │
│  Backend: Returns OrderSummaryResponse                           │
│  Frontend: Display order summary with tax calculation            │
│  Browser: GET /api/states?country=ID                             │
│           GET /api/cities?country=ID&state=...                   │
│           GET /api/zipcodes?country=ID&state=...&city=...        │
│  Frontend: Cascading dropdowns for billing address               │
│  Action: User fills form and clicks "Proceed to Payment"         │
│  Browser: POST /payment/checkout (CheckoutRequest)               │
│  Backend: Returns CheckoutResponse (with snap_token)             │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  PHASE 3: PAYMENT GATEWAY                                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Browser: window.snap.pay(snap_token, { callbacks })             │
│  Midtrans: Opens popup with payment methods                      │
│  User: Selects payment method and completes payment              │
│  Midtrans: Processes payment                                     │
│  Callback: onSuccess → toast.success() → navigate /app           │
│           onPending → toast.info() → navigate /app               │
│           onError → toast.error() → stay on /checkout            │
│           onClose → toast.warning() → stay on /checkout          │
│                                                                  │
│  Backend (async): Webhook receives payment confirmation          │
│                   Activates subscription in database              │
│                                                                  │
│  Frontend: UsageLimitsContext detects new subscription status    │
│           Updates useCanUseFeature checks                        │
│           User can now use premium features                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Integration Points

### With Context Management Layer

**AuthContext Check:**
- Checkout page verifies user is authenticated
- Redirects to /auth/signin if not logged in

**SubscriptionContext Integration:**
- Gets current subscription status
- Blocks downgrade attempts during checkout
- Displays current plan in pricing modal

**UsageLimitsContext Integration:**
- After successful payment, context refetches usage status
- useCanUseFeature hooks refresh with new plan limits
- Token limits updated in UsageStatusContext

### With AI Service Layer

**Upon Successful Subscription:**
- User now has access to AI Chat and Semantic Search features
- useCanUseAiChat() returns true
- AI request limits increase based on new plan

**Upgrade Modal Integration:**
- User hits usage limit while using free plan
- PricingModal displays with current usage
- User can upgrade directly from modal
- OnPlanSelect navigates to /checkout?plan=selected_slug

---

## Summary: Upstream → Downstream Data Flow

| Phase | Upstream | Midstream | Downstream |
|-------|----------|-----------|-----------|
| **Pricing** | GET /api/plans | Filter & transform plans | Navigate to /checkout |
| **Checkout** | Form validation & cascading dropdowns | POST /payment/checkout | Receive snap_token |
| **Payment** | window.snap.pay() opens popup | User selects payment method | Callback (success/error/close) |
| **Activation** | Backend webhook processes payment | SubscriptionContext refreshes | User can use premium features |

The complete flow demonstrates:
- ✅ Multi-step payment process with form validation
- ✅ Real-time order summary with tax calculation
- ✅ Cascading location dropdowns for international billing
- ✅ Midtrans Snap integration with all callback states
- ✅ Error recovery at each stage
- ✅ Seamless integration with subscription and usage limits contexts

