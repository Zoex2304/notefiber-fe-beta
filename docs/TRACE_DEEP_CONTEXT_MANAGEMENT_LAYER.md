# TRACE DEEP: Upstream → Downstream - Context Management Layer

**Dokumentasi Context Management & State Distribution** | Tanggal: 28 Desember 2024

---

## 📊 OVERVIEW: Context Management Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    APP INITIALIZATION (Root)                        │
├─────────────────────────────────────────────────────────────────────┤
│  src/main.tsx                                                       │
│  - Create React Root                                                │
│  - Wrap with Provider Stack                                         │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│            PROVIDER STACK (Nested Context Layers)                   │
├─────────────────────────────────────────────────────────────────────┤
│  1. QueryProvider         ← TanStack React Query                    │
│     ├─ 2. AuthProvider    ← Authentication & User State             │
│        ├─ 3. SubscriptionProvider (in __root.tsx)                   │
│        │  └─ 4. UsageLimitsProvider                                 │
│        │     └─ 5. TooltipProvider (UI)                             │
│        │        └─ RouterProvider (Routing)                         │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│        CONTEXT INITIALIZATION (Upstream: Data Flow In)              │
├─────────────────────────────────────────────────────────────────────┤
│  1. AuthContext.tsx                                                 │
│     └─ useAuth() Hook → Check isAuthenticated status                │
│                                                                      │
│  2. SubscriptionContext.tsx                                         │
│     └─ Depends on: AuthContext                                      │
│     └─ Fetches: GET /api/user/subscription-status                   │
│     └─ Provides: planName, features, tokenUsage                     │
│                                                                      │
│  3. UsageLimitsContext.tsx                                          │
│     └─ Depends on: AuthContext, SubscriptionContext                 │
│     └─ Uses Hook: useCanUseFeature()                                │
│     └─ Provides: Check functions, Modal controls                    │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│        DATA FLOW (Horizontal: Context to Components)                │
├─────────────────────────────────────────────────────────────────────┤
│  useSubscription() → All Components                                  │
│  useUsageLimits() → Feature-Gated Components                        │
│  useAuthContext() → Protected Routes                                │
│  useCanUseFeature() → Direct Hook Access                            │
└────────────────┬────────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│   DOWNSTREAM (Components Consume & React to State Changes)          │
├─────────────────────────────────────────────────────────────────────┤
│  - MainApp → Uses useSubscription(), useUsageLimits()               │
│  - AIChatDialog → Checks daily.ai_chat limits                       │
│  - SearchDialog → Checks daily.semantic_search limits               │
│  - Sidebar → Shows plan status via PlanStatusPill                   │
│  - TopBar → Enables/Disables search button based on permission      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 TRACE DEEP #1: AuthContext - Authentication Upstream

### Entry Point: App Initialization

**File:** `src/main.tsx`

```tsx
// ROOT BOOTSTRAP
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <UsageLimitsProvider>
          <TooltipProvider>
            <RouterProvider router={router} />
          </TooltipProvider>
        </UsageLimitsProvider>
      </AuthProvider>
    </QueryProvider>
  </StrictMode>
);
```

**Execution Order:**

1. QueryProvider initialized first (dependency for all queries)
2. AuthProvider wraps everything (token from localStorage, user check)
3. UsageLimitsProvider depends on AuthProvider
4. UI providers wrapped at bottom

---

### AuthContext: Core Authentication State

**File:** `src/contexts/AuthContext.tsx`

```tsx
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ⭐ UPSTREAM: Check authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Fetch user from token storage or API
        const storedUser = tokenStorage.getUserData();
        const token = tokenStorage.getAccessToken();

        if (token && storedUser) {
          setUser(storedUser);
          // Optional: Verify token is still valid
          const isTokenValid = await authService.verifyToken();
          if (!isTokenValid) {
            // Try refresh
            const refreshed = await authService.refreshToken();
            if (!refreshed) {
              logout();
            }
          }
        }
      } catch (error) {
        console.error("Auth init failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ⭐ AUTHENTICATE: Login method
  const login = (userData: User) => {
    tokenStorage.setUserData(userData);
    setUser(userData);
  };

  // ⭐ DEAUTHENTICATE: Logout method
  const logout = async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await authService.logout({ refresh_token: refreshToken });
      } catch (error) {
        console.error("Logout backend call failed", error);
      }
    }
    tokenStorage.clearAll();
    setUser(null);
    queryClient.removeQueries(); // Clear all cached data
    queryClient.clear(); // Clear entire cache
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    tokenStorage.setUserData(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
```

---

### AuthContext Downstream: Component Consumption

**When AuthContext Changes:**

```
User logs in via LoginPage
  ↓
  login(userData) called
  ↓
  AuthContext.user = userData
  ↓
  All components re-render (subscribed to AuthContext)
  ↓
  SubscriptionContext effect triggers (depends on isAuthenticated)
    └─ Fetches subscription status
    └─ Updates features & tokenUsage
  ↓
  UsageLimitsContext effect triggers (depends on isAuthenticated)
    └─ Fetches usage status via useCanUseFeature hook
    └─ Initializes check functions
  ↓
  Components receive updated subscription & usage data
  ↓
  UI reflects user's plan features (e.g., enable/disable AI chat button)
```

---

## 🔍 TRACE DEEP #2: SubscriptionContext - Plan & Feature Upstream

### Dependency: AuthContext

**File:** `src/routes/__root.tsx`

```tsx
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

// SubscriptionProvider is placed in root route after AuthProvider
export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <SubscriptionProvider>
      <Outlet />
    </SubscriptionProvider>
  ),
});
```

---

### SubscriptionContext: Plan & Feature State

**File:** `src/contexts/SubscriptionContext.tsx`

```tsx
interface SubscriptionContextType {
  // Subscription metadata
  isLoading: boolean;
  planName: string;
  isActive: boolean;
  subscriptionId: string | null;

  // Feature flags
  features: {
    ai_chat: boolean;
    semantic_search: boolean;
    max_notes: number;
    daily_token_limit: number;
  };

  // Token usage tracking
  tokenUsage: {
    dailyUsed: number;
    dailyLimit: number;
    percentage: number;
  };

  // Utility methods
  checkPermission: (feature: "ai_chat" | "semantic_search") => boolean;
  refreshSubscription: () => Promise<void>;
}

const defaultFeatures = {
  ai_chat: false,
  semantic_search: false,
  max_notes: 5,
  daily_token_limit: 0,
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [planName, setPlanName] = useState<string>("Free Plan");
  const [isActive, setIsActive] = useState<boolean>(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [features, setFeatures] = useState(defaultFeatures);
  const [tokenUsage, setTokenUsage] = useState({
    dailyUsed: 0,
    dailyLimit: 0,
    percentage: 0,
  });

  // ⭐ UPSTREAM: Fetch subscription on auth change
  const fetchSubscriptionStatus = async () => {
    try {
      // API Call: GET /api/user/subscription-status
      const response = await paymentService.getSubscriptionStatus();

      if (response.success && response.data) {
        // Store plan metadata
        setPlanName(response.data.plan_name);
        setIsActive(response.data.is_active);
        setSubscriptionId(response.data.subscription_id || response.data.id);

        // Normalize features (handle array or object format)
        const rawFeatures = response.data.features;
        let normalizedFeatures = { ...defaultFeatures };

        if (Array.isArray(rawFeatures)) {
          // Features is an array of strings
          const featureList = (rawFeatures as unknown as string[]).map((f) =>
            f.toLowerCase()
          );

          normalizedFeatures.ai_chat = featureList.some(
            (f) =>
              f === "ai_chat" ||
              f === "aichat" ||
              (f.includes("ai") && f.includes("chat"))
          );

          normalizedFeatures.semantic_search = featureList.some(
            (f) =>
              f === "semantic_search" ||
              f === "semanticsearch" ||
              f.includes("semantic")
          );

          normalizedFeatures.max_notes = 9999;
        } else if (typeof rawFeatures === "object" && rawFeatures !== null) {
          // Features is an object
          const featureRecord = rawFeatures as Record<string, boolean | number>;
          normalizedFeatures = {
            ai_chat: !!(featureRecord.ai_chat || featureRecord.aiChat),
            semantic_search: !!(
              featureRecord.semantic_search || featureRecord.semanticSearch
            ),
            max_notes: (featureRecord.max_notes as number) || 5,
            daily_token_limit: (featureRecord.daily_token_limit as number) || 0,
          };
        }

        setFeatures(normalizedFeatures);

        // Calculate token usage percentage
        const dailyUsed = (response.data.ai_daily_usage as number) || 0;
        const dailyLimit = normalizedFeatures.daily_token_limit;
        const percentage =
          dailyLimit > 0 ? Math.min((dailyUsed / dailyLimit) * 100, 100) : 0;

        setTokenUsage({
          dailyUsed,
          dailyLimit,
          percentage,
        });
      }
    } catch (error) {
      console.error("Failed to fetch subscription status:", error);
      setFeatures(defaultFeatures);
    } finally {
      setIsLoading(false);
    }
  };

  // ⭐ TRIGGER: When user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptionStatus();
    } else {
      setIsLoading(false);
      setFeatures(defaultFeatures);
    }
  }, [isAuthenticated]);

  // ⭐ UTILITY: Non-modal permission check (conditional rendering)
  const checkPermission = (feature: "ai_chat" | "semantic_search"): boolean => {
    return features[feature];
  };

  return (
    <SubscriptionContext.Provider
      value={{
        isLoading,
        planName,
        isActive,
        subscriptionId,
        features,
        tokenUsage,
        checkPermission,
        refreshSubscription: fetchSubscriptionStatus,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
};
```

---

### API Response Structure

**Backend Response:** `GET /api/user/subscription-status`

```json
{
  "success": true,
  "code": 200,
  "data": {
    "plan_name": "Pro Plan",
    "is_active": true,
    "subscription_id": "sub-123-abc",
    "features": {
      "ai_chat": true,
      "semantic_search": true,
      "max_notes": 500,
      "daily_token_limit": 10000
    },
    "ai_daily_usage": 4500
  }
}
```

---

### SubscriptionContext Downstream

**Consumer 1: TopBar Component**

```tsx
import { useSubscription } from "@/contexts/SubscriptionContext";

export function TopBar() {
  const { checkPermission, tokenUsage } = useSubscription();

  // Conditional rendering based on permission
  const canUseSearch = checkPermission("semantic_search");

  return (
    <div className="topbar">
      {canUseSearch && (
        <SearchButton /> // Only show if feature enabled
      )}
      {tokenUsage.percentage > 80 && (
        <TokenWarning percentage={tokenUsage.percentage} /> // Show warning if >80%
      )}
    </div>
  );
}
```

**Consumer 2: MainApp Component**

```tsx
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function MainApp() {
  const { planName, isActive, tokenUsage, refreshSubscription } =
    useSubscription();

  // Can display plan info in UI
  useEffect(() => {
    console.log(`User plan: ${planName} (Active: ${isActive})`);
    console.log(
      `Token usage: ${tokenUsage.dailyUsed}/${tokenUsage.dailyLimit}`
    );
  }, [planName, isActive, tokenUsage]);

  return (
    <div>
      <PlanStatusPill planName={planName} isPaid={isActive} />
      <TokenUsageIndicator usage={tokenUsage} />
    </div>
  );
}
```

---

## 🔍 TRACE DEEP #3: UsageLimitsContext - Daily Limit Enforcement Upstream

### Dependency: AuthContext + useCanUseFeature Hook

**File:** `src/hooks/payment/useUsageStatus.ts`

```tsx
/**
 * Hook to fetch user's current usage status
 * Uses GET /api/user/usage-status (auth required)
 */
export const useUsageStatus = (options?: {
  refetchInterval?: number;
  enabled?: boolean;
}) => {
  return useQuery<ApiResponse<UsageStatus>, ApiError>({
    queryKey: ["user", "usage-status"],
    queryFn: () => paymentService.getUsageStatus(),
    refetchInterval:
      options?.enabled !== false ? options?.refetchInterval || 30000 : false,
    staleTime: 10000, // Data fresh for 10 seconds
    enabled: options?.enabled !== false, // Only run when enabled
  });
};

/**
 * Helper hook for checking if user can perform an action
 */
export const useCanUseFeature = (options?: { enabled?: boolean }) => {
  const { data, isLoading, refetch } = useUsageStatus({
    enabled: options?.enabled,
  });
  const usage = data?.data;

  return {
    isLoading,
    refetch,
    // Storage checks
    canCreateNotebook: () => usage?.storage.notebooks.can_use ?? false,
    canCreateNote: () => usage?.storage.notes.can_use ?? false,
    // Daily limit checks
    canUseAiChat: () => usage?.daily.ai_chat.can_use ?? false,
    canUseSemanticSearch: () => usage?.daily.semantic_search.can_use ?? false,
    // Upgrade check
    upgradeAvailable: usage?.upgrade_available ?? false,
    // Raw usage data
    storage: usage?.storage,
    daily: usage?.daily,
    plan: usage?.plan,
  };
};
```

**API Response:** `GET /api/user/usage-status`

```json
{
  "success": true,
  "code": 200,
  "data": {
    "plan": {
      "slug": "pro",
      "name": "Pro Plan"
    },
    "storage": {
      "notebooks": {
        "used": 8,
        "limit": 50,
        "can_use": true
      },
      "notes": {
        "used": 245,
        "limit": 500,
        "can_use": true
      }
    },
    "daily": {
      "ai_chat": {
        "used": 4,
        "limit": 10,
        "can_use": true,
        "resets_at": "2024-12-29T00:00:00Z"
      },
      "semantic_search": {
        "used": 8,
        "limit": 20,
        "can_use": true,
        "resets_at": "2024-12-29T00:00:00Z"
      }
    },
    "upgrade_available": false
  }
}
```

---

### UsageLimitsContext: Active Limit Enforcement

**File:** `src/contexts/UsageLimitsContext.tsx`

```tsx
interface LimitExceededInfo {
  featureName: string;
  used: number;
  limit: number;
  resetsAt?: string;
}

interface UsageLimitsContextType {
  // Modal controls
  showPricingModal: (
    featureName?: string,
    limitInfo?: Omit<LimitExceededInfo, "featureName">
  ) => void;
  hidePricingModal: () => void;
  isPricingModalOpen: boolean;

  // Usage checking functions (with auto-modal on failure)
  checkCanCreateNotebook: () => Promise<boolean>;
  checkCanCreateNote: () => Promise<boolean>;
  checkCanUseAiChat: () => Promise<boolean>;
  checkCanUseSemanticSearch: () => Promise<boolean>;

  // Raw usage data
  usage: ReturnType<typeof useCanUseFeature>;
}

export function UsageLimitsProvider({ children }: UsageLimitsProviderProps) {
  const { isAuthenticated } = useAuthContext();
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [modalFeatureName, setModalFeatureName] =
    useState<string>("This feature");
  const [modalLimitInfo, setModalLimitInfo] = useState<
    Omit<LimitExceededInfo, "featureName"> | undefined
  >();

  // ⭐ UPSTREAM: Fetch usage status when authenticated
  const usage = useCanUseFeature({ enabled: isAuthenticated });

  // ⭐ MODAL CONTROL: Show pricing modal
  const showPricingModal = useCallback(
    (
      featureName = "This feature",
      limitInfo?: Omit<LimitExceededInfo, "featureName">
    ) => {
      setModalFeatureName(featureName);
      setModalLimitInfo(limitInfo);
      setIsPricingModalOpen(true);
    },
    []
  );

  const hidePricingModal = useCallback(() => {
    setIsPricingModalOpen(false);
    setModalLimitInfo(undefined);
  }, []);

  // ⭐ CHECK FUNCTION: Notebook creation limit
  const checkCanCreateNotebook = useCallback(async () => {
    // Refetch fresh data from API
    const result = await usage.refetch();
    const freshData = result.data?.data;
    const canUse = freshData?.storage.notebooks.can_use ?? false;

    if (!canUse && freshData?.storage?.notebooks) {
      // ⭐ AUTO-SHOW MODAL if limit exceeded
      showPricingModal("notebooks", {
        used: freshData.storage.notebooks.used,
        limit: freshData.storage.notebooks.limit,
      });
    }
    return canUse;
  }, [usage, showPricingModal]);

  // ⭐ CHECK FUNCTION: Note creation limit
  const checkCanCreateNote = useCallback(async () => {
    const result = await usage.refetch();
    const freshData = result.data?.data;
    const canUse = freshData?.storage.notes.can_use ?? false;

    if (!canUse && freshData?.storage?.notes) {
      showPricingModal("notes per notebook", {
        used: freshData.storage.notes.used,
        limit: freshData.storage.notes.limit,
      });
    }
    return canUse;
  }, [usage, showPricingModal]);

  // ⭐ CHECK FUNCTION: AI chat daily limit
  const checkCanUseAiChat = useCallback(async () => {
    const result = await usage.refetch();
    const freshData = result.data?.data;
    const canUse = freshData?.daily.ai_chat.can_use ?? false;

    if (!canUse && freshData?.daily?.ai_chat) {
      showPricingModal("AI chat messages", {
        used: freshData.daily.ai_chat.used,
        limit: freshData.daily.ai_chat.limit,
        resetsAt: freshData.daily.ai_chat.resets_at,
      });
    }
    return canUse;
  }, [usage, showPricingModal]);

  // ⭐ CHECK FUNCTION: Semantic search daily limit
  const checkCanUseSemanticSearch = useCallback(async () => {
    const result = await usage.refetch();
    const freshData = result.data?.data;
    const canUse = freshData?.daily.semantic_search.can_use ?? false;

    if (!canUse && freshData?.daily?.semantic_search) {
      showPricingModal("semantic searches", {
        used: freshData.daily.semantic_search.used,
        limit: freshData.daily.semantic_search.limit,
        resetsAt: freshData.daily.semantic_search.resets_at,
      });
    }
    return canUse;
  }, [usage, showPricingModal]);

  return (
    <UsageLimitsContext.Provider
      value={{
        showPricingModal,
        hidePricingModal,
        isPricingModalOpen,
        checkCanCreateNotebook,
        checkCanCreateNote,
        checkCanUseAiChat,
        checkCanUseSemanticSearch,
        usage,
      }}
    >
      {children}
      {/* Pricing modal rendered at provider level (singleton) */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={hidePricingModal}
        featureName={modalFeatureName}
        limitInfo={modalLimitInfo}
        currentPlanSlug={usage.plan?.slug}
      />
    </UsageLimitsContext.Provider>
  );
}

export function useUsageLimits() {
  const context = useContext(UsageLimitsContext);
  if (context === undefined) {
    throw new Error("useUsageLimits must be used within a UsageLimitsProvider");
  }
  return context;
}

// ⭐ ERROR HANDLER: Helper to handle 429 (Too Many Requests) errors
export function handleLimitExceededError(
  error: any,
  showPricingModal: UsageLimitsContextType["showPricingModal"]
): boolean {
  // Check if this is a 429 error with limit exceeded data
  if (error?.response?.status === 429 || error?.code === 429) {
    const data = error?.response?.data?.data || error?.data;
    if (data) {
      const featureName = error?.response?.data?.message || "Daily limit";
      showPricingModal(featureName, {
        used: data.used,
        limit: data.limit,
        resetsAt: data.reset_after,
      });
      return true;
    }
    showPricingModal();
    return true;
  }

  // Check for 403 forbidden (feature requires upgrade)
  if (error?.response?.status === 403) {
    showPricingModal();
    return true;
  }

  return false;
}
```

---

### UsageLimitsContext Downstream: Component Integration

**Example 1: MainApp - Before Creating Note**

```tsx
import { useUsageLimits } from "@/contexts/UsageLimitsContext";

export default function MainApp() {
  const { checkCanCreateNote } = useUsageLimits();

  const handleCreateNote = async () => {
    if (!selectedNotebook) return;

    // ⭐ CHECK LIMIT BEFORE ACTION
    const canCreate = await checkCanCreateNote();
    if (!canCreate) {
      return; // Modal auto-shown by context
    }

    // Proceed with creation
    const request: CreateNoteRequest = {
      title: "Untitled Note",
      content: "# Untitled Note\n\nStart writing...",
      notebook_id: selectedNotebook,
    };

    const res = await apiClient.post<BaseResponse<CreateNoteResponse>>(
      `/note/v1`,
      request
    );

    await fetchAllNotebooks();
    setSelectedNote(res.data.data.id);
  };

  return <Button onClick={handleCreateNote}>Create Note</Button>;
}
```

**Example 2: AIChatDialog - Before Sending Message**

```tsx
import { useUsageLimits } from "@/contexts/UsageLimitsContext";

export function AIChatDialog({ open, onOpenChange }: AIChatDialogProps) {
  const { checkCanUseAiChat } = useUsageLimits();

  const handleSend = async () => {
    if (!input.trim() || isLoading || !activeSession) return;

    // ⭐ CHECK DAILY LIMIT BEFORE SENDING
    const canChat = await checkCanUseAiChat();
    if (!canChat) {
      return; // Modal auto-shown
    }

    // Proceed with sending
    const request: SendChatRequest = {
      chat: input,
      chat_session_id: activeSessionId,
    };

    const res = await apiClient.post<BaseResponse<SendChatResponse>>(
      `/chatbot/v1/send-chat`,
      request
    );

    // Update messages...
  };

  return <Button onClick={handleSend}>Send Message</Button>;
}
```

**Example 3: SearchDialog - Before Searching**

```tsx
import { useUsageLimits } from "@/contexts/UsageLimitsContext";

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { checkCanUseSemanticSearch } = useUsageLimits();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    const searchTimeout = setTimeout(async () => {
      // ⭐ CHECK SEARCH DAILY LIMIT
      const canSearch = await checkCanUseSemanticSearch();
      if (!canSearch) {
        setIsSearching(false);
        return; // Modal auto-shown
      }

      // Proceed with search
      const res = await apiClient.get<
        BaseResponse<GetSemanticSearchResponse[]>
      >(`/note/v1/semantic-search?q=${encodeURIComponent(query)}`);

      // Handle results...
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);
}
```

---

## 📊 COMPLETE CONTEXT INITIALIZATION FLOW

```
┌────────────────────────────────────────────────────────────────┐
│ 1. APP STARTUP: src/main.tsx                                   │
├────────────────────────────────────────────────────────────────┤
│ createRoot().render(                                            │
│   <QueryProvider>                                              │
│     <AuthProvider>          ← Init 1st (auth check)            │
│       <UsageLimitsProvider> ← Init 2nd (depends on auth)       │
│         <RouterProvider />                                      │
│       </UsageLimitsProvider>                                    │
│     </AuthProvider>                                             │
│   </QueryProvider>                                              │
│ )                                                               │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│ 2. AuthProvider: Load User from Storage                        │
├────────────────────────────────────────────────────────────────┤
│ useEffect(() => {                                              │
│   const storedUser = tokenStorage.getUserData();               │
│   const token = tokenStorage.getAccessToken();                 │
│   if (token && storedUser) {                                   │
│     setUser(storedUser);      ← User loaded                    │
│   }                                                             │
│   setIsLoading(false);        ← Auth ready                     │
│ }, []);                                                         │
│                                                                 │
│ Context value:                                                  │
│ { user, isAuthenticated, isLoading, login, logout }            │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│ 3. SubscriptionProvider (in __root.tsx): Fetch Plan            │
├────────────────────────────────────────────────────────────────┤
│ Depends on: useAuth() from AuthProvider                         │
│                                                                 │
│ useEffect(() => {                                              │
│   if (isAuthenticated) {                                       │
│     const response =                                            │
│       await paymentService.getSubscriptionStatus();            │
│     → GET /api/user/subscription-status                        │
│                                                                 │
│     setPlanName(response.plan_name);                           │
│     setFeatures(normalizedFeatures);                           │
│     setTokenUsage(dailyUsed, dailyLimit);                      │
│   }                                                             │
│ }, [isAuthenticated]);                                         │
│                                                                 │
│ Context value:                                                  │
│ { planName, features, tokenUsage, checkPermission }            │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│ 4. UsageLimitsProvider: Setup Usage Checking                   │
├────────────────────────────────────────────────────────────────┤
│ Depends on: useAuthContext() + useCanUseFeature()              │
│                                                                 │
│ const usage = useCanUseFeature({ enabled: isAuthenticated });  │
│ ↓                                                               │
│ useQuery({                                                      │
│   queryKey: ['user', 'usage-status'],                          │
│   queryFn: () => paymentService.getUsageStatus(),              │
│   refetchInterval: 30000,  ← Auto-refresh every 30s            │
│   enabled: isAuthenticated,                                    │
│ })                                                              │
│ → GET /api/user/usage-status                                   │
│                                                                 │
│ Setup check functions:                                         │
│ - checkCanCreateNotebook()   ← Check storage.notebooks         │
│ - checkCanCreateNote()       ← Check storage.notes             │
│ - checkCanUseAiChat()        ← Check daily.ai_chat             │
│ - checkCanUseSemanticSearch() ← Check daily.semantic_search    │
│                                                                 │
│ Setup modal state:                                              │
│ - isPricingModalOpen                                           │
│ - modalFeatureName                                             │
│ - modalLimitInfo                                               │
│                                                                 │
│ Context value:                                                  │
│ { checkCanXXX(), showPricingModal, usage }                     │
│                                                                 │
│ Render: <PricingModal /> (singleton for all limits)            │
└────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────┐
│ 5. Components Ready to Consume Contexts                        │
├────────────────────────────────────────────────────────────────┤
│ MainApp:                                                        │
│   const { checkPermission } = useSubscription();               │
│   const { checkCanUseAiChat } = useUsageLimits();              │
│                                                                 │
│ AIChatDialog:                                                   │
│   const { checkCanUseAiChat } = useUsageLimits();              │
│   const { tokenUsage } = useSubscription();                    │
│                                                                 │
│ SearchDialog:                                                   │
│   const { checkCanUseSemanticSearch } = useUsageLimits();      │
│                                                                 │
│ TopBar:                                                         │
│   const { checkPermission } = useSubscription();               │
│   ← Only show search button if semantic_search enabled         │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 STATE UPDATE CASCADE Example

### Scenario: User Creates AI Chat Message

```
1. USER ACTION
   └─ User clicks "Send" in AIChatDialog

2. COMPONENT LAYER (AIChatDialog)
   └─ Input: "Hello AI!"
   └─ Call: handleSend()

3. USAGE CHECK (UsageLimitsContext)
   └─ Call: checkCanUseAiChat()
   └─ Action: usage.refetch()
   └─ API: GET /api/user/usage-status
   └─ Response:
       {
         daily.ai_chat.used: 5,
         daily.ai_chat.limit: 10,
         daily.ai_chat.can_use: true
       }

4. PERMISSION GRANTED
   └─ canUse = true
   └─ Continue to send message

5. API REQUEST
   └─ POST /chatbot/v1/send-chat
   └─ { chat: "Hello AI!", chat_session_id: "..." }

6. BACKEND RESPONSE
   └─ {
       sent: { id, chat, role, created_at },
       response: { id, chat, role, created_at }
     }

7. STATE UPDATE (Component)
   └─ setSessions() with new messages

8. SUBSCRIPTION CHECK (useQuery auto-refresh)
   └─ Every 30 seconds: GET /api/user/usage-status
   └─ Update: daily.ai_chat.used = 6 (incremented)

9. TOKEN USAGE STATE (SubscriptionContext)
   └─ Manual refresh in MainApp:
      await refreshSubscription()
   └─ Update: tokenUsage.dailyUsed = 6
   └─ Calculate: percentage = (6/10) * 100 = 60%

10. UI UPDATES
    └─ TokenUsageIndicator shows: "6/10 messages used"
    └─ If percentage >= 80:
        └─ Show warning badge

11. NEXT ACTION
    └─ User sends 4 more messages (9/10)
    └─ User tries 10th message:
        └─ checkCanUseAiChat() → can_use = false
        └─ showPricingModal('AI chat messages', { used: 10, limit: 10 })
        └─ User sees: "You've reached your daily limit!"
        └─ Options: View plan | Upgrade
```

---

## 📍 ARCHITECTURE LAYERS IN CONTEXT MANAGEMENT

### Layer 1: DATA SOURCES (Backend)

```
GET /api/user/subscription-status  → Plan, Features, Token Usage
GET /api/user/usage-status         → Storage & Daily Limits
```

### Layer 2: QUERY LAYER (React Query)

```
useSubscriptionStatus (in SubscriptionContext)
useUsageStatus hook (in UsageLimitsContext)
Auto-refetch every 30 seconds
```

### Layer 3: CONTEXT LAYER (State Distribution)

```
AuthContext          → User auth state
SubscriptionContext  → Plan & features (read-only)
UsageLimitsContext   → Enforcer with check functions & modal
```

### Layer 4: CONSUMER LAYER (Components)

```
MainApp, AIChatDialog, SearchDialog
TopBar, Sidebar, SettingsPage
```

---

## 🔐 DEPENDENCY MAP

```
QueryClientProvider
    ↓
AuthProvider (useAuth)
    ↓
    ├─ SubscriptionProvider (depends on isAuthenticated)
    │   └─ Fetches: GET /api/user/subscription-status
    │   └─ Provides: planName, features, tokenUsage
    │
    └─ UsageLimitsProvider (depends on isAuthenticated)
        └─ Uses: useCanUseFeature (which uses useUsageStatus)
        └─ Fetches: GET /api/user/usage-status (every 30s)
        └─ Provides: checkCanXXX functions, showPricingModal
```

---

## 🎯 KEY PATTERNS

### Pattern 1: Permission Check (Passive)

```tsx
const { checkPermission } = useSubscription();

if (checkPermission("semantic_search")) {
  // Render feature UI
}
// No modal shown
```

### Pattern 2: Limit Check (Active)

```tsx
const { checkCanUseAiChat } = useUsageLimits();

const canChat = await checkCanUseAiChat();
if (!canChat) {
  return; // Modal auto-shown by context
}
// Proceed with action
```

### Pattern 3: Direct Query Access

```tsx
const { usage } = useUsageLimits();

console.log(usage.daily.ai_chat.used); // 5
console.log(usage.daily.ai_chat.limit); // 10
console.log(usage.daily.ai_chat.can_use); // true
```

### Pattern 4: Error Handling

```tsx
import { handleLimitExceededError } from '@/contexts/UsageLimitsContext';

try {
  await apiClient.post(...);
} catch (error) {
  const isLimitExceeded = handleLimitExceededError(
    error,
    showPricingModal
  );
  if (isLimitExceeded) return;  // Modal already shown
}
```

---

## 📚 RELATED DOCUMENTATION

- [AI Service Integration Layer](./TRACE_DEEP_AI_SERVICE_INTEGRATION_LAYER.md)
- [Subscription Flow](./namespace/subscriptionflow.md)
- [Semantic Search Implementation](./namespace/semanticsearch.md)
- [Chatbot Implementation](./namespace/chatbotreal.md)
- [Architecture Guidelines](./INSTRUCTION/PARADIGM.MD)
