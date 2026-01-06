import { SectionHeader } from "@/components/shadui/SectionHeader";
import { Input } from "@/components/shadui/input";
import { Textarea } from "@/components/shadui/textarea";
import { Button } from "@/components/shadui/button";
import { Rocket } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/shadui/form";

const formSchema = z.object({
    firstName: z.string().min(2, {
        message: "First name must be at least 2 characters.",
    }),
    lastName: z.string().min(2, {
        message: "Last name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    phoneNumber: z.string().min(10, {
        message: "Phone number must be at least 10 digits.",
    }),
    message: z.string().min(10, {
        message: "Message must be at least 10 characters.",
    }),
});

export function ContactFormSection() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            message: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        // Handle form submission
    }

    return (
        <section className="flex w-full flex-col items-center py-16 lg:py-24 bg-white">
            {/* Wrapper matching HeroSection width: lg:max-w-[1766.593px] */}
            <div className="flex w-full lg:max-w-[1766.593px] flex-col items-center gap-12 px-4 lg:px-0">
                <SectionHeader
                    align="center"
                    tagText="Call Us"
                    headerText="Your Message Will Matter to Us"
                    highlightLastWord={true}
                />

                {/* Form Card Container */}
                <div className="relative w-full max-w-[1410.397px] rounded-[32px] overflow-hidden shadow-2xl">
                    {/* Background Texture */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/images/landing/texture/triangle grads.svg"
                            alt="Background Texture"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col lg:flex-row bg-white/40 backdrop-blur-sm m-2 lg:m-4 rounded-[24px] overflow-hidden">
                        {/* Left: Form */}
                        <div className="flex flex-1 flex-col p-8 lg:p-12 gap-8">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    Let's connect constellations
                                </h3>
                                <p className="text-gray-600">
                                    Let's align our constellations! Reach out and let the magic of
                                    collaboration illuminate our skies.
                                </p>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                                    <div className="flex flex-col lg:flex-row gap-4">
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input placeholder="Last Name" className="bg-white/50" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input placeholder="First Name" className="bg-white/50" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="Email" type="email" className="bg-white/50" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="Phone Number" type="tel" className="bg-white/50" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea placeholder="Message" className="bg-white/50 resize-none" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full mt-4 bg-royal-violet-base hover:bg-royal-violet-dark text-white">
                                        Send it <Rocket className="ml-2 w-4 h-4" />
                                    </Button>
                                </form>
                            </Form>
                        </div>

                        {/* Right: Illustration */}
                        <div className="flex flex-1 relative min-h-[400px] lg:min-h-auto">
                            <img
                                src="/images/landing/illustrations/ilustration of sec 2 of contact page.svg"
                                alt="Contact Illustration"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Overlay Text */}
                            <div className="absolute bottom-8 left-8 right-8 text-white z-20">
                                <p className="text-sm opacity-90 mb-1">
                                    Layanan cepat bikin fokus, Kualitas tinggi jadi plus, Kami siap bantu tanpa putus, Silahkan contact us.
                                </p>
                                <p className="font-bold">CEO NoteFiber</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
