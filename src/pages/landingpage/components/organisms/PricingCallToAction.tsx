import { SectionHeader } from "@/components/shadui/SectionHeader";
import { Button } from "@/components/shadui/button";

export function PricingCallToAction() {
    return (
        <section className="flex w-full justify-center bg-white py-16 lg:py-24">
            <div className="flex w-full max-w-screen-xl flex-col items-center justify-between gap-12 px-4 lg:flex-row lg:px-8">
                {/* Left Side: Text & Button */}
                <div className="flex flex-col items-start gap-8 lg:max-w-xl">
                    <SectionHeader
                        align="left"
                        tagText="Our Workflow"
                        headerText="Ready to take the next step Daily Productivity ?"
                        highlightLastWord={true}
                        wrapAt={5} // Adjust wrapping if needed
                    />
                    <Button variant="default" size="default">
                        Free trial
                    </Button>
                </div>

                {/* Right Side: Image */}
                <div className="flex justify-center lg:justify-end">
                    <img
                        src="/src/assets/images/landing/illustrations/circle only hell.svg"
                        alt="Productivity Workflow"
                        className="w-full max-w-md lg:max-w-lg"
                    />
                </div>
            </div>
        </section>
    );
}
