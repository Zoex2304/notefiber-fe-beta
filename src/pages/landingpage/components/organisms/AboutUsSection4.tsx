import { SectionHeader } from "@/components/shadui/SectionHeader";
import { TeamCard } from "../molecules/TeamCard";

const teamMembers = [
    {
        imageSrc: "/images/landing/avatar/avatar 1.svg",
        name: "Anna Warie",
        role: "CEO & Founder",
    },
    {
        imageSrc: "/images/landing/avatar/avatar 2.svg",
        name: "Anna Warie",
        role: "CEO & Founder",
    },
    {
        imageSrc: "/images/landing/avatar/avatar 3.svg",
        name: "Anna Warie",
        role: "CEO & Founder",
    },
    {
        imageSrc: "/images/landing/avatar/avatar 4.svg",
        name: "Anna Warie",
        role: "CEO & Founder",
    },
];

export function AboutUsSection4() {
    return (
        <section className="flex w-full flex-col items-center py-16 lg:py-24 bg-white">
            <div className="flex w-full max-w-screen-xl flex-col items-center gap-16 lg:gap-24 px-4">
                <SectionHeader
                    align="center"
                    tagText="Our Workflow"
                    headerText="The amazing team behind NoteFiber"
                    highlightLastWord={true}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                    {teamMembers.map((member, index) => (
                        <TeamCard
                            key={index}
                            imageSrc={member.imageSrc}
                            name={member.name}
                            role={member.role}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
