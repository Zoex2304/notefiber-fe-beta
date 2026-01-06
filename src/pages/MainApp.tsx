"use client";

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import "@/App.css";
import { useNoteOrchestratorContext } from "@/contexts/NoteOrchestratorContext";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { NoteEditor } from "@/components/note-editor";
import { HeaderGradientBackground } from "@/components/atoms/HeaderGradientBackground";

import { GradientPill } from "@/components/common/GradientPill";
import { Plus } from "lucide-react";

export default function MainApp() {
  const {
    activeNote,
    handleNoteUpdate,
  } = useNoteOrchestratorContext();

  // If there's an active note (e.g. from deep link but rendered here), show editor.
  // Otherwise show dashboard empty state.
  if (activeNote.currentNote) {
    return (
      <div className="absolute inset-0 flex flex-col overflow-y-auto overflow-x-hidden">
        <NoteEditor note={activeNote.currentNote} onUpdate={handleNoteUpdate} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background p-8 overflow-hidden h-full relative">
      {/* Background Gradient - Theme-aware atomic component */}
      <HeaderGradientBackground className="absolute inset-0 z-0" />

      <div className="w-full max-w-[400px] mb-6 relative z-10">
        <DotLottieReact
          src="https://lottie.host/d670d9d5-55ad-47ab-9def-49702f7c7e49/KrwUHw5kwJ.lottie"
          loop
          autoplay
          className="w-full h-auto"
        />
      </div>
      <div className="text-center space-y-2 max-w-2xl relative z-10 w-full flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-foreground tracking-tight">
          Select a note to start editing
        </h2>
        <p className="text-muted-foreground text-base mb-6 max-w-md">
          Choose a note from the sidebar or create a new one to begin capturing your thoughts.
        </p>
        <GradientPill
          size="lg"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            useSidebarStore.getState().setLeftSidebarOpen(true);
          }}
        >
          Get Started
        </GradientPill>
      </div>
    </div>
  );
}
