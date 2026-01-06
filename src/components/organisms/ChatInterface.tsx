import { useRef, useEffect, useState, useCallback } from "react";
import { Bot, MessageSquare, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatbotBackground from "@/assets/images/common/chatbot_gradient_background_v2.svg";

import { ChatBubble } from "@/components/molecules/ChatBubble";
import { PixelLoader } from "@/components/molecules/PixelLoader";
import { ChatEmptyState } from "@/components/molecules/ChatEmptyState";
import { ChatInputArea } from "@/components/molecules/ChatInputArea";
import { Button } from "@/components/shadui/button";

import type { Message, ChatSession } from "@/types/ai-chat";
import type { Note } from "@/types/note";

export interface ChatInterfaceProps {
    /** Active session ID */
    activeSessionId: string | null;
    /** List of sessions for session name lookup */
    sessions: ChatSession[];
    /** Messages in the active session */
    messages: Message[];
    /** Whether AI is currently generating */
    isLoading: boolean;
    /** Handler for sending messages */
    onSendMessage: (content: string) => void;
    /** Handler for citation clicks */
    onCitationClick?: (noteId: string) => void;
    /** Current input value (controlled) */
    inputValue: string;
    /** Input change handler (controlled) */
    onInputChange: (value: string) => void;
    /** Available notes for autocomplete */
    notes: Note[];
    /** Handler for saving AI response to notes */
    onSaveToNotes?: (content: string, suggestedTitle: string) => void;
}

/**
 * Complete chat interface organism.
 * Composes: session header, message list, empty state, loading state, and input area.
 * Includes auto-scroll synced with typewriter animation.
 */
export function ChatInterface({
    activeSessionId,
    sessions,
    messages,
    isLoading,
    onSendMessage,
    onCitationClick,
    inputValue,
    onInputChange,
    notes,
    onSaveToNotes
}: ChatInterfaceProps) {
    const currentSession = sessions.find(s => s.id === activeSessionId);

    // Refs for scroll management
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // State for scroll button visibility
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isNearBottom, setIsNearBottom] = useState(true);
    const [mouseNearBottomRight, setMouseNearBottomRight] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    // Get the last message content for typewriter sync
    const lastMessage = messages[messages.length - 1];
    const lastMessageContent = lastMessage?.content || "";

    // Scroll to bottom function
    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
    }, []);

    // Check if user is near bottom of scroll
    const checkScrollPosition = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const threshold = 100; // px from bottom
        const isNear = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
        setIsNearBottom(isNear);
        setShowScrollButton(!isNear && messages.length > 0);
    }, [messages.length]);

    // Auto-scroll when messages change or during loading (syncs with typewriter)
    useEffect(() => {
        // Only auto-scroll if user is near bottom or it's a new message
        if (isNearBottom) {
            scrollToBottom("smooth");
        }
    }, [lastMessageContent, isLoading, isNearBottom, scrollToBottom]);

    // Scroll during typing animation
    useEffect(() => {
        let animationFrameId: number;

        const scrollDuringTyping = () => {
            if (isTyping && isNearBottom) {
                messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
                animationFrameId = requestAnimationFrame(scrollDuringTyping);
            }
        };

        if (isTyping && isNearBottom) {
            animationFrameId = requestAnimationFrame(scrollDuringTyping);
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isTyping, isNearBottom]);

    // Initial scroll on new messages
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom("instant");
        }
    }, [messages.length, scrollToBottom]);

    // Track scroll position
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => checkScrollPosition();
        container.addEventListener("scroll", handleScroll, { passive: true });

        return () => container.removeEventListener("scroll", handleScroll);
    }, [checkScrollPosition]);

    // Track mouse position for bottom-right hover detection
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const bottomThreshold = 80; // px from bottom
        const rightThreshold = 80; // px from right

        const isNearBottomEdge = rect.bottom - e.clientY < bottomThreshold;
        const isNearRightEdge = rect.right - e.clientX < rightThreshold;

        setMouseNearBottomRight(isNearBottomEdge && isNearRightEdge);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setMouseNearBottomRight(false);
    }, []);

    // Show button when: scrolled up AND (hovering near bottom-right OR always show when far from bottom)
    const buttonVisible = showScrollButton && (mouseNearBottomRight || !isNearBottom);

    return (
        <div className="flex flex-col flex-1 h-full relative z-0">
            {/* Background Gradient */}
            <img
                src={ChatbotBackground}
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none -z-10 opacity-50"
            />

            {/* Content Container - strictly bounded */}
            <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden relative">
                {/* Session Header */}
                {activeSessionId && (
                    <div className="px-4 py-2 border-b border-gray-100 bg-white/50 flex items-center justify-between shrink-0">
                        <div className="text-xs font-medium text-gray-500 truncate max-w-[200px] flex items-center gap-1.5">
                            <MessageSquare className="h-3 w-3" />
                            {currentSession?.name || "New Chat"}
                        </div>
                    </div>
                )}

                {/* Message List - Custom scroll container */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 p-4 w-full overflow-y-auto overflow-x-hidden scroll-smooth"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="space-y-4 pb-2 w-full overflow-hidden">
                        {messages.map((message, index) => (
                            <ChatBubble
                                key={message.id}
                                message={message}
                                onCitationClick={onCitationClick}
                                animate={index === messages.length - 1}
                                onTyping={index === messages.length - 1 ? setIsTyping : undefined}
                                onSaveToNotes={message.role === 'assistant' ? onSaveToNotes : undefined}
                            />
                        ))}

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex gap-2 items-center text-gray-400 text-sm py-2">
                                <Bot className="h-4 w-4 animate-pulse text-purple-500" />
                                <PixelLoader />
                            </div>
                        )}

                        {/* Empty State */}
                        {messages.length === 0 && !isLoading && (
                            <ChatEmptyState onAction={(prompt) => onInputChange(prompt)} />
                        )}

                        {/* Scroll anchor */}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Scroll to Bottom Button */}
                <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => scrollToBottom("smooth")}
                    className={cn(
                        "absolute bottom-4 right-4 h-9 w-9 rounded-full shadow-lg transition-all duration-200 z-10",
                        "bg-white border border-gray-200 hover:bg-gray-50 hover:border-purple-300",
                        buttonVisible
                            ? "opacity-100 translate-y-0 pointer-events-auto"
                            : "opacity-0 translate-y-2 pointer-events-none"
                    )}
                    aria-label="Scroll to bottom"
                >
                    <ArrowDown className="h-4 w-4 text-gray-600" />
                </Button>
            </div>

            {/* Input Area */}
            <ChatInputArea
                value={inputValue}
                onChange={onInputChange}
                onSend={onSendMessage}
                disabled={isLoading}
                notes={notes}
            />
        </div>
    );
}
