import { createContext, useContext, type ReactNode } from "react";
import { useNoteOrchestrator } from "@/hooks/useNoteOrchestrator";

// Return type of the hook
type NoteOrchestratorContextType = ReturnType<typeof useNoteOrchestrator>;

const NoteOrchestratorContext = createContext<NoteOrchestratorContextType | null>(null);

export function NoteOrchestratorProvider({ children }: { children: ReactNode }) {
    const orchestrator = useNoteOrchestrator();

    return (
        <NoteOrchestratorContext.Provider value={orchestrator}>
            {children}
        </NoteOrchestratorContext.Provider>
    );
}

export function useNoteOrchestratorContext() {
    const context = useContext(NoteOrchestratorContext);
    if (!context) {
        throw new Error("useNoteOrchestratorContext must be used within a NoteOrchestratorProvider");
    }
    return context;
}
