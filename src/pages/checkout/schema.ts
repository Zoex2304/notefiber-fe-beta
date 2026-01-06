import * as z from "zod";

export const checkoutSchema = z.object({
    first_name: z.string().min(2, "First name is required"),
    last_name: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    address_line1: z.string().min(5, "Address is required"),
    address_line2: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postal_code: z.string().min(1, "ZIP Code is required"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
