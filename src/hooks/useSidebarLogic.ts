import { useState } from "react";

export function useSidebarLogic() {
    const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
    const [selectedNote, setSelectedNote] = useState<string | null>(null);
    const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set());

    // UI State flags
    const [isCreatingNote, setIsCreatingNote] = useState(false);
    const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
    const [isProcessingMove, setIsProcessingMove] = useState(false);
    const [isDeletingNotebook, setIsDeletingNotebook] = useState<string | null>(null);
    const [isDeletingNote, setIsDeletingNote] = useState<string | null>(null);

    return {
        selectedNotebook,
        setSelectedNotebook,
        selectedNote,
        setSelectedNote,
        expandedNotebooks,
        setExpandedNotebooks,
        isCreatingNote,
        setIsCreatingNote,
        isCreatingNotebook,
        setIsCreatingNotebook,
        isProcessingMove,
        setIsProcessingMove,
        isDeletingNotebook,
        setIsDeletingNotebook,
        isDeletingNote,
        setIsDeletingNote
    };
}
