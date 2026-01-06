import { Link } from "@tanstack/react-router";
import { Button } from "./button";
import { PriceAdvantageItem } from "./PriceAdvantageItem";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

// Define the type for data to be displayed
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
  // Optional tier badge (icon/badge next to title)
  tierBadge?: ReactNode;
}

interface PricingCardProps {
  data: PricingCardData;
  className?: string;
  /**
   * Context determines button behavior:
   * - 'landing': Always show "Get Started" → links to signup
   * - 'app': Show "Current plan" / "Upgrade to X" based on plan
   */
  context?: 'landing' | 'app';
  /**
   * User's current plan slug from Zustand store.
   * Used to determine which card shows "Current Plan".
   */
  currentPlanSlug?: string;
}

/**
 * Reusable Pricing Card Component
 *
 * LOCATION: src/components/shadui/PricingCard.tsx
 *
 * Layout Structure (Mistral-style):
 * 1. Header: Tier Badge + Plan Title
 * 2. Description
 * 3. Features List (with checkmarks)
 * 4. Price + Period
 * 5. CTA Button
 *
 * Fixed dimensions: 320px width × 480px height on desktop
 * Light card background (existing theme preserved)
 */
export function PricingCard({ data, className, context = 'app', currentPlanSlug }: PricingCardProps) {
  const {
    title,
    price,
    period,
    description,
    features,
    isPopular,
    slug,
    onClick,
    buttonText,
    isDisabled,
    tierBadge,
  } = data;

  // Determine the plan slug for checkout URL
  const planSlug = slug || title.toLowerCase().replace(/\s+/g, "-");

  // Render button based on context
  const renderButton = () => {
    // Custom onClick handler (modal usage)
    if (onClick) {
      return (
        <Button
          variant={isDisabled ? "secondary" : "default"}
          size="lg"
          className={cn(
            "w-full rounded-xl font-medium",
            isDisabled
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-royal-violet-base hover:bg-royal-violet-base/90 text-white"
          )}
          onClick={onClick}
          disabled={isDisabled}
        >
          <span>{buttonText || "Get Started"}</span>
          {!isDisabled && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      );
    }

    // Landing context: Always "Get Started" → signup
    if (context === 'landing') {
      return (
        <Link to="/signup" className="w-full">
          <Button
            variant="default"
            size="lg"
            className="w-full rounded-xl font-medium bg-royal-violet-base hover:bg-royal-violet-base/90 text-white"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      );
    }

    // App context: Check if this card is the user's current plan
    // Uses currentPlanSlug from Zustand store (single source of truth)
    const cardSlug = slug || title.toLowerCase().replace(/\s+plan$/i, '').replace(/\s+/g, '-');
    const isCurrentPlan = currentPlanSlug && (
      cardSlug === currentPlanSlug ||
      slug === currentPlanSlug ||
      planSlug === currentPlanSlug
    );

    // Plan tier hierarchy for comparison
    const tierHierarchy: Record<string, number> = {
      'free': 0,
      'pro': 1,
      'enterprise': 2,
    };

    // Get tier level for current user's plan and this card's plan
    const currentTier = tierHierarchy[currentPlanSlug || 'free'] ?? 0;
    const cardTier = tierHierarchy[cardSlug] ?? tierHierarchy[planSlug] ?? 0;

    // Check if this card is a lower tier than user's current plan
    const isLowerTier = currentPlanSlug && cardTier < currentTier;

    if (isCurrentPlan) {
      return (
        <Link to="/app" className="w-full">
          <Button
            variant="secondary"
            size="lg"
            className="w-full rounded-xl font-medium bg-gray-200 text-gray-600"
          >
            <span>Current plan</span>
          </Button>
        </Link>
      );
    }

    // Don't show upgrade button for lower tier plans (including Free when user is on Pro/Enterprise)
    // This prevents confusing "Upgrade to Free" scenarios
    if (isLowerTier) {
      return null; // No button rendered - you can't "upgrade" to a lower tier
    }

    // App context: Upgrade to higher tier plans only
    return (
      <Link
        to="/checkout"
        search={{
          plan: planSlug,
          price: price.replace("$", "").replace("Rp", "").replace(/,/g, ""),
          period: period.includes("month") ? "monthly" : "yearly"
        }}
        className="w-full"
      >
        <Button
          variant="default"
          size="lg"
          className="w-full rounded-xl font-medium bg-royal-violet-base hover:bg-royal-violet-base/90 text-white"
        >
          <span>Upgrade to {title}</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    );
  };

  return (
    // Card Container - Light background (existing theme), fixed dimensions, rounded corners
    <div
      className={cn(
        // Base layout
        "flex flex-col items-start",
        // Sizing: Fixed 320px width, fixed 480px height for deterministic sizing
        "w-full lg:w-[320px] h-auto lg:h-[480px]",
        // Spacing: 24px padding, 20px gap between sections
        "p-6 gap-5",
        // Style: Theme-aware background, rounded corners
        "bg-white dark:bg-card rounded-2xl",
        // Border & shadow (theme-aware)
        isPopular
          ? "border-2 border-royal-violet-base shadow-lg dark:shadow-royal-violet-base/20"
          : "border border-customBorder-primary dark:border-border",
        className
      )}
    >
      {/* 1. Header Section: Badge + Title */}
      <div className="flex items-center gap-3 w-full">
        {/* Tier Badge (optional) */}
        {tierBadge && (
          <div className="flex-shrink-0">
            {tierBadge}
          </div>
        )}
        {/* Plan Title */}
        <h3 className="text-[20px] leading-[28px] font-medium text-foreground">
          {title}
        </h3>
        {/* Popular indicator */}
        {isPopular && (
          <span className="ml-auto text-[12px] font-medium text-royal-violet-base bg-royal-violet-base/10 px-2 py-0.5 rounded-full">
            Popular
          </span>
        )}
      </div>

      {/* 2. Description Section */}
      <p className="text-[14px] leading-[20px] text-muted-foreground w-full">
        {description}
      </p>

      {/* 3. Features List Section */}
      <div className="flex flex-col items-start gap-3 w-full flex-grow overflow-y-auto min-h-0 pr-2">
        {features.map((feature) => (
          <PriceAdvantageItem key={feature} text={feature} />
        ))}
      </div>

      {/* 4. Price Section */}
      <div className="flex items-baseline gap-1 w-full pt-2">
        <span className="text-[36px] leading-[44px] font-semibold text-foreground">
          {price}
        </span>
        <span className="text-[14px] leading-[20px] text-muted-foreground">
          {period}
        </span>
      </div>

      {/* 5. CTA Button Section */}
      {renderButton()}
    </div>
  );
}
