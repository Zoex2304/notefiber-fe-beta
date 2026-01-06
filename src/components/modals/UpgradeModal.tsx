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

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
}

export function UpgradeModal({ isOpen, onClose, featureName = "This feature" }: UpgradeModalProps) {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        onClose();
        navigate({ to: "/pricing" });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="mx-auto bg-royal-violet-base/10 p-3 rounded-full mb-4 w-fit">
                        <Sparkles className="h-6 w-6 text-royal-violet-base" />
                    </div>
                    <DialogTitle className="text-center text-xl">Unlock Pro Features</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        {featureName} is available exclusively on the <strong>Pro Plan</strong>.
                        Upgrade now to unlock AI Chat, Semantic Search, and unlimited notes.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center pt-4">
                    <Button variant="outline" onClick={onClose} className="mr-2">
                        Maybe Later
                    </Button>
                    <Button
                        className="bg-royal-violet-base hover:bg-royal-violet-dark text-white"
                        onClick={handleUpgrade}
                    >
                        Upgrade to Pro
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
