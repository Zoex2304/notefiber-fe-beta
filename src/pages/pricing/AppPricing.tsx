import { Button } from "@/components/shadui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { PricingDisplay } from "@/pages/landingpage/components/organisms/PricingDisplay";
import baseBg from "@/assets/images/common/base_bg.svg";
import logoSymbol from "@/assets/images/landing/logo/logo_symbol.svg";

export default function AppPricing() {
    const navigate = useNavigate();

    return (
        // Wrapper: min-h-screen for full height, flex-col for layout.
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col py-12"
            style={{ backgroundImage: `url(${baseBg})` }}
        >

            {/* Inner Content Wrapper: Centered with mx-auto and max-width */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 flex flex-col items-center">

                {/* Header Section */}
                <div className="w-full flex flex-col items-center relative">
                    <div className="w-full flex justify-between items-center mb-4 relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate({ to: '/app' })}
                            className="absolute left-0 rounded-full hover:bg-black/5"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-700" />
                        </Button>

                        {/* Logo centered - Symbol logo, larger */}
                        <div className="mx-auto">
                            <img src={logoSymbol} alt="Notefiber" className="h-12 w-12" />
                        </div>
                    </div>

                </div>

                {/* Pricing Display - App Context */}
                <PricingDisplay showSwitcher={true} context="app" />
            </div>
        </div>
    );
}
