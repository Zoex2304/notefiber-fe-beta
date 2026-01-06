import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/shadui/Logo";

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full bg-background relative">
            {/* Logo - Absolute Top Left */}
            <div className="absolute top-8 left-8 z-50">
                <Link to="/">
                    <Logo variant="horizontal" size="lg" />
                </Link>
            </div>

            {/* Left Side: Illustration */}
            <div className="hidden lg:flex w-1/2 bg-royal-violet-light/10 relative overflow-hidden">
                <img
                    src="/src/assets/images/landing/illustrations/auth ilustration.svg"
                    alt="Auth Illustration"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>

            {/* Right Side: Form */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-8 lg:p-16 relative">
                <div className="w-full max-w-md flex flex-col gap-8">
                    <h1 className="text-3xl font-bold text-foreground">{title}</h1>
                    {children}
                </div>
            </div>
        </div>
    );
}
