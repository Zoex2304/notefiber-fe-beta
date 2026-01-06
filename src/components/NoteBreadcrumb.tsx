import { ChevronRight, Folder, FileText } from "lucide-react";
import type { Note } from "@/types/note";

interface NoteBreadcrumbProps {
    note: Note;
    onFolderClick?: (folderId: string) => void;
}

export function NoteBreadcrumb({ note, onFolderClick }: NoteBreadcrumbProps) {
    if (!note?.breadcrumb?.length) return null;

    return (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground px-6 py-3 bg-muted/40 border-b border-border">
            {note.breadcrumb.map((crumb, index) => (
                <span key={crumb.id} className="flex items-center gap-1">
                    {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground/50" />}

                    <button
                        type="button"
                        className="flex items-center gap-1 hover:underline cursor-pointer hover:text-foreground transition-colors bg-transparent border-none p-0 font-inherit"
                        onClick={() => onFolderClick?.(crumb.id)}
                    >
                        <Folder className="w-4 h-4 text-muted-foreground" />
                        {crumb.name}
                    </button>
                </span>
            ))}
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            <span className="text-foreground font-medium flex items-center gap-1">
                <FileText className="w-4 h-4 text-primary" />
                {note.title}
            </span>
        </nav>
    );
}
