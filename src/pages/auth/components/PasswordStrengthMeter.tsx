import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
    password?: string;
}

export function PasswordStrengthMeter({ password = "" }: PasswordStrengthMeterProps) {
    const requirements = [
        { label: "At least 6 characters", valid: password.length >= 6 },
        { label: "Contains a number", valid: /\d/.test(password) },
        { label: "Contains an uppercase letter", valid: /[A-Z]/.test(password) },
        { label: "Contains a special character", valid: /[^A-Za-z0-9]/.test(password) },
    ];

    const strength = requirements.filter((req) => req.valid).length;

    return (
        <div className="space-y-3 mt-2">
            {/* Progress Bar */}
            <div className="flex gap-1 h-1">
                {[1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        className={cn(
                            "h-full flex-1 rounded-full transition-all duration-300",
                            strength >= level
                                ? strength <= 2
                                    ? "bg-red-500"
                                    : strength === 3
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                : "bg-gray-200"
                        )}
                    />
                ))}
            </div>

            {/* Requirements List */}
            <ul className="space-y-1">
                {requirements.map((req, index) => (
                    <li
                        key={index}
                        className={cn(
                            "flex items-center gap-2 text-xs transition-colors duration-300",
                            req.valid ? "text-green-600" : "text-gray-500"
                        )}
                    >
                        <div
                            className={cn(
                                "flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-300",
                                req.valid
                                    ? "bg-green-100 border-green-600"
                                    : "bg-gray-100 border-gray-300"
                            )}
                        >
                            {req.valid ? (
                                <Check className="w-3 h-3 text-green-600" />
                            ) : (
                                <X className="w-3 h-3 text-gray-400" />
                            )}
                        </div>
                        <span>{req.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
