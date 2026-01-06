import { SectionHeader } from "@/components/shadui/SectionHeader";
import { Button } from "@/components/shadui/button";
import { cn } from "@/lib/utils";

interface FeatureRowProps {
    tagText: string;
    title: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
    reverse?: boolean;
}

export function FeatureRow({
    tagText,
    title,
    description,
    imageSrc,
    imageAlt,
    reverse = false,
}: FeatureRowProps) {
    return (
        <div
            className={cn(
                "flex w-full flex-col items-center gap-12 lg:gap-24",
                reverse ? "lg:flex-row-reverse" : "lg:flex-row"
            )}
        >
            {/* Text Content */}
            <div className="flex flex-1 flex-col items-start gap-8">
                <SectionHeader
                    align="left"
                    tagText={tagText}
                    headerText={title}
                    description={description}
                    highlightLastWord={false}
                />
                <Button variant="default" size="default">
                    Free trial
                </Button>
            </div>

            {/* Image Content */}
            <div className="flex flex-1 justify-center w-full">
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="w-full max-w-md lg:max-w-xl h-auto object-contain drop-shadow-xl"
                />
            </div>
        </div>
    );
}
