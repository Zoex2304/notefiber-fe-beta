import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "@/components/shadui/input";
import { Button } from "@/components/shadui/button";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends InputProps {
    showToggle?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, showToggle = true, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);

        return (
            <div className="relative">
                <style>
                    {`
            .hide-password-toggle::-ms-reveal,
            .hide-password-toggle::-ms-clear {
              display: none;
            }
          `}
                </style>
                <Input
                    type={showPassword ? "text" : "password"}
                    className={cn("hide-password-toggle pr-10", className)}
                    ref={ref}
                    {...props}
                />
                {showToggle && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword((prev) => !prev)}
                    >
                        {showPassword ? (
                            <Eye className="h-4 w-4 text-gray-500" />
                        ) : (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                        </span>
                    </Button>
                )}
            </div>
        );
    }
);
PasswordInput.displayName = "PasswordInput";
