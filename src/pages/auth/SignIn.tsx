import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

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
import { Checkbox } from "@/components/shadui/checkbox";
import { AuthLayout } from "./components/AuthLayout";
import { GoogleSignInButton } from "./components/GoogleSignInButton";
import { PasswordInput } from "./components/PasswordInput";
import { useLogin } from "@/hooks/auth/useLogin";
import { debugLog } from "@/utils/debug/LogOverlay";

// Schema with rememberMe as required boolean (not optional)
const signInSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
    rememberMe: z.boolean(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignIn() {
    const navigate = useNavigate();
    const { mutate: login, isPending, error } = useLogin();

    const form = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    function onSubmit(values: SignInFormValues) {
        login(
            {
                email: values.email,
                password: values.password,
                remember_me: values.rememberMe,
            },
            {
                onSuccess: () => {
                    debugLog.info("SignIn: Redirecting to /app");
                    navigate({ to: "/app" });
                },
            }
        );
    }

    return (
        <AuthLayout title="Sign In">
            <div className="flex flex-col gap-6">
                <GoogleSignInButton />

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-3 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{error.message || "Failed to sign in. Please check your credentials."}</span>
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
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <PasswordInput
                                            placeholder="Password"
                                            {...field}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center justify-between">
                            <FormField
                                control={form.control}
                                name="rememberMe"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal text-gray-600">
                                            Remember me
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-royal-violet-base hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="default"
                            size="default"
                            className="w-full"
                            disabled={isPending}
                        >
                            {isPending ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </Form>

                <div className="text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-royal-violet-base hover:underline">
                        Create new
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}