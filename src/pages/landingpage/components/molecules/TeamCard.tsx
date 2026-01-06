import { PotIcon } from "@/components/shadui/PotIcon";
import { Instagram, Github } from "lucide-react";

interface TeamCardProps {
    imageSrc: string;
    name: string;
    role: string;
}

export function TeamCard({ imageSrc, name, role }: TeamCardProps) {
    return (
        <div className="flex flex-col gap-4 p-4 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            {/* Avatar Image */}
            <div className="w-full aspect-square overflow-hidden rounded-xl">
                <img
                    src={imageSrc}
                    alt={name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                    <p className="text-sm text-gray-500">{role}</p>
                </div>

                {/* Social Icons */}
                <div className="flex gap-3">
                    <PotIcon icon={Instagram} size="small" className="w-10 h-10 lg:w-12 lg:h-12 p-2.5" />
                    <PotIcon icon={Github} size="small" className="w-10 h-10 lg:w-12 lg:h-12 p-2.5" />
                </div>
            </div>
        </div>
    );
}
