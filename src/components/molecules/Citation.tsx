import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export interface CitationProps {
    /** Unique identifier of the referenced note */
    noteId: string;
    /** Display title of the referenced note */
    title: string;
    /** Citation index (1-based for display) */
    index: number;
    /** Handler called when citation is clicked */
    onClick: (noteId: string) => void;
}

/**
 * Citation component - displays a clickable reference to a note
 * Used in AI chat responses to provide source references
 */
export function Citation({ noteId, title, index, onClick }: CitationProps) {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => onClick(noteId)}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 py-1 text-xs font-medium 
                       bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700
                       rounded-full transition-all duration-200 hover:shadow-sm"
            title={title}
        >
            <FileText className="h-3 w-3" />
            <span className="max-w-[120px] truncate">{title}</span>
            <span className="text-blue-500 opacity-70">[{index}]</span>
        </Button>
    );
}
