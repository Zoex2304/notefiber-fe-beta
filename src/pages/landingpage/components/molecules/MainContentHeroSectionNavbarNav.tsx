import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { MainContentHeroSectionNavbarLogo } from "../atoms/MainContentHeroSectionNavbarLogo";
import { MainContentHeroSectionNavbarNavlink } from "../atoms/MainContentHeroSectionNavbarNavlink";
import { Button } from "@/components/shadui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/auth/useAuth";


export function MainContentHeroSectionNavbarNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  /**
   * Auth-aware Sign In handler
   * - If authenticated: navigate directly to /app
   * - If not authenticated: navigate to /signin
   */
  const handleSignInClick = () => {
    setIsOpen(false);
    if (isAuthenticated) {
      navigate({ to: "/app" });
    } else {
      navigate({ to: "/signin" });
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className={cn(
        "relative z-50 flex w-full flex-col bg-white p-4 lg:bg-transparent lg:p-0",
        isOpen ? "rounded-t-lg" : "rounded-lg",
        "lg:rounded-none"
      )}>
        <div className="flex w-full items-center justify-between">
          <MainContentHeroSectionNavbarLogo />

          <div className="hidden lg:flex gap-8">
            <MainContentHeroSectionNavbarNavlink textArg="Home" urlArg="" />
            <MainContentHeroSectionNavbarNavlink textArg="Features" urlArg="features" />
            <MainContentHeroSectionNavbarNavlink textArg="Pricing" urlArg="pricing" />
            <MainContentHeroSectionNavbarNavlink textArg="About Us" urlArg="about-us" />
            <MainContentHeroSectionNavbarNavlink textArg="Contact" urlArg="contact" />
          </div>

          <div>
            <div className="hidden lg:block">
              <Button
                variant="default"
                size="default"
                onClick={handleSignInClick}
                disabled={isLoading}
              >
                {isAuthenticated ? "Go to App" : "Sign In"}
              </Button>
            </div>

            <button
              className="rounded p-1 text-customFont-dark-base transition-all hover:ring-1 hover:ring-customBorder-primary active:scale-95 lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>


        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 flex w-full flex-col gap-4 rounded-b-lg border-t border-customBorder-primary bg-white p-4 shadow-lg lg:hidden">
            <MainContentHeroSectionNavbarNavlink textArg="Home" urlArg="" />
            <MainContentHeroSectionNavbarNavlink textArg="Features" urlArg="features" />
            <MainContentHeroSectionNavbarNavlink textArg="Pricing" urlArg="pricing" />
            <MainContentHeroSectionNavbarNavlink textArg="About Us" urlArg="about-us" />
            <MainContentHeroSectionNavbarNavlink textArg="Contact" urlArg="contact" />
            <Button
              variant="default"
              size="default"
              className="w-full"
              onClick={handleSignInClick}
              disabled={isLoading}
            >
              {isAuthenticated ? "Go to App" : "Sign In"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
