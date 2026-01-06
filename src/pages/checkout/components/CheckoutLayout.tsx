import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/shadui/Logo";
import { ShieldCheck, ChevronLeft } from "lucide-react";
import { Button } from "@/components/shadui/button";

interface CheckoutLayoutProps {
    children: ReactNode;
}

export function CheckoutLayout({ children }: CheckoutLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-muted/30">
            {/* Header */}
            <header className="w-full bg-background border-b border-border px-4 md:px-8 py-4">
                <div className="container mx-auto max-w-6xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/pricing">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/">
                            <Logo variant="horizontal" size="sm" />
                        </Link>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        <span>Secure Checkout</span>
                    </div>
                </div>
            </header>

            {/* Progress Steps */}
            <div className="w-full bg-background border-b border-border">
                <div className="container mx-auto max-w-6xl px-4 md:px-8 py-3">
                    <div className="flex items-center justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                                1
                            </div>
                            <span className="font-medium text-foreground">Billing Details</span>
                        </div>
                        <div className="w-12 h-px bg-border" />
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
                                2
                            </div>
                            <span className="text-muted-foreground">Payment</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 md:px-8 py-8 max-w-6xl">
                {children}
            </main>

            {/* Footer */}
            <footer className="w-full bg-background border-t border-border py-6">
                <div className="container mx-auto max-w-6xl px-4 md:px-8">
                    <p className="text-center text-sm text-muted-foreground">
                        Protected by SSL encryption. Your payment information is secure.
                    </p>
                </div>
            </footer>
        </div>
    );
}
