import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/shadui/input";

interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
}

export function OtpInput({ length = 6, value, onChange }: OtpInputProps) {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (value) {
            const newOtp = value.split("").slice(0, length);
            while (newOtp.length < length) newOtp.push("");
            setOtp(newOtp);
        }
    }, [value, length]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        const val = e.target.value;
        if (isNaN(Number(val))) return;

        const newOtp = [...otp];
        // Allow only one digit
        newOtp[index] = val.substring(val.length - 1);
        setOtp(newOtp);
        onChange(newOtp.join(""));

        // Move to next input if value is entered
        if (val && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number
    ) => {
        if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            // Move to previous input on backspace if current is empty
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text/plain").slice(0, length);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split("");
        while (newOtp.length < length) newOtp.push("");
        setOtp(newOtp);
        onChange(newOtp.join(""));
        inputRefs.current[Math.min(pastedData.length, length - 1)]?.focus();
    };

    return (
        <div className="flex gap-2 justify-between">
            {otp.map((digit, index) => (
                <Input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    className={cn(
                        "w-12 h-12 text-center text-lg font-bold bg-gray-50 border-gray-200 focus:border-royal-violet-base focus:ring-royal-violet-base",
                        digit && "border-royal-violet-base bg-royal-violet-light/10"
                    )}
                />
            ))}
        </div>
    );
}
