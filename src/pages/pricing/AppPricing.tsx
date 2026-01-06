import { Button } from "@/components/shadui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { PricingDisplay } from "@/pages/landingpage/components/organisms/PricingDisplay";
import baseBg from "@/assets/images/common/base_bg.svg";
import logoHorizontal from "@/assets/images/landing/logo/logo-horizontal.svg";

export default function AppPricing() {
    const navigate = useNavigate();

    return (
        // Wrapper: min-h-screen for full height, flex-col for layout.
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col py-12"
            style={{ backgroundImage: `url(${baseBg})` }}
        >

            {/* Inner Content Wrapper: Centered with mx-auto and max-width */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 flex flex-col items-center">

                {/* Header Section */}
                <div className="w-full flex flex-col items-center relative">
                    <div className="w-full flex justify-between items-center mb-8 relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate({ to: '/app' })}
                            className="absolute left-0 rounded-full hover:bg-black/5"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-700" />
                        </Button>

                        {/* Logo centered */}
                        <div className="mx-auto">
                            <img src={logoHorizontal} alt="Notefiber" className="h-8" />
                        </div>
                        {/* Spacer to balance the absolute button if needed, or just let absolute positioning handle it. 
                             With absolute left button, mx-auto on logo works well. 
                         */}
                    </div>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
                        <p className="text-gray-500 mt-1">Choose the perfect plan for your needs</p>
                    </div>
                </div>

                {/* Pricing Display - App Context */}
                <PricingDisplay showSwitcher={true} context="app" />
            </div>
        </div>
    );
}
