import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItemProps {
    question: string;
    answer: string;
}

export function FAQItem({ question, answer }: FAQItemProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full border rounded-lg overflow-hidden bg-white border-gray-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between p-4 lg:p-6 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <span className="text-lg font-medium text-gray-900">{question}</span>
                {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-customPrimary-500" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-customPrimary-500" />
                )}
            </button>
            <div
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="p-4 lg:p-6 pt-0 text-gray-600 leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
}
