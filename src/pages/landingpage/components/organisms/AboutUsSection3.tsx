import { SectionHeader } from "@/components/shadui/SectionHeader";
import { ValueCard } from "../molecules/ValueCard";
import { Cone } from "lucide-react";
import { PotIcon } from "@/components/shadui/PotIcon";

export function AboutUsSection3() {
    return (
        <section className="flex w-full flex-col items-center py-16 lg:py-24 bg-white">
            <div className="flex w-full max-w-screen-xl flex-col items-center gap-16 lg:gap-24 px-4">
                <SectionHeader
                    align="center"
                    tagText="Our Workflow"
                    headerText="Our core values Guide everything"
                    highlightLastWord={true}
                />

                {/* Grid Container */}
                <div className="relative w-full max-w-5xl mx-auto">

                    {/* Lines Layer */}
                    <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none">
                        {/* Horizontal Line connecting Left and Right columns */}
                        <div className="absolute top-1/2 left-[25%] right-[25%] h-[1px] bg-royal-violet-base/30" />

                        {/* Vertical Line for Top Left */}
                        <div className="absolute top-[40%] bottom-1/2 left-[25%] w-[1px] bg-royal-violet-base/30" />
                        {/* Vertical Line for Bottom Left */}
                        <div className="absolute top-1/2 bottom-[40%] left-[25%] w-[1px] bg-royal-violet-base/30" />

                        {/* Vertical Line for Top Right */}
                        <div className="absolute top-[40%] bottom-1/2 right-[25%] w-[1px] bg-royal-violet-base/30" />
                        {/* Vertical Line for Bottom Right */}
                        <div className="absolute top-1/2 bottom-[40%] right-[25%] w-[1px] bg-royal-violet-base/30" />
                    </div>

                    {/* Central Logo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:flex">
                        <div className="w-24 h-24 bg-royal-violet-base rounded-3xl flex items-center justify-center shadow-lg shadow-royal-violet-base/20">
                            <img
                                src="/images/landing/logo/logo_symbol.svg"
                                alt="NoteFiber Logo"
                                className="w-12 h-12 brightness-0 invert"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-x-48 lg:gap-y-24 relative z-10">
                        {/* Card 1: Customer Success */}
                        <ValueCard
                            title="Customer Success"
                            description="Our customers are at the heart of everything we do. From onboarding to ongoing support, we're here to ensure our platform delivers real value and drives results."
                            icon={<PotIcon icon={Cone} size="default" />}
                            className="bg-white border-royal-violet-base/20"
                        />

                        {/* Card 2: Efficiency */}
                        <ValueCard
                            title="Efficiency"
                            description="We're committed to helping businesses operate more efficiently by simplifying financial processes and eliminating unnecessary complexity."
                            icon={<PotIcon icon={Cone} size="default" />}
                            className="bg-white border-royal-violet-base/20"
                        />

                        {/* Card 3: Transparency */}
                        <ValueCard
                            title="Transparency"
                            description="We believe in clear communication, honest business practices, and providing our customers with the insights they need to make informed decisions."
                            icon={<PotIcon icon={Cone} size="default" />}
                            className="bg-white border-royal-violet-base/20"
                        />

                        {/* Card 4: Collaboration */}
                        <ValueCard
                            title="Collaboration"
                            description="We believe that the best solutions come from working together. Whether it's within our team or with our customers, collaboration is key to our success."
                            icon={<PotIcon icon={Cone} size="default" />}
                            className="bg-white border-royal-violet-base/20"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
