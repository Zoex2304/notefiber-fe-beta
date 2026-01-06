import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "@tanstack/react-router";
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
import { Input } from "@/components/shadui/input";
import { AuthLayout } from "./components/AuthLayout";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
    const { mutate: forgotPassword, isPending, error } = useForgotPassword();
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    function onSubmit(values: ForgotPasswordFormValues) {
        forgotPassword(
            { email: values.email },
            {
                onSuccess: () => {
                    setIsSuccess(true);
                },
            }
        );
    }

    if (isSuccess) {
        return (
            <AuthLayout title="Check your email">
                <div className="flex flex-col gap-6 text-center">
                    <div className="flex justify-center">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                    <p className="text-gray-600">
                        We have sent a password reset link to <span className="font-medium text-gray-900">{form.getValues("email")}</span>.
                    </p>
                    <Link to="/signin" className="w-full">
                        <Button className="w-full bg-royal-violet-base hover:bg-royal-violet-dark text-white h-12">
                            Back to Sign In
                        </Button>
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Forgot password?">
            <div className="flex flex-col gap-6">
                <p className="text-gray-600 text-sm">
                    Enter the email address you used when you created the account, and
                    we'll send you a code to reset your password
                </p>

                {error && (
                    <div className="flex items-center gap-3 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{error.message || "Failed to send reset link."}</span>
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="name@example.com"
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
                            {isPending ? "Sending..." : "Submit"}
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
