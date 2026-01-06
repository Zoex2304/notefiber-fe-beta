import { User, Bot, Copy, Check, FileText, BookmarkPlus } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import type { Message } from "@/types/ai-chat";
import { cn } from "@/lib/utils";
import { Citation } from "./Citation";
import { ChatModeBadge } from "./ChatModeBadge";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useState } from "react";
import { Button } from "@/components/shadui/button";

export interface ChatBubbleProps {
    /** The message to display */
    message: Message;
    /** Handler for citation clicks - navigates to the referenced note */
    onCitationClick?: (noteId: string) => void;
    /** Whether to render in a compact mode (e.g. for sidebar) */
    compact?: boolean;
    /** Whether to animate the text entry (typewriter effect) */
    animate?: boolean;
    /** Callback fired when typewriter animation state changes (for scroll sync) */
    onTyping?: (isTyping: boolean) => void;
    /** Handler for save to notes action */
    onSaveToNotes?: (content: string, suggestedTitle: string) => void;
}

export function ChatBubble({ message, onCitationClick, compact, animate = false, onTyping, onSaveToNotes }: ChatBubbleProps) {
    const isUser = message.role === "user";
    const isAssistant = message.role === "assistant";
    const hasCitations = isAssistant && message.citations && message.citations.length > 0;
    const [copied, setCopied] = useState(false);

    // Only animate if requested AND it's the assistant
    const shouldAnimate = animate && isAssistant;
    const { displayedText } = useTypewriter(message.content, 10, shouldAnimate, onTyping);

    // Normalize LaTeX delimiters for react-markdown
    const normalizeLatex = (text: string) => {
        // Replace \[ ... \] with $$ ... $$ for block math
        // Replace \( ... \) with $ ... $ for inline math
        // We use a specific order to avoid double replacement issues if they existed, 
        // though here the patterns are distinct.
        return text
            .replace(/\\\[/g, '$$$$')
            .replace(/\\\]/g, '$$$$')
            .replace(/\\\(/g, '$')
            .replace(/\\\)/g, '$');
    };

    const processedContent = normalizeLatex(displayedText);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveToNotes = () => {
        // Generate suggested title from first line or first 50 chars
        const firstLine = message.content.split('\n')[0] || 'AI Response';
        const suggestedTitle = firstLine.length > 50
            ? firstLine.substring(0, 50) + '...'
            : firstLine;
        onSaveToNotes?.(message.content, suggestedTitle);
    };

    return (
        <div
            className={cn("flex gap-3", isUser ? "justify-end" : "justify-start", compact && "gap-2")}
        >
            <div
                className={cn(
                    "flex gap-3 max-w-[85%] min-w-0 group",
                    isUser ? "flex-row-reverse" : "flex-row",
                    compact && "gap-2"
                )}
            >
                {/* Avatar */}
                <div className="flex-shrink-0 mt-0.5">
                    {isUser ? (
                        <div className="w-7 h-7 bg-gradient-primary-violet rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                            <User className="h-3.5 w-3.5 text-white" />
                        </div>
                    ) : (
                        <div className="w-7 h-7 bg-white border border-purple-100 rounded-full flex items-center justify-center shadow-sm">
                            <Bot className="h-4 w-4 text-purple-600" />
                        </div>
                    )}
                </div>

                {/* Message Content Wrapper */}
                <div className={cn("flex flex-col min-w-0 max-w-full", isUser ? "items-end" : "items-start")}>
                    <div
                        className={cn(
                            "rounded-2xl px-4 py-3 shadow-sm min-w-0 overflow-hidden relative text-[13.5px] leading-relaxed",
                            isUser
                                ? "bg-gradient-primary-violet text-white rounded-tr-none"
                                : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-none"
                        )}
                    >
                        {/* Mode Badge - Only for assistant */}
                        {isAssistant && (message.mode === "bypass" || message.mode === "nuance") && (
                            <div className="mb-2">
                                <ChatModeBadge mode={message.mode} nuanceKey={message.nuanceKey} />
                            </div>
                        )}

                        {/* Message Text */}
                        {isAssistant ? (
                            <div className="markdown-content break-words min-w-0">
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath, remarkGfm]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={{
                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                        ol: ({ node, children, start, ...props }) => (
                                            <ol
                                                className="list-decimal pl-4 mb-2 space-y-1"
                                                start={start || 1}
                                                style={{ counterReset: `list-item ${(start || 1) - 1}` }}
                                                {...props}
                                            >
                                                {children}
                                            </ol>
                                        ),
                                        li: ({ children, node, ...props }) => {
                                            // Check if this is a task list item (GFM checkbox)
                                            const classNames = node?.properties?.className;
                                            const isTaskItem = Array.isArray(classNames) && classNames.includes('task-list-item');
                                            return (
                                                <li className={cn("pl-1", isTaskItem && "list-none")} {...props}>
                                                    {children}
                                                </li>
                                            );
                                        },
                                        h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-sm font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h3>,
                                        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                        em: ({ children }) => <em className="italic">{children}</em>,
                                        del: ({ children }) => <del className="line-through opacity-70">{children}</del>,
                                        hr: () => <hr className="my-3 border-gray-200" />,
                                        // Table support for LLM tabular responses
                                        table: ({ children }) => (
                                            <div className="overflow-x-auto my-2 rounded-md border border-gray-200">
                                                <table className="w-full text-xs border-collapse">
                                                    {children}
                                                </table>
                                            </div>
                                        ),
                                        thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                                        tbody: ({ children }) => <tbody className="divide-y divide-gray-100">{children}</tbody>,
                                        tr: ({ children }) => <tr className="hover:bg-gray-50/50">{children}</tr>,
                                        th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">{children}</th>,
                                        td: ({ children }) => <td className="px-3 py-2 text-gray-600">{children}</td>,
                                        code: ({ node, className, children, ...props }) => {
                                            const match = /language-(\w+)/.exec(className || '');
                                            const isInline = !match && !String(children).includes('\n');
                                            return isInline ? (
                                                <code className="bg-gray-100 text-purple-700 px-1 py-0.5 rounded text-xs font-mono border border-gray-200" {...props}>
                                                    {children}
                                                </code>
                                            ) : (
                                                <div className="relative my-2 rounded-md overflow-hidden bg-gray-50 border border-gray-200 w-full">
                                                    <div className="px-3 py-1.5 bg-gray-100 border-b border-gray-200 text-xs text-gray-500 font-mono flex justify-between items-center">
                                                        <span>{match?.[1] || 'text'}</span>
                                                    </div>
                                                    <div className="p-3 overflow-x-auto w-0 min-w-full">
                                                        <code className={cn("text-xs font-mono text-gray-800 whitespace-pre block", className)} {...props}>
                                                            {children}
                                                        </code>
                                                    </div>
                                                </div>
                                            );
                                        },
                                        blockquote: ({ children }) => (
                                            <blockquote className="border-l-2 border-purple-200 pl-3 italic text-gray-500 my-2">
                                                {children}
                                            </blockquote>
                                        ),
                                        a: ({ children, href }) => (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-purple-600 hover:text-purple-700 underline underline-offset-2"
                                            >
                                                {children}
                                            </a>
                                        ),
                                    }}
                                >
                                    {processedContent}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div className="whitespace-pre-wrap break-words">
                                {message.content}

                                {/* User References */}
                                {message.references && message.references.length > 0 && (
                                    <div className="mt-3 pt-2 border-t border-white/20">
                                        <p className="text-[10px] uppercase tracking-wider font-semibold opacity-70 mb-2">Referenced Notes</p>
                                        <div className="flex flex-wrap gap-2">
                                            {message.references.map((ref) => (
                                                <div
                                                    key={ref.note_id}
                                                    className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 cursor-pointer hover:bg-white/30 transition-colors border border-white/10"
                                                    onClick={() => onCitationClick?.(ref.note_id)}
                                                >
                                                    <FileText size={12} strokeWidth={2.5} />
                                                    <span className="truncate max-w-[150px]">{ref.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}



                        {/* Citations - Only for assistant messages */}
                        {hasCitations && onCitationClick && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-2">Sources</p>
                                <div className="flex flex-wrap gap-2">
                                    {message.citations!.map((citation, index) => (
                                        <Citation
                                            key={citation.noteId}
                                            noteId={citation.noteId}
                                            title={citation.title}
                                            index={index + 1}
                                            onClick={onCitationClick}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Timestamp */}
                        <div
                            className={cn(
                                "text-[10px] mt-1.5 flex justify-end",
                                isUser ? "text-purple-100" : "text-gray-400"
                            )}
                        >
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    {!compact && (
                        <div className="flex items-center gap-1 mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {/* Copy */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                                onClick={handleCopy}
                                title="Copy"
                            >
                                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>

                            {/* Save to Notes (Assistant Only) */}
                            {isAssistant && onSaveToNotes && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md"
                                    onClick={handleSaveToNotes}
                                    title="Save to Notes"
                                >
                                    <BookmarkPlus className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
