import { useState, useEffect } from "react";
import { toaster } from "@/hooks/useToaster";
import { Button } from "@/components/shadui/button";
import { X, Bell, CheckCircle } from "lucide-react";

/**
 * DevUtils overlay for testing UI interactions.
 * Toggle with Ctrl + U
 */
export function DevUtils() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'u') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!isOpen) return null;

    const triggerToasts = () => {
        toaster.message('Default Notification', {
            description: 'This is a standard notification message.'
        });

        setTimeout(() => {
            toaster.success('Successfully Saved', {
                description: 'Your changes have been saved to the cloud.',
            });
        }, 500);

        setTimeout(() => {
            toaster.error('Connection Failed', {
                description: 'Could not connect to the server. Please try again.',
            });
        }, 1000);

        setTimeout(() => {
            toaster.warning('Storage Warning', {
                description: 'You are approaching your storage limit.',
            });
        }, 1500);

        setTimeout(() => {
            toaster.info('New Feature', {
                description: 'Check out the new AI chat capabilities.',
            });
        }, 2000);
    };

    const triggerNotificationRing = () => {
        window.dispatchEvent(new Event('test-notification-ring'));
        toaster.trigger('Triggered Notification Ring', {
            description: 'The bell icon should be animating now.'
        });
    };

    return (
        <div className="fixed bottom-4 left-4 z-[9999] bg-card border border-border shadow-xl rounded-lg p-4 w-[300px] animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                <h3 className="font-semibold text-sm text-card-foreground">Dev Utilities</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-3">
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase">Toaster System</p>
                    <Button onClick={triggerToasts} variant="outline" className="w-full justify-start text-xs h-8 bg-background hover:bg-muted border-border text-foreground">
                        <CheckCircle className="mr-2 h-3.5 w-3.5 text-green-500" />
                        Test All Variants
                    </Button>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground font-medium uppercase">Notifications</p>
                    <Button onClick={triggerNotificationRing} variant="outline" className="w-full justify-start text-xs h-8 bg-background hover:bg-muted border-border text-foreground">
                        <Bell className="mr-2 h-3.5 w-3.5 text-amber-500" />
                        Trigger Bell Animation
                    </Button>
                </div>
            </div>

            <div className="mt-4 text-[10px] text-muted-foreground/50 text-center">
                Press Ctrl + U to toggle this panel
            </div>
        </div>
    );
}
