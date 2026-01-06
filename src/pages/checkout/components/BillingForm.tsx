import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User, Mail, Phone, MapPin } from "lucide-react";

import { Input } from "@/components/shadui/input";
import { Button } from "@/components/shadui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/shadui/form";

import { checkoutSchema, type CheckoutFormValues } from "../schema";
import type { User as UserType } from "@/api/services/auth/auth.types";
import { LocationFields } from "@/components/billing/LocationFields";

interface BillingFormProps {
    user: UserType | null;
    onSubmit: (data: CheckoutFormValues) => void;
    isPending: boolean;
}

export function BillingForm({ user, onSubmit, isPending }: BillingFormProps) {
    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            first_name: user?.full_name?.split(" ")[0] || "",
            last_name: user?.full_name?.split(" ").slice(1).join(" ") || "",
            email: user?.email || "",
            phone: "",
            address_line1: "",
            address_line2: "",
            country: "ID",
            city: "",
            state: "",
            postal_code: "",
        },
    });

    return (
        <div className="bg-background rounded-2xl p-6 shadow-sm border border-border">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-foreground">Billing Information</h2>
                    <p className="text-sm text-muted-foreground">Enter your billing details</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>Personal Details</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>Contact Information</span>
                        </div>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            Phone Number
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="08123456789" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>Billing Address</span>
                        </div>
                        <FormField
                            control={form.control}
                            name="address_line1"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Street Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Main St" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Location Fields (Cascading API) */}
                        <LocationFields form={form} defaultCountry="ID" />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full h-12 text-lg mt-6"
                        disabled={isPending}
                    >
                        {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {isPending ? "Processing..." : "Complete Purchase"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
