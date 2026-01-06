# Dokumentasi: Base Component Core & Dependencies

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend (User App)  
**Lokasi:** `src/components/`, `src/lib/`, `src/api/`

---

## A. Technology Stack Overview

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                           FRONTEND TECH STACK                                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚  BUILD TOOLS                                                             â”‚â”‚
â”‚  â”‚  â€¢ Vite 7.0.4 (bundler + dev server)                                    â”‚â”‚
â”‚  â”‚  â€¢ TypeScript 5.8.3 (type safety)                                       â”‚â”‚
â”‚  â”‚  â€¢ SWC (fast compilation via @vitejs/plugin-react-swc)                  â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚  CORE FRAMEWORK                                                          â”‚â”‚
â”‚  â”‚  â€¢ React 19.1.0                                                         â”‚â”‚
â”‚  â”‚  â€¢ React DOM 19.1.0                                                     â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚  STATE & DATA MANAGEMENT                                                 â”‚â”‚
â”‚  â”‚  â€¢ TanStack React Query 5.90.12 (server state)                          â”‚â”‚
â”‚  â”‚  â€¢ TanStack React Router 1.141.4 (routing + search params)              â”‚â”‚
â”‚  â”‚  â€¢ React Hook Form 7.68.0 (form state)                                  â”‚â”‚
â”‚  â”‚  â€¢ Zod 4.1.13 (schema validation)                                       â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚  UI COMPONENTS                                                           â”‚â”‚
â”‚  â”‚  â€¢ Radix UI Primitives (26+ packages)                                   â”‚â”‚
â”‚  â”‚  â€¢ Shadcn/ui (custom implementations)                                   â”‚â”‚
â”‚  â”‚  â€¢ Lucide React 0.525.0 (icons)                                         â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚  STYLING                                                                 â”‚â”‚
â”‚  â”‚  â€¢ Tailwind CSS 4.1.17                                                  â”‚â”‚
â”‚  â”‚  â€¢ Class Variance Authority 0.7.1 (variants)                            â”‚â”‚
â”‚  â”‚  â€¢ Tailwind Merge 2.6.0 (class merging)                                 â”‚â”‚
â”‚  â”‚  â€¢ clsx 2.1.1 (conditional classes)                                     â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚  RICH TEXT EDITOR                                                        â”‚â”‚
â”‚  â”‚  â€¢ Lexical 0.38.2 (core + 12 plugins)                                   â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â”‚                                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚  HTTP & API                                                              â”‚â”‚
â”‚  â”‚  â€¢ Axios 1.10.0                                                         â”‚â”‚
â”‚  â”‚  â€¢ Axios Auth Refresh 3.3.6 (token refresh)                             â”‚â”‚
â”‚  â”‚  â€¢ Axios Retry 4.5.0                                                    â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â”‚                                                                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## B. Dependencies Breakdown

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.1.0 | UI framework |
| `react-dom` | ^19.1.0 | DOM rendering |
| `typescript` | ~5.8.3 | Type safety |
| `vite` | ^7.0.4 | Build tool & dev server |

### State & Routing

| Package | Version | Purpose |
|---------|---------|---------|
| `@tanstack/react-query` | ^5.90.12 | Server state, caching, mutations |
| `@tanstack/react-router` | ^1.141.4 | File-based routing, search params |
| `react-hook-form` | ^7.68.0 | Form state management |
| `@hookform/resolvers` | ^5.2.2 | Form validation integration |
| `zod` | ^4.1.13 | Schema validation |

### UI Component Libraries

| Package | Version | Purpose |
|---------|---------|---------|
| `@radix-ui/*` | various | Accessible primitives (26 packages) |
| `lucide-react` | ^0.525.0 | Icon library |
| `cmdk` | ^1.1.1 | Command palette |
| `sonner` | ^2.0.7 | Toast notifications |
| `vaul` | ^1.1.2 | Drawer component |
| `embla-carousel-react` | ^8.6.0 | Carousel |
| `react-day-picker` | ^9.12.0 | Date picker |
| `recharts` | ^2.15.4 | Charts |

### Rich Text Editor (Lexical)

| Package | Version | Purpose |
|---------|---------|---------|
| `lexical` | ^0.38.2 | Core editor |
| `@lexical/react` | ^0.38.2 | React bindings |
| `@lexical/rich-text` | ^0.38.2 | Rich text plugin |
| `@lexical/markdown` | ^0.38.2 | Markdown support |
| `@lexical/list` | ^0.38.2 | Lists |
| `@lexical/link` | ^0.38.2 | Links |
| `@lexical/code` | ^0.38.2 | Code blocks |
| `@lexical/table` | ^0.38.2 | Tables |
| `@lexical/history` | ^0.38.2 | Undo/redo |

### Styling Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^4.1.17 | Utility CSS |
| `class-variance-authority` | ^0.7.1 | Component variants |
| `tailwind-merge` | ^2.6.0 | Class conflict resolution |
| `clsx` | ^2.1.1 | Conditional classes |
| `tw-animate-css` | ^1.4.0 | Animation utilities |

### HTTP Client

| Package | Version | Purpose |
|---------|---------|---------|
| `axios` | ^1.10.0 | HTTP client |
| `axios-auth-refresh` | ^3.3.6 | Token refresh interceptor |
| `axios-retry` | ^4.5.0 | Retry failed requests |

---

## C. Component Directory Structure

```
src/components/
â”œâ”€â”€ shadui/                 # Shadcn/UI components (43 files)
â”‚   â”œâ”€â”€ button.tsx          # Button with variants
â”‚   â”œâ”€â”€ card.tsx            # Card, CardHeader, CardContent, etc.
â”‚   â”œâ”€â”€ dialog.tsx          # Modal dialogs
â”‚   â”œâ”€â”€ form.tsx            # Form with react-hook-form integration
â”‚   â”œâ”€â”€ input.tsx           # Text input
â”‚   â”œâ”€â”€ select.tsx          # Select dropdown
â”‚   â”œâ”€â”€ command.tsx         # Command palette
â”‚   â”œâ”€â”€ dropdown-menu.tsx   # Dropdown menus
â”‚   â”œâ”€â”€ alert-dialog.tsx    # Confirmation dialogs
â”‚   â””â”€â”€ ... (34 more)
â”‚
â”œâ”€â”€ ui/                     # Alternative UI components (7 files)
â”‚   â”œâ”€â”€ button.tsx
â”‚   â”œâ”€â”€ dialog.tsx
â”‚   â”œâ”€â”€ dropdown-menu.tsx
â”‚   â”œâ”€â”€ input.tsx
â”‚   â”œâ”€â”€ scroll-area.tsx
â”‚   â”œâ”€â”€ slider.tsx
â”‚   â””â”€â”€ textarea.tsx
â”‚
â”œâ”€â”€ common/                 # Shared application components (7 files)
â”‚   â”œâ”€â”€ ActionTooltip.tsx   # Tooltip wrapper
â”‚   â”œâ”€â”€ AvatarUploader.tsx  # Profile image upload
â”‚   â”œâ”€â”€ PlanStatusPill.tsx  # Subscription status badge
â”‚   â”œâ”€â”€ TokenLimitDialog.tsx# Daily limit alert
â”‚   â”œâ”€â”€ TokenUsageIndicator.tsx # Usage progress bar
â”‚   â”œâ”€â”€ TopBar.tsx          # Main navigation bar
â”‚   â””â”€â”€ UserProfileMenu.tsx # User dropdown menu
â”‚
â”œâ”€â”€ organisms/              # Complex feature components (18 files)
â”œâ”€â”€ modals/                 # Modal dialogs (2 files)
â”œâ”€â”€ auth/                   # Auth-specific components (2 files)
â”‚
â”œâ”€â”€ ai-chat-dialog.tsx      # AI Chat feature
â”œâ”€â”€ search-dialog.tsx       # Semantic search
â”œâ”€â”€ sidebar.tsx             # Main sidebar navigation
â””â”€â”€ note-editor.tsx         # Lexical note editor
```

---

## D. Core Utility Functions

### `src/lib/utils.ts`
**Layer Terdeteksi:** `Utility (Class Merging)`

**Narasi Operasional:**

Core utility untuk menggabungkan Tailwind classes dengan conflict resolution.

```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
*Caption: `cn()` function - used across all components for conditional className merging.*

**Usage Example:**
```tsx
<div className={cn(
  "base-class",
  isActive && "active-class",
  className // passed from props
)} />
```

---

## E. Base UI Components

### `src/components/shadui/button.tsx`
**Layer Terdeteksi:** `UI Component (Base Button)`

**Narasi Operasional:**

Button component dengan multiple variants dan sizes menggunakan Class Variance Authority (CVA).

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-secondary text-white border-[0.368px] border-[#957FEE] shadow-[inset_0_0_2.331px_0_#FFF]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        "custom-outline": "border border-customBorder-primary bg-transparent text-customFont-dark-base hover:bg-gray-100",
        glass: "bg-white/30 backdrop-blur-sm border border-white/20 text-customFont-dark-base hover:bg-white/50 rounded-full",
      },
      size: {
        default: "px-[22.082px] py-[9.814px] rounded-[61.34px] gap-[12.268px] text-[14px] leading-[19.6px]",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
        "custom-sm": "px-4 py-2 rounded-full text-[13px] leading-[18.2px]",
        "custom-lg": "px-8 py-4 rounded-full text-[20px] leading-[28px]",
        toggle: "px-[23.904px] py-[12.871px] rounded-[7px] gap-[9.194px] text-[14px] leading-[19.6px]",
        "card-outline": "px-[21.943px] py-[8.777px] rounded-[81.189px] gap-[21.943px] text-[14px] leading-[19.6px] w-full",
        subscribe: "px-[22.075px] py-[9.811px] rounded-full gap-[12.264px] text-[14px] leading-[19.6px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export { Button, buttonVariants };
```
*Caption: Button component dengan 8 variants dan 9 sizes.*

---

### `src/components/shadui/card.tsx`
**Layer Terdeteksi:** `UI Component (Card Container)`

**Narasi Operasional:**

Card component family untuk content containers.

```tsx
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-xl border bg-card text-card-foreground shadow", className)} {...props} />
  )
)

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
  )
)

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
)

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```
*Caption: Card component family dengan Header, Title, Description, Content, Footer.*

---

### `src/components/shadui/dialog.tsx`
**Layer Terdeteksi:** `UI Component (Modal Dialog)`

**Narasi Operasional:**

Dialog component built on Radix UI Dialog primitive dengan animations.

```tsx
const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<...>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
    />
))

const DialogContent = React.forwardRef<...>(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
                "gap-4 border bg-background p-6 shadow-2xl sm:rounded-lg",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-100",
                className
            )}
            {...props}
        >
            {children}
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
                <X className="h-4 w-4" />
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPortal>
))

export { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription }
```
*Caption: Dialog component dengan overlay, content, header, footer, title, description.*

---

### `src/components/shadui/form.tsx`
**Layer Terdeteksi:** `UI Component (Form with RHF Integration)`

**Narasi Operasional:**

Form components yang terintegrasi dengan React Hook Form. Provides context untuk field state, error messages, dan accessible labeling.

```tsx
const Form = FormProvider  // Re-export from react-hook-form

const FormField = <TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
    ...props
}: ControllerProps<TFieldValues, TName>) => {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    )
}

const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext)
    const itemContext = React.useContext(FormItemContext)
    const { getFieldState, formState } = useFormContext()
    const fieldState = getFieldState(fieldContext.name, formState)

    return {
        id: itemContext.id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,  // error, isDirty, isTouched, etc.
    }
}

const FormItem = React.forwardRef<...>(({ className, ...props }, ref) => (
    <FormItemContext.Provider value={{ id: React.useId() }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
))

const FormLabel = React.forwardRef<...>(({ className, ...props }, ref) => {
    const { error, formItemId } = useFormField()
    return (
        <Label ref={ref} className={cn(error && "text-red-500", className)} htmlFor={formItemId} {...props} />
    )
})

const FormControl = React.forwardRef<...>(({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
    return (
        <Slot ref={ref} id={formItemId} aria-invalid={!!error} {...props} />
    )
})

const FormMessage = React.forwardRef<...>(({ className, children, ...props }, ref) => {
    const { error } = useFormField()
    const body = error ? String(error?.message) : children
    if (!body) return null
    return (
        <p ref={ref} className={cn("text-sm font-medium text-red-500", className)} {...props} />
    )
})

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField }
```
*Caption: Form components dengan React Hook Form integration dan accessible IDs.*

---

## F. API Client Configuration

### `src/api/client/axios.client.ts`
**Layer Terdeteksi:** `API Client (Axios Configuration)`

**Narasi Operasional:**

Centralized Axios instance dengan request/response interceptors. Handles token injection dan 403 upgrade modal trigger.

```tsx
import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { API_CONFIG } from '../config/api.config';
import { API_CONSTANTS } from '../../constants/api.constants';
import { tokenStorage } from '../../utils/storage/token.storage';

// Custom event for 403 errors
export const UPGRADE_EVENT = 'TRIGGER_UPGRADE_MODAL';

export const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: API_CONFIG.HEADERS,
    timeout: API_CONSTANTS.TIMEOUT,
    withCredentials: true, // Important for CORS
});

// Request Interceptor - Add Bearer token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = tokenStorage.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor - Handle 403 (Upgrade Required)
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 403) {
            // Dispatch event to open Upgrade Modal
            window.dispatchEvent(new Event(UPGRADE_EVENT));
        }
        return Promise.reject(error);
    }
);

export const apiClient = axiosInstance;
```
*Caption: Axios client dengan token injection dan 403 handling.*

---

## G. Radix UI Primitives Used

| Primitive | Usage |
|-----------|-------|
| `@radix-ui/react-dialog` | Modals, Dialogs |
| `@radix-ui/react-dropdown-menu` | Context menus |
| `@radix-ui/react-popover` | Popovers, tooltips |
| `@radix-ui/react-select` | Select dropdowns |
| `@radix-ui/react-tabs` | Tab navigation |
| `@radix-ui/react-accordion` | Collapsible sections |
| `@radix-ui/react-switch` | Toggle switches |
| `@radix-ui/react-checkbox` | Checkboxes |
| `@radix-ui/react-label` | Accessible labels |
| `@radix-ui/react-scroll-area` | Custom scrollbars |
| `@radix-ui/react-separator` | Dividers |
| `@radix-ui/react-slot` | Component composition |
| `@radix-ui/react-tooltip` | Tooltips |
| `@radix-ui/react-avatar` | User avatars |
| `@radix-ui/react-progress` | Progress bars |

---

## H. Component Pattern Summary

| Pattern | Implementation | Files |
|---------|----------------|-------|
| **Variants** | CVA (class-variance-authority) | button.tsx |
| **Composition** | Compound components | Card, Form, Dialog |
| **Forwarding** | React.forwardRef | All components |
| **Accessibility** | Radix primitives, ARIA | Dialog, Form, etc. |
| **Styling** | cn() + Tailwind | All components |

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
