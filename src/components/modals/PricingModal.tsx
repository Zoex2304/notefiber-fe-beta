import { useNavigate } from "@tanstack/react-router";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/shadui/dialog";
import { Button } from "@/components/shadui/button";
import { Sparkles } from "lucide-react";
import { PricingDisplay } from "@/pages/landingpage/components/organisms/PricingDisplay";

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
    limitInfo?: {
        used: number;
        limit: number;
        resetsAt?: string;
    };
    currentPlanSlug?: string;
}

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

    // Calculate time until reset for daily limits
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
                    <DialogTitle className="text-center text-xl">
                        Upgrade Your Plan
                    </DialogTitle>
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
                                Upgrade now to unlock all features.
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="px-16 py-10">
                    {/* Reuse the exact same PricingDisplay organism */}
                    <PricingDisplay
                        onPlanSelect={handleSelectPlan}
                        currentPlanSlug={currentPlanSlug}
                        showSwitcher={true}
                    />
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button variant="default" size="default" onClick={onClose}>
                        Maybe Later
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
