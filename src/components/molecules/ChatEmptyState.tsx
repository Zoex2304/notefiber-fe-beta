import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion } from 'framer-motion';
import { Sparkles, PenTool, Lightbulb, FileText } from 'lucide-react';

export interface ChatEmptyStateProps {
    /** Optional custom title */
    title?: string;
    /** Optional custom description */
    description?: string;
    /** Handler for quick actions - receives prompt and whether to trigger note selection */
    onAction?: (prompt: string, triggerNoteSelection?: boolean) => void;
}

/**
 * Empty state component for chat interface.
 * Shows animated Lottie illustration with welcome message and quick actions.
 */
export function ChatEmptyState({
    title = "How can I help you?",
    description = "Ask questions about your notes or generate new ideas.",
    onAction
}: ChatEmptyStateProps) {

    const actions = [
        { label: "Summarize note...", icon: FileText, prompt: "Summarize the key points of @", triggerNotes: true },
        { label: "Explain concept...", icon: Lightbulb, prompt: "Explain the concept from @", triggerNotes: true },
        { label: "Draft content...", icon: PenTool, prompt: "Draft content based on @", triggerNotes: true },
        { label: "Answer questions...", icon: Sparkles, prompt: "Answer all the questions in the following @", triggerNotes: true },
    ];

    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center text-muted-foreground p-8 space-y-6">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="rounded-full overflow-hidden"
            >
                <div className="w-[280px] h-[180px] relative flex items-center justify-center">
                    <DotLottieReact
                        src="https://lottie.host/b00c932e-94d9-407f-9893-8e00ce7a55f3/hanmwXSGzz.lottie"
                        loop
                        autoplay
                        className="w-full h-full"
                    />
                </div>
            </motion.div>

            <div className="space-y-1">
                <h3 className="text-foreground font-semibold text-xl">{title}</h3>
                <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">{description}</p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-[320px]">
                {actions.map((action, index) => (
                    <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (index * 0.05) }}
                        onClick={() => onAction?.(action.prompt, action.triggerNotes)}
                        className="flex flex-col items-center justify-center p-3 gap-2 bg-card border border-border rounded-xl hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all group shadow-sm hover:shadow-md"
                    >
                        <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">{action.label}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
