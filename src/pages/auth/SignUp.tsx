import { useState } from "react";
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
import { PasswordStrengthMeter } from "./components/PasswordStrengthMeter";
import { useRegister } from "@/hooks/auth/useRegister";

const signUpSchema = z
    .object({
        fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
        email: z.string().email({ message: "Please enter a valid email address." }),
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters." }),
        confirmPassword: z.string(),
        agreeTerms: z.boolean().refine((val) => val === true, {
            message: "You must agree to the terms and privacy policy.",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUp() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const { mutate: register, isPending, error } = useRegister();

    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            agreeTerms: false,
        },
    });

    function onSubmit(values: SignUpFormValues) {
        register(
            {
                full_name: values.fullName,
                email: values.email,
                password: values.password,
            },
            {
                onSuccess: () => {
                    // Redirect to verification page with email
                    navigate({ to: '/validate-code', search: { email: values.email } });
                },
            }
        );
    }

    return (
        <AuthLayout title="Sign Up">
            <div className="flex flex-col gap-6">
                <GoogleSignInButton />

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{error.message || "Failed to create account."}</span>
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="John Doe"
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
                                    <FormLabel>Confirm password</FormLabel>
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
                        <FormField
                            control={form.control}
                            name="agreeTerms"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex flex-row items-start space-x-3">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isPending}
                                                className={form.formState.errors.agreeTerms ? "border-red-500" : ""}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none flex-1">
                                            <FormLabel className="text-sm font-normal text-muted-foreground">
                                                I agree with{" "}
                                                <Link to="/landing" className="text-primary hover:underline">
                                                    Terms
                                                </Link>{" "}
                                                and{" "}
                                                <Link to="/landing" className="text-primary hover:underline">
                                                    Privacy
                                                </Link>
                                            </FormLabel>
                                        </div>
                                    </div>
                                    <FormMessage className="text-red-600 text-sm mt-2" />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            variant="default"
                            size="default"
                            className="w-full"
                            disabled={isPending}
                        >
                            {isPending ? "Creating account..." : "Create account"}
                        </Button>
                    </form>
                </Form>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/signin" className="text-primary hover:underline">
                        Sign In
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
