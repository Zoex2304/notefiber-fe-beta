import { SectionHeader } from "@/components/shadui/SectionHeader";
import { KPICard } from "@/components/shadui/KPICard";

export function AboutUsSection2() {
    return (
        <section className="flex w-full flex-col items-center gap-16 lg:gap-24 py-16 lg:py-24 bg-white">
            {/* 1. Stats Row */}
            <div className="flex w-full max-w-screen-xl flex-wrap justify-between gap-12 px-4">
                <KPICard endValue={20} suffix="k+" description="Users" />
                <KPICard endValue={10} suffix="y+" description="Experience" />
                <KPICard
                    endValue={4.9}
                    suffix=""
                    description="Rating for best app"
                    decimals={1}
                    className="transform scale-125 origin-center lg:origin-left"
                />
            </div>

            {/* 2. Content Row */}
            <div className="flex w-full max-w-screen-xl flex-col items-start gap-12 px-4 lg:flex-row lg:items-center lg:gap-24">
                {/* Left: Header */}
                <div className="flex-1">
                    <SectionHeader
                        align="left"
                        tagText="Our workflow"
                        headerText="Unlock the future of Note app"
                        highlightLastWord={true}
                    />
                </div>

                {/* Right: Description */}
                <div className="flex-1">
                    <p className="text-lg leading-relaxed text-gray-600">
                        Nicepay was born out of a simple realization: traditional financial
                        management tools weren't keeping up with the pace of modern
                        business. As businesses evolved, financial workflows became more
                        complex, and many companies found themselves bogged down by manual
                        processes, outdated software, and fragmented systems.
                    </p>
                </div>
            </div>

            {/* 3. Illustration */}
            <div className="w-full max-w-screen-xl px-4">
                <img
                    src="/src/assets/images/landing/illustrations/about us sec 2 ilustration cat.svg"
                    alt="NoteFiber Cat Illustration"
                    className="w-full rounded-2xl object-cover"
                />
            </div>
        </section>
    );
}
