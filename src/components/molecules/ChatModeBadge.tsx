import { Badge } from "@/components/shadui/badge";
import { MessageSquare, Sparkles } from "lucide-react";

interface ChatModeBadgeProps {
    mode?: "rag" | "bypass" | "nuance";
    nuanceKey?: string;
}

export function ChatModeBadge({ mode, nuanceKey }: ChatModeBadgeProps) {
    if (mode === "bypass") {
        return (
            <Badge variant="secondary" className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                Direct Chat
            </Badge>
        );
    }

    if (mode === "nuance") {
        return (
            <Badge variant="outline" className="flex items-center gap-1 border-primary/50 text-primary">
                <Sparkles className="h-3 w-3" />
                {nuanceKey} Mode
            </Badge>
        );
    }

    return null; // RAG mode is default, no badge
}
