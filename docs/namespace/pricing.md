# Dokumentasi Fitur: Pricing Plan

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend (User App)  
**Lokasi:** `src/components/shadui/`, `src/components/modals/`, `src/pages/`

---

## Alur Data Semantik

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                          PRICING PLAN DISPLAY FLOW                           â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚  LANDING PAGE / APP PRICING                                              â”‚â”‚
â”‚  â”‚                                                                          â”‚â”‚
â”‚  â”‚  [PricingDisplay] (Organism)                                             â”‚â”‚
â”‚  â”‚      -> [usePublicPlans: GET /api/plans]                                 â”‚â”‚
â”‚  â”‚      -> [SwitchPricing: monthly/yearly toggle]                           â”‚â”‚
â”‚  â”‚      -> [Filter plans by billing_period]                                 â”‚â”‚
â”‚  â”‚      -> [Transform to PricingCardData]                                   â”‚â”‚
â”‚  â”‚      -> [PricingSection]                                                 â”‚â”‚
â”‚  â”‚          -> [PricingCard x N]                                            â”‚â”‚
â”‚  â”‚              -> [Free plan] â†’ Navigate to /app                           â”‚â”‚
â”‚  â”‚              -> [Paid plan] â†’ Navigate to /checkout?plan=slug            â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚  UPGRADE MODAL (Limit Exceeded)                                         â”‚â”‚
â”‚  â”‚                                                                          â”‚â”‚
â”‚  â”‚  [PricingModal]                                                          â”‚â”‚
â”‚  â”‚      -> [Show limit info: used/limit + reset countdown]                  â”‚â”‚
â”‚  â”‚      -> [PricingDisplay with onPlanSelect callback]                      â”‚â”‚
â”‚  â”‚          -> [PricingCard with custom buttons]                            â”‚â”‚
â”‚  â”‚              -> [Current Plan: disabled]                                 â”‚â”‚
â”‚  â”‚              -> [Other Plans: onClick â†’ navigate to /pricing]            â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â”‚                                                                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## A. Laporan Implementasi Fitur Pricing Plan

### Deskripsi Fungsional

Fitur ini menampilkan subscription plans dengan monthly/yearly toggle, feature highlights, dan call-to-action buttons. Digunakan di landing page, in-app pricing page, dan upgrade modal.

**Operasi yang Didukung:**

| Operasi | Trigger | API Endpoint | Deskripsi |
|---------|---------|--------------|-----------|
| **Fetch Plans** | Component mount | `GET /api/plans` | Get public subscription plans |
| **Toggle Period** | Click monthly/yearly | - | Filter plans by billing_period |
| **Select Free Plan** | Click Get Started | - | Navigate to /app |
| **Select Paid Plan** | Click Get Started | - | Navigate to /checkout?plan=slug |

### Visualisasi

> [PLACEHOLDER SCREENSHOT - PRICING PAGE]
> *Gambar 1: Pricing page dengan cards dan monthly/yearly switcher.*

> [PLACEHOLDER SCREENSHOT - PRICING CARDS]
> *Gambar 2: Pricing cards dengan title, price, features, dan CTA button.*

> [PLACEHOLDER SCREENSHOT - MOST POPULAR BADGE]
> *Gambar 3: Most popular plan dengan ribbon badge dan scale effect.*

> [PLACEHOLDER SCREENSHOT - PRICING MODAL]
> *Gambar 4: Upgrade modal dengan limit info dan plan selection.*

---

## B. Bedah Arsitektur & Komponen

---

### `src/components/shadui/PricingCard.tsx`
**Layer Terdeteksi:** `UI Component (Plan Card)`

**Narasi Operasional:**

Card component untuk individual subscription plan. Supports custom onClick untuk modal usage atau default Link untuk navigation. Badge "Most Popular" ditampilkan dengan ribbon style.

```tsx
export interface PricingCardData {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  slug?: string;
  // Optional button customization (for modal usage)
  onClick?: () => void;
  buttonText?: string;
  isDisabled?: boolean;
}

export function PricingCard({ data, className }: PricingCardProps) {
  const { title, price, period, description, features, isPopular, slug, onClick, buttonText, isDisabled } = data;

  // Determine behavior: free plan â†’ /app, paid plan â†’ /checkout
  const isFree = slug === 'free' || price === '$0.00' || price === 'Rp0';
  const planSlug = slug || title.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn(
      "flex w-full flex-col items-start rounded-[26.332px] border-[0.439px] p-5 lg:p-[28.526px] gap-4 lg:gap-[21.943px] bg-white transition-all duration-300 relative",
      isPopular ? "border-royal-violet-base shadow-lg scale-105 z-10" : "border-customFont-base",
      className
    )}>
      {/* Most Popular Ribbon */}
      {isPopular && (
        <div className="absolute top-0 right-0 overflow-hidden w-[100px] h-[100px] pointer-events-none rounded-tr-[26.332px] z-20">
          <div className="absolute top-[22px] -right-[30px] rotate-45 bg-royal-violet-base text-white w-[140px] text-center font-bold text-[10px] py-1 shadow-md tracking-wider uppercase">
            Most Popular
          </div>
        </div>
      )}

      {/* 1. Plan Title */}
      <h3 className="self-stretch font-normal text-customFont-dark-base text-display-h5">{title}</h3>

      {/* 2. Price Frame */}
      <div className="flex items-center gap-2 lg:gap-[10.971px]">
        <span className="font-normal text-customFont-dark-base text-display-h3">{price}</span>
        <span className="font-normal text-customFont-base text-body-base">
          {period ? (period.toLowerCase().startsWith('month') ? '/ month' : '/ year') : ''}
        </span>
      </div>

      {/* 3. Description */}
      <p className="self-stretch font-normal text-customFont-base text-body-1 min-h-[8rem] max-w-[50ch]">
        {description}
      </p>

      {/* 4. CTA Button */}
      {onClick ? (
        // Modal usage: custom onClick
        <Button variant="custom-outline" size="card-outline" onClick={onClick} disabled={isDisabled}>
          {buttonText || "Get Started"}
        </Button>
      ) : isFree ? (
        // Free plan: navigate to app
        <Link to="/app" className="w-full">
          <Button variant="custom-outline" size="card-outline" className="w-full">Get Started</Button>
        </Link>
      ) : (
        // Paid plan: navigate to checkout
        <Link
          to="/checkout"
          search={{ plan: planSlug, price: price.replace(/[^0-9]/g, ""), period: period.includes("month") ? "monthly" : "yearly" }}
          className="w-full"
        >
          <Button variant="custom-outline" size="card-outline" className="w-full">Get Started</Button>
        </Link>
      )}

      {/* 5. Features List */}
      <div className="flex flex-col items-start gap-2 lg:gap-[8.762px]">
        {features.map((feature) => (
          <PriceAdvantageItem key={feature} text={feature} />
        ))}
      </div>
    </div>
  );
}
```
*Caption: Snippet 1: PricingCard dengan ribbon badge dan conditional navigation.*

---

### `src/pages/landingpage/components/organisms/PricingDisplay.tsx`
**Layer Terdeteksi:** `Organism (Pricing Display Container)`

**Narasi Operasional:**

Reusable organism yang encapsulates API fetching, period switcher, dan card rendering. Transforms API data ke PricingCardData format dengan dynamic feature generation from plan limits.

```tsx
interface PricingDisplayProps {
    onPlanSelect?: (planSlug: string) => void;  // Custom for modal
    currentPlanSlug?: string;
    showSwitcher?: boolean; // Default true
}

export function PricingDisplay({ onPlanSelect, currentPlanSlug, showSwitcher = true }: PricingDisplayProps) {
    const [period, setPeriod] = useState<PricingPeriod>("monthly");
    const [isPulsing, setIsPulsing] = useState(false);

    // Fetch public plans from API
    const { data: plansResponse, isLoading, error } = usePublicPlans();

    const handleToggle = (newPeriod: PricingPeriod) => {
        if (newPeriod === period) return;
        setPeriod(newPeriod);
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 500);
    };

    // Filter and transform API data
    const dataToDisplay: PricingCardData[] = (plansResponse?.data || [])
        .filter((plan) => {
            const planPeriod = plan.billing_period?.toLowerCase() || 'monthly';
            return planPeriod === period;
        })
        .map((plan) => {
            // Generate features from plan limits
            const features: string[] = [];

            if (plan.limits.max_notebooks === -1) {
                features.push("Unlimited notebooks");
            } else {
                features.push(`${plan.limits.max_notebooks} notebooks maximum`);
            }

            if (plan.limits.max_notes_per_notebook === -1) {
                features.push("Unlimited notes per notebook");
            } else {
                features.push(`${plan.limits.max_notes_per_notebook} notes per notebook`);
            }

            if (plan.limits.semantic_search_daily > 0) {
                features.push(plan.limits.semantic_search_daily === -1
                    ? "Unlimited semantic search"
                    : `${plan.limits.semantic_search_daily} semantic searches/day`);
            }

            if (plan.limits.ai_chat_daily > 0) {
                features.push(plan.limits.ai_chat_daily === -1
                    ? "Unlimited AI chat"
                    : `${plan.limits.ai_chat_daily} AI chats/day`);
            }

            // Format price (IDR)
            const formattedPrice = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
            }).format(plan.price);

            const baseData = {
                title: plan.name,
                price: formattedPrice,
                period: `/ ${plan.billing_period === 'monthly' ? 'month' : 'year'}`,
                description: plan.tagline || "",
                features,
                slug: plan.slug,
                isPopular: plan.is_most_popular,
            };

            // Add custom button behavior for modal usage
            if (onPlanSelect) {
                return {
                    ...baseData,
                    onClick: () => onPlanSelect(plan.slug),
                    buttonText: plan.slug === currentPlanSlug ? "Current Plan" : "Upgrade Now",
                    isDisabled: plan.slug === currentPlanSlug,
                };
            }

            return baseData;
        });

    return (
        <div className="w-full">
            <div className="flex flex-col items-center gap-6 lg:gap-8">
                {/* Period Switcher */}
                {showSwitcher && (
                    <SwitchPricing activePeriod={period} onToggle={handleToggle} />
                )}

                {/* Cards */}
                {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-royal-violet-base" />
                ) : error ? (
                    <p className="text-red-500">Failed to load pricing plans</p>
                ) : dataToDisplay.length > 0 ? (
                    <PricingSection cardsData={dataToDisplay} isPulsing={isPulsing} />
                ) : (
                    <p className="text-gray-500">No {period} plans available.</p>
                )}
            </div>
        </div>
    );
}
```
*Caption: Snippet 2: PricingDisplay dengan API fetching dan feature generation.*

---

### `src/components/modals/PricingModal.tsx`
**Layer Terdeteksi:** `UI Component (Upgrade Modal)`

**Narasi Operasional:**

Modal yang ditampilkan saat user hit limit atau needs upgrade. Shows usage info dengan countdown reset, reuses PricingDisplay dengan custom button behavior.

```tsx
interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;        // e.g., "AI chat messages", "notebooks"
    limitInfo?: {
        used: number;
        limit: number;
        resetsAt?: string;       // ISO timestamp
    };
    currentPlanSlug?: string;    // To disable current plan button
}

export function PricingModal({ isOpen, onClose, featureName = "This feature", limitInfo, currentPlanSlug }: PricingModalProps) {
    const navigate = useNavigate();

    const handleSelectPlan = (planSlug: string) => {
        onClose();
        if (planSlug === 'free') {
            navigate({ to: "/app" });
        } else {
            navigate({ to: "/pricing" });
        }
    };

    // Calculate countdown until reset
    const getResetCountdown = (resetsAt?: string) => {
        if (!resetsAt) return null;
        const resetTime = new Date(resetsAt);
        const now = new Date();
        const diff = resetTime.getTime() - now.getTime();
        if (diff <= 0) return "Resetting soon...";

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `Resets in ${hours}h ${minutes}m`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[95vw] max-w-[1400px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="mx-auto bg-royal-violet-base/10 p-3 rounded-full mb-4 w-fit">
                        <Sparkles className="h-6 w-6 text-royal-violet-base" />
                    </div>
                    <DialogTitle className="text-center text-xl">Upgrade Your Plan</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        {limitInfo ? (
                            <span>
                                You've used <strong>{limitInfo.used}/{limitInfo.limit}</strong> {featureName.toLowerCase()}.
                                {limitInfo.resetsAt && (
                                    <span className="block text-sm text-muted-foreground mt-1">
                                        {getResetCountdown(limitInfo.resetsAt)}
                                    </span>
                                )}
                            </span>
                        ) : (
                            <span>
                                <strong>{featureName}</strong> is available on higher plans.
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="px-16 py-10">
                    <PricingDisplay
                        onPlanSelect={handleSelectPlan}
                        currentPlanSlug={currentPlanSlug}
                        showSwitcher={true}
                    />
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button variant="default" size="default" onClick={onClose}>Maybe Later</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
```
*Caption: Snippet 3: PricingModal dengan limit info dan countdown.*

---

### `src/components/shadui/SwitchPricing.tsx`
**Layer Terdeteksi:** `UI Component (Period Toggle)`

**Narasi Operasional:**

Toggle switch untuk memilih monthly atau yearly billing period.

```tsx
export type PricingPeriod = "monthly" | "yearly";

interface SwitchPricingProps {
    activePeriod: PricingPeriod;
    onToggle: (period: PricingPeriod) => void;
}

export function SwitchPricing({ activePeriod, onToggle }: SwitchPricingProps) {
    return (
        <div className="flex justify-center rounded-lg bg-gray-100 p-1 lg:p-[5.516px] gap-1 lg:gap-[7.355px]">
            {/* Monthly Button */}
            <Button
                variant={activePeriod === "monthly" ? "default" : "ghost"}
                size="toggle"
                onClick={() => onToggle("monthly")}
                className={activePeriod === "monthly" ? "" : "text-gray-400"}
            >
                Monthly
            </Button>

            {/* Yearly Button */}
            <Button
                variant={activePeriod === "yearly" ? "default" : "ghost"}
                size="toggle"
                onClick={() => onToggle("yearly")}
                className={activePeriod === "yearly" ? "" : "text-gray-400"}
            >
                Yearly
            </Button>
        </div>
    );
}
```
*Caption: Snippet 4: Period toggle dengan active state styling.*

---

### `src/hooks/payment/useUsageStatus.ts (usePublicPlans)`
**Layer Terdeteksi:** `Query Hook (API Data Fetching)`

**Narasi Operasional:**

TanStack Query hook untuk fetch public plans. Cached for 5 minutes.

```tsx
/**
 * Hook to fetch public plans for pricing modal
 * Uses GET /api/plans (no auth required)
 */
export const usePublicPlans = () => {
    return useQuery<ApiResponse<PublicPlan[]>, ApiError>({
        queryKey: ['public', 'plans'],
        queryFn: () => paymentService.getPublicPlans(),
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
};
```
*Caption: Snippet 5: usePublicPlans hook dengan 5-minute cache.*

---

### `src/api/services/payment/payment.schemas.ts`
**Layer Terdeteksi:** `Schema Definitions (Zod)`

**Narasi Operasional:**

Zod schemas untuk plan data validation.

```tsx
export const planLimitsSchema = z.object({
    max_notebooks: z.number(),
    max_notes_per_notebook: z.number(),
    ai_chat_daily: z.number(),
    semantic_search_daily: z.number(),
});

export const publicPlanSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    tagline: z.string().nullable().optional(),
    price: z.number(),
    billing_period: z.string(),
    is_most_popular: z.boolean().optional(),
    limits: planLimitsSchema,
    features: z.array(planDisplayFeatureSchema),
});
```
*Caption: Snippet 6: Zod schemas untuk public plan data.*

---

## C. Ringkasan Ketergantungan Komponen

| Komponen | Menerima Dari | Meneruskan Ke |
|----------|---------------|---------------|
| `PricingDisplay` | `usePublicPlans` API | `SwitchPricing`, `PricingSection` |
| `PricingSection` | Transformed card data | `PricingCard` x N |
| `PricingCard` | `PricingCardData` | Link/Button navigation |
| `PricingModal` | Limit context trigger | `PricingDisplay` |
| `SwitchPricing` | Period state | Parent via `onToggle` |

---

## D. Diagram Component Hierarchy

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                       PricingDisplay                             â”‚
â”‚                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚  [SwitchPricing]                                             â”‚â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                                â”‚â”‚
â”‚  â”‚  â”‚  Monthly   â”‚  Yearly    â”‚  <- Toggle billing period      â”‚â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                                â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â”‚                                                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚  [PricingSection]                                            â”‚â”‚
â”‚  â”‚                                                               â”‚â”‚
â”‚  â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                  â”‚â”‚
â”‚  â”‚  â”‚ PricingCardâ”‚ â”‚ PricingCardâ”‚ â”‚ PricingCardâ”‚                â”‚â”‚
â”‚  â”‚  â”‚           â”‚ â”‚ â˜… POPULAR â”‚ â”‚           â”‚                  â”‚â”‚
â”‚  â”‚  â”‚  Free     â”‚ â”‚  Pro      â”‚ â”‚  Business â”‚                  â”‚â”‚
â”‚  â”‚  â”‚  Rp0/mo   â”‚ â”‚  Rp99k/mo â”‚ â”‚  Rp199k/moâ”‚                  â”‚â”‚
â”‚  â”‚  â”‚           â”‚ â”‚           â”‚ â”‚           â”‚                  â”‚â”‚
â”‚  â”‚  â”‚ â€¢ 3 notes â”‚ â”‚ â€¢ Unlim.  â”‚ â”‚ â€¢ Unlim.  â”‚                  â”‚â”‚
â”‚  â”‚  â”‚ â€¢ No AI   â”‚ â”‚ â€¢ 50 AI   â”‚ â”‚ â€¢ Unlim.  â”‚                  â”‚â”‚
â”‚  â”‚  â”‚           â”‚ â”‚ â€¢ Search  â”‚ â”‚ â€¢ Priorityâ”‚                  â”‚â”‚
â”‚  â”‚  â”‚ [Start]   â”‚ â”‚ [Start]   â”‚ â”‚ [Start]   â”‚                  â”‚â”‚
â”‚  â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                  â”‚â”‚
â”‚  â”‚                                                               â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## E. Feature Generation Logic

| Plan Limit Field | Display Logic |
|------------------|---------------|
| `max_notebooks = -1` | "Unlimited notebooks" |
| `max_notebooks = N` | "N notebooks maximum" |
| `max_notes_per_notebook = -1` | "Unlimited notes per notebook" |
| `max_notes_per_notebook = N` | "N notes per notebook" |
| `semantic_search_daily = -1` | "Unlimited semantic search" |
| `semantic_search_daily = N` | "N semantic searches/day" |
| `ai_chat_daily = -1` | "Unlimited AI chat" |
| `ai_chat_daily = N` | "N AI chats/day" |

---

## F. Usage Locations

| Location | Component Used | Purpose |
|----------|----------------|---------|
| Landing Page | `PricingDisplay` | Show plans to visitors |
| `/pricing` | `AppPricing` â†’ `PricingDisplay` | In-app pricing page |
| Limit Modal | `PricingModal` â†’ `PricingDisplay` | Upgrade prompt |

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
