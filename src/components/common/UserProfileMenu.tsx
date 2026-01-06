import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/shadui/dropdown-menu";
import { Button } from "@/components/shadui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadui/avatar";
import { useAuth } from "@/hooks/auth/useAuth";
import { Settings, LogOut, CreditCard } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { ActionTooltip } from "@/components/common/ActionTooltip";

export function UserProfileMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Generate initials for avatar fallback
    const initials = user?.full_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    const handleLogout = () => {
        logout();
        navigate({ to: "/signin" });
    };

    return (
        <DropdownMenu>
            <ActionTooltip label="Profile & Settings">
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                        <Avatar className="h-8 w-8 border border-gray-200">
                            <AvatarImage src={user?.avatar_url || ""} alt={user?.full_name || "User"} referrerPolicy="no-referrer" />
                            <AvatarFallback className="bg-royal-violet-light text-royal-violet-base font-medium flex items-center justify-center">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
            </ActionTooltip>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/app/subscription" })} className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Manage Subscription</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
