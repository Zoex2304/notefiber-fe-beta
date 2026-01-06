import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MessageSquare, Trash2, Search as SearchIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatSession } from "@/types/ai-chat";

export interface SessionHistoryListProps {
    sessions: ChatSession[];
    activeSessionId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

/**
 * Displays a searchable list of chat sessions with selection and delete actions.
 * Enhanced with Framer Motion animations and premium styling.
 */
export function SessionHistoryList({
    sessions,
    activeSessionId,
    onSelect,
    onDelete
}: SessionHistoryListProps) {
    const [search, setSearch] = useState("");

    const filteredSessions = sessions
        .filter(s => s.name?.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header with Search */}
            <div className="p-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10 transition-colors">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search history..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-10 bg-muted/50 border-border rounded-xl focus-visible:ring-primary focus-visible:border-primary transition-all placeholder:text-muted-foreground"
                    />
                </div>

                {/* Session count badge */}
                <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground font-medium">
                        {filteredSessions.length} conversation{filteredSessions.length !== 1 ? 's' : ''}
                    </span>
                    {sessions.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            <Sparkles className="h-3 w-3" />
                            <span>AI Chats</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Session List */}
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                    <AnimatePresence mode="popLayout">
                        {filteredSessions.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-center py-12"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                    <MessageSquare className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground text-sm font-medium">No sessions found</p>
                                <p className="text-muted-foreground/70 text-xs mt-1">
                                    {search ? "Try a different search term" : "Start a new chat to begin"}
                                </p>
                            </motion.div>
                        ) : (
                            filteredSessions.map((session, index) => (
                                <motion.div
                                    key={session.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                    transition={{
                                        delay: index * 0.03,
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 30
                                    }}
                                    layout
                                    className={cn(
                                        "group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
                                        "border border-transparent hover:shadow-md",
                                        session.id === activeSessionId
                                            ? "bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20 shadow-sm"
                                            : "hover:bg-muted/50 hover:border-border"
                                    )}
                                    onClick={() => onSelect(session.id)}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    {/* Session Icon */}
                                    <motion.div
                                        className={cn(
                                            "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                            session.id === activeSessionId
                                                ? "bg-gradient-to-br from-primary to-purple-600 text-primary-foreground shadow-sm"
                                                : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                                        )}
                                        whileHover={{ rotate: [0, -5, 5, 0] }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <MessageSquare className="h-5 w-5" />
                                    </motion.div>

                                    {/* Session Info - use w-0 flex-1 to prevent expansion */}
                                    <div className="flex-1 w-0 py-0.5">
                                        <div className={cn(
                                            "font-medium text-sm truncate",
                                            session.id === activeSessionId ? "text-foreground" : "text-foreground"
                                        )}>
                                            {session.name || "Untitled Session"}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={cn(
                                                "text-xs truncate",
                                                session.id === activeSessionId ? "text-primary" : "text-muted-foreground"
                                            )}>
                                                {formatDistanceToNow(session.updatedAt, { addSuffix: true })}
                                            </span>
                                            {session.id === activeSessionId && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium shrink-0">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <motion.button
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(session.id);
                                        }}
                                        title="Delete session"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </motion.button>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </ScrollArea>
        </div>
    );
}
