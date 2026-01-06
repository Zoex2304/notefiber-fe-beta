import { cn } from '@/lib/utils';
// 1. Import the child component, PricingCard
import { PricingCard, type PricingCardData } from './PricingCard';

/**
 * Define props for PricingSection
 * Pass card data and animation state
 */
interface PricingSectionProps {
  cardsData: PricingCardData[];
  isPulsing?: boolean;
  /**
   * Context determines button behavior in each card:
   * - 'landing': Always show "Get Started" → signup
   * - 'app': Show "Current plan" / "Upgrade to X"
   */
  context?: 'landing' | 'app';
  /**
   * User's current plan slug from Zustand store.
   * Used to determine which card shows "Current Plan".
   */
  currentPlanSlug?: string;
}

/**
 * Reusable Pricing Section Component
 *
 * Generic, reusable wrapper for displaying pricing cards.
 * Can be used on landing pages, app pricing pages, or any pricing display.
 *
 * LOCATION: src/components/shadui/PricingSection.tsx
 */
export function PricingSection({
  cardsData,
  isPulsing,
  context = 'app',
  currentPlanSlug,
}: PricingSectionProps) {
  return (
    // Layout: Centered flex container with gap between fixed-width cards
    <div
      className={cn(
        'flex w-full flex-col items-center gap-6 lg:flex-row lg:justify-center lg:items-stretch lg:gap-6',
        isPulsing && 'animate-pulse'
      )}
    >
      {/* Map through cards and render */}
      {cardsData.map((data) => (
        <PricingCard
          key={data.title}
          data={data}
          context={context}
          currentPlanSlug={currentPlanSlug}
        />
      ))}
    </div>
  );
}
