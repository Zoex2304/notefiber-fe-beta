import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useSearch } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/shadui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/shadui/form";
import { AuthLayout } from "./components/AuthLayout";
import { PasswordInput } from "./components/PasswordInput";
import { PasswordStrengthMeter } from "./components/PasswordStrengthMeter";
import { useResetPassword } from "@/hooks/auth/useResetPassword";

const resetPasswordSchema = z
    .object({
        newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
    const search = useSearch({ strict: false }) as { token?: string; email?: string };
    const token = search.token;
    const [password, setPassword] = useState("");
    const { mutate: resetPassword, isPending, error } = useResetPassword();
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    function onSubmit(values: ResetPasswordFormValues) {
        if (!token) {
            // Should probably handle this better, but for now rely on API error or UI info
            return;
        }

        resetPassword(
            {
                token: token,
                new_password: values.newPassword,
                confirm_password: values.confirmPassword,
            },
            {
                onSuccess: () => {
                    setIsSuccess(true);
                },
            }
        );
    }

    if (isSuccess) {
        return (
            <AuthLayout title="Password Reset">
                <div className="flex flex-col gap-6 text-center">
                    <div className="flex justify-center">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                    <p className="text-gray-600">
                        Your password has been successfully reset. You can now sign in with your new password.
                    </p>
                    <Link to="/signin" className="w-full">
                        <Button className="w-full bg-royal-violet-base hover:bg-royal-violet-dark text-white h-12">
                            Sign In
                        </Button>
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    if (!token) {
        return (
            <AuthLayout title="Invalid Link">
                <div className="flex flex-col gap-6 text-center">
                    <div className="flex justify-center">
                        <AlertTriangle className="h-12 w-12 text-red-500" />
                    </div>
                    <p className="text-gray-600">
                        This password reset link is invalid or has expired.
                    </p>
                    <Link to="/forgot-password" className="w-full">
                        <Button className="w-full bg-royal-violet-base hover:bg-royal-violet-dark text-white h-12">
                            Request New Link
                        </Button>
                    </Link>
                    <div className="text-center text-sm text-gray-600">
                        <Link to="/signin" className="text-royal-violet-base hover:underline">
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Reset Password">
            <div className="flex flex-col gap-6">
                <p className="text-gray-600 text-sm">
                    Enter your new password below.
                </p>

                {error && (
                    <div className="flex items-center gap-3 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{error.message || "Failed to reset password."}</span>
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-col gap-1">
                                            <PasswordInput
                                                placeholder="********"
                                                {...field}
                                                showToggle={false}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    setPassword(e.target.value);
                                                }}
                                                disabled={isPending}
                                            />
                                            <PasswordStrengthMeter password={password} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            placeholder="********"
                                            {...field}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full bg-royal-violet-base hover:bg-royal-violet-dark text-white h-12"
                            disabled={isPending}
                        >
                            {isPending ? "Resetting..." : "Reset Password"}
                        </Button>
                    </form>
                </Form>

                <div className="text-center text-sm text-gray-600">
                    <Link to="/signin" className="text-royal-violet-base hover:underline">
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
