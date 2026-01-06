import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/shadui/button";
import { AuthLayout } from "./components/AuthLayout";
import { OtpInput } from "./components/OtpInput";
import { useVerifyEmail } from "@/hooks/auth/useVerifyEmail";
import { debugLog } from "@/utils/debug/LogOverlay";

export default function ValidateCode() {
    const navigate = useNavigate();
    const search = useSearch({ strict: false }) as { email?: string };
    const email = search.email || "your email";
    const [otp, setOtp] = useState("");

    const { mutate: verifyEmail, isPending, error } = useVerifyEmail();

    const handleValidate = () => {
        verifyEmail(
            {
                email: email === "your email" ? "" : email,
                token: otp
            },
            {
                onSuccess: () => {
                    debugLog.info("ValidateCode: Success, Redirecting to /signin");
                    // Redirect to login on success
                    navigate({ to: "/signin" });
                },
                onError: (error) => {
                    debugLog.error("ValidateCode: Failed", error);
                }
            }
        );
    };

    return (
        <AuthLayout title="Validate code">
            <div className="flex flex-col gap-6">
                <p className="text-gray-600 text-sm">
                    Enter below the 6-digit code you received on{" "}
                    <span className="font-medium text-gray-900">{email}</span>
                </p>

                {error && (
                    <div className="flex items-center gap-3 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{error.message || "Invalid verification code."}</span>
                    </div>
                )}

                <div className="space-y-6">
                    <OtpInput value={otp} onChange={setOtp} length={6} />

                    <Button
                        type="button"
                        className="w-full bg-royal-violet-base hover:bg-royal-violet-dark text-white h-12"
                        onClick={handleValidate}
                        disabled={otp.length !== 6 || isPending}
                    >
                        {isPending ? "Validating..." : "Validate code"}
                    </Button>
                </div>

                <div className="text-center text-sm text-gray-600">
                    <Link to="/signin" className="text-royal-violet-base hover:underline">
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
