import { useEffect } from "react";
import { useNavigate, Outlet, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/hooks/auth/useAuth";
import { SubscriptionStateGuard } from "@/components/guards/SubscriptionStateGuard";

export const AuthGuard = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const router = useRouter();
    const location = router.state.location;

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            console.log("AuthGuard: Redirecting to signin", { isLoading, isAuthenticated, path: location.pathname });
            navigate({ to: "/signin", search: { from: location.pathname } });
        }
    }, [isLoading, isAuthenticated, navigate, location]);

    if (isLoading) {
        // Can replace with a proper Loading Spinner component
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    return (
        <>
            <SubscriptionStateGuard />
            <Outlet />
        </>
    );
};
