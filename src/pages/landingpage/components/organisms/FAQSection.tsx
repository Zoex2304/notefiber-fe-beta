import { SectionHeader } from "@/components/shadui/SectionHeader";
import { FAQItem } from "../molecules/FAQItem";

const faqs = [
    {
        question: "What is NoteFiber?",
        answer:
            "NoteFiber is an all-in-one financial management platform designed to simplify payments, automate invoicing, track expenses in real-time, and ensure secure transactions for businesses of all sizes.",
    },
    {
        question: "How does NoteFiber work?",
        answer:
            "NoteFiber connects with your existing bank accounts and accounting software to centralize your financial data. It provides tools for invoicing, expense tracking, and financial reporting in one dashboard.",
    },
    {
        question: "Is NoteFiber secure?",
        answer:
            "Yes, NoteFiber uses bank-grade encryption and adheres to strict security standards to ensure your financial data is always protected.",
    },
    {
        question: "Can NoteFiber integrate with other accounting software?",
        answer:
            "Absolutely. NoteFiber integrates seamlessly with popular accounting platforms like QuickBooks, Xero, and FreshBooks.",
    },
    {
        question: "What types of payments does NoteFiber support?",
        answer:
            "We support various payment methods including credit cards, ACH transfers, and wire transfers.",
    },
    {
        question: "How can I track expenses with NoteFiber?",
        answer:
            "You can link your business cards or upload receipts directly to the platform. NoteFiber automatically categorizes your expenses for easy tracking.",
    },
    {
        question: "What size of business is NoteFiber suitable for?",
        answer:
            "NoteFiber is scalable and suitable for businesses of all sizes, from freelancers and startups to large enterprises.",
    },
];

export function FAQSection() {
    const description =
        "Choose a plan that fits your business needs and budget. No hidden fees, no surprises—just straightforward pricing for powerful financial management.";

    return (
        <section className="flex w-full flex-col items-center py-16 lg:py-24 bg-white">
            <div className="flex w-full flex-col items-center gap-12 lg:gap-16 px-4 lg:max-w-4xl">
                <SectionHeader
                    align="center"
                    tagText="Frequently asked questions"
                    headerText="Frequently asked questions"
                    description={description}
                    highlightLastWord={true}
                />
                <div className="flex w-full flex-col gap-4">
                    {faqs.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>
            </div>
        </section>
    );
}
