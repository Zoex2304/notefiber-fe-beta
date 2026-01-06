import { Separator } from "@/components/shadui/separator";
import { Skeleton } from "@/components/shadui/skeleton";
import { Check, Shield } from "lucide-react";

export interface OrderSummaryProps {
    planName?: string;
    billingPeriod?: string;
    pricePerUnit?: string;
    subtotal?: number;
    tax?: number;
    total?: number;
    currency?: string;
    isLoading?: boolean;
}

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
    if (isLoading) {
        return (
            <div className="bg-background rounded-2xl shadow-sm border border-border p-6 h-fit">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    return (
        <div className="bg-background rounded-2xl shadow-sm border border-border p-6 h-fit sticky top-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>

            {/* Plan Details */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-medium text-foreground">{planName}</h4>
                    <p className="text-sm text-muted-foreground">Billed {billingPeriod}</p>
                </div>
                <div className="text-right">
                    <span className="font-semibold text-foreground">{pricePerUnit}</span>
                </div>
            </div>

            <Separator className="my-4" />

            {/* Pricing Breakdown */}
            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium text-foreground">{formatCurrency(tax)}</span>
                </div>
            </div>

            <Separator className="my-4" />

            {/* Total */}
            <div className="flex justify-between items-center mb-6">
                <span className="font-semibold text-foreground">Total</span>
                <div className="text-right">
                    <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
                    <span className="text-sm text-muted-foreground block">due today</span>
                </div>
            </div>

            {/* Features List */}
            <div className="space-y-2 pt-4 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    What you get
                </p>
                {[
                    'Unlimited notes',
                    'AI-powered chat',
                    'Semantic search',
                    'Priority support'
                ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                        <span className="text-foreground">{feature}</span>
                    </div>
                ))}
            </div>

            {/* Trust Badge */}
            <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>30-day money-back guarantee</span>
                </div>
            </div>
        </div>
    );
}
