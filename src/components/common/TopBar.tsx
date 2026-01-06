import { UserProfileMenu } from "@/components/common/UserProfileMenu";

import { Button } from "@/components/shadui/button";
import { Search } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { NotificationDropdown } from "@/components/organisms/NotificationDropdown";
import AiLogo from "@/assets/images/landing/logo/logo_symbol.svg";
import { GradientPill } from "@/components/common/GradientPill";
import { cn } from "@/lib/utils";

interface TopBarProps {
    onSearchClick: () => void;
    onChatClick: () => void;
}

export const TopBar = ({ onSearchClick, onChatClick }: TopBarProps) => {
    const { checkPermission } = useSubscription();

    const showSearch = checkPermission('semantic_search');
    const showChat = checkPermission('ai_chat');

    return (
        <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 gap-4">
            {/* Left side spacer or breadcrumbs if needed, currently just pushing to right if justify-end, 
                 but user might want search on left/center? 
                 User said "search icon should be transformed into a full search bar". 
                 Usually search is central or left-aligned. 
                 But existing layout was `justify-end`. 
                 I'll keep `justify-end` but add `flex-1` to search if I want it to take space, 
                 or just keep it fixed width on the right. 
                 Let's stick to the Admin style fixed width 64 for now to be safe.
             */}

            <div className="flex-1" /> {/* Spacer to push content to right if needed, or removing it if we want search on left. 
                                            The original code was `justify-end`. I'll keep it `justify-end`. */}

            {/* Actions */}
            <div className="flex items-center gap-3">
                {showSearch && (
                    <Button
                        variant="outline"
                        onClick={onSearchClick}
                        className={cn(
                            "hidden sm:flex bg-gray-50/50 group text-gray-500 hover:bg-gray-100 border border-gray-200 relative h-9 w-64 justify-start rounded-lg text-sm font-normal shadow-none transition-all"
                        )}
                    >
                        <Search className="h-4 w-4 mr-2 opacity-50" />
                        <span className="opacity-90">Search...</span>
                        <kbd className="pointer-events-none absolute right-2 top-[50%] -translate-y-[50%] hidden h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-500 opacity-100 sm:flex">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </Button>
                )}

                {/* Mobile Search Icon Fallback (Optional, but good for responsiveness) */}
                {showSearch && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onSearchClick}
                        className="sm:hidden h-9 w-9"
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                )}

                {showChat && (
                    <GradientPill
                        onClick={onChatClick}
                        icon={<img src={AiLogo} alt="AI" className="w-3.5 h-3.5 brightness-0 invert" />}
                    >
                        <span className="tracking-tight font-bold text-shadow-sm font-sans">Ask AI</span>
                    </GradientPill>
                )}

                <div className="h-6 w-px bg-gray-200 mx-1" />

                <NotificationDropdown />
                <UserProfileMenu />
            </div>
        </div>
    );
};


