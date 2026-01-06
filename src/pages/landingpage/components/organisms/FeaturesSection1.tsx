import { TrustedCompanies } from "./TrustedCompanies";
import { SectionHeader } from "@/components/shadui/SectionHeader";
import { FeatureRow } from "../molecules/FeatureRow";

export function FeaturesSection1() {
    return (
        <section className="flex w-full flex-col items-center py-16 lg:py-24 bg-white gap-24 lg:gap-32">
            {/* 1. Trusted Companies Section */}
            <TrustedCompanies />

            {/* 2. Main Header */}
            <div className="flex w-full max-w-screen-xl px-4 justify-center">
                <SectionHeader
                    align="center"
                    tagText="Key features"
                    headerText="Boost your productivity with NoteFiber"
                    highlightLastWord={true}
                />
            </div>

            {/* 3. Feature Rows */}
            <div className="flex w-full max-w-screen-xl flex-col gap-24 lg:gap-32 px-4">
                {/* Feature 1: AI Chatbot */}
                <FeatureRow
                    tagText="Our Feature"
                    title="Ai chatbot integrated"
                    description="Ask questions naturally and get instant answers from all your documents, notes, and recordings. Our AI understands context and delivers precise information when you need it."
                    imageSrc="/images/landing/illustrations/ai chatbot integration ilustration.svg"
                    imageAlt="AI Chatbot Integration"
                />

                {/* Feature 2: Semantic Search */}
                <FeatureRow
                    tagText="Our Feature"
                    title="Semantic search"
                    description="Powered by advanced RAG models and contextual search, our system understands the meaning behind your queries. Search by concept, not just keywords, and discover insights across all your content."
                    imageSrc="/images/landing/illustrations/semantic search ilustration.svg"
                    imageAlt="Semantic Search"
                />

                {/* Feature 3: User Friendly */}
                <FeatureRow
                    tagText="Our Feature"
                    title="User friendly"
                    description="Experience a clean, intuitive interface that lets you capture, search, and organize your notes effortlessly — powered by AI that understands your workflow."
                    imageSrc="/images/landing/illustrations/user friendly.svg"
                    imageAlt="User Friendly Interface"
                />
            </div>
        </section>
    );
}
