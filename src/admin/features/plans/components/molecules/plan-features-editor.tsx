import { Label } from '@admin/components/ui/label'
import { Switch } from '@admin/components/ui/switch'
import { cn } from '@admin/lib/utils'
import { FolderOpen, FileText, Search, MessageSquare, Sparkles, Infinity } from 'lucide-react'
import { Badge } from '@admin/components/ui/badge'
import { CleanNumberInput } from '../atoms/clean-number-input'

interface PlanFeaturesEditorProps {
    // Storage limits
    maxNotebooks: number
    onMaxNotebooksChange: (value: number) => void
    maxNotesPerNotebook: number
    onMaxNotesPerNotebookChange: (value: number) => void
    // Feature toggles
    semanticSearch: boolean
    onSemanticSearchChange: (value: boolean) => void
    aiChat: boolean
    onAiChatChange: (value: boolean) => void
    // Daily limits
    aiChatDailyLimit: number
    onAiChatDailyLimitChange: (value: number) => void
    semanticSearchDailyLimit: number
    onSemanticSearchDailyLimitChange: (value: number) => void
    // UI state
    disabled?: boolean
    className?: string
}

function LimitValueDisplay({ value }: { value: number }) {
    if (value === -1) {
        return (
            <Badge variant="secondary" className="gap-1">
                <Infinity className="h-3 w-3" />
                Unlimited
            </Badge>
        )
    }
    if (value === 0) {
        return <Badge variant="destructive">Disabled</Badge>
    }
    return null
}

export function PlanFeaturesEditor({
    maxNotebooks,
    onMaxNotebooksChange,
    maxNotesPerNotebook,
    onMaxNotesPerNotebookChange,
    semanticSearch,
    onSemanticSearchChange,
    aiChat,
    onAiChatChange,
    aiChatDailyLimit,
    onAiChatDailyLimitChange,
    semanticSearchDailyLimit,
    onSemanticSearchDailyLimitChange,
    disabled,
    className,
}: PlanFeaturesEditorProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {/* Storage Limits Section */}
            <div className="rounded-lg border bg-card p-4">
                <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <FolderOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">Storage Limits</h3>
                        <p className="text-xs text-muted-foreground">
                            Cumulative limits that don't reset
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {/* Max Notebooks */}
                    <div className="space-y-2">
                        <Label htmlFor="max-notebooks" className="flex items-center gap-2">
                            <FolderOpen className="h-4 w-4" />
                            Max Notebooks (Folders)
                        </Label>
                        <div className="flex items-center gap-2">
                            <CleanNumberInput
                                id="max-notebooks"
                                allowNegative={true}
                                placeholder="-1 (unlimited)"
                                value={maxNotebooks}
                                onChange={onMaxNotebooksChange}
                                disabled={disabled}
                                className="flex-1"
                            />
                            <LimitValueDisplay value={maxNotebooks} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            -1 = unlimited, 0 = disabled
                        </p>
                    </div>

                    {/* Max Notes per Notebook */}
                    <div className="space-y-2">
                        <Label htmlFor="max-notes-per-notebook" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Max Notes per Notebook
                        </Label>
                        <div className="flex items-center gap-2">
                            <CleanNumberInput
                                id="max-notes-per-notebook"
                                allowNegative={true}
                                placeholder="-1 (unlimited)"
                                value={maxNotesPerNotebook}
                                onChange={onMaxNotesPerNotebookChange}
                                disabled={disabled}
                                className="flex-1"
                            />
                            <LimitValueDisplay value={maxNotesPerNotebook} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            -1 = unlimited, 0 = disabled
                        </p>
                    </div>
                </div>
            </div>

            {/* AI Features Section */}
            <div className="rounded-lg border bg-card p-4">
                <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-1/10">
                        <Sparkles className="h-4 w-4 text-chart-1" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">AI Features</h3>
                        <p className="text-xs text-muted-foreground">
                            Daily limits reset at midnight
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Semantic Search */}
                    <div className="rounded-lg border bg-background/50 p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="semantic-search" className="flex items-center gap-2 text-sm font-medium">
                                    <Search className="h-4 w-4" />
                                    Semantic Search
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Enable AI-powered semantic search
                                </p>
                            </div>
                            <Switch
                                id="semantic-search"
                                checked={semanticSearch}
                                onCheckedChange={onSemanticSearchChange}
                                disabled={disabled}
                            />
                        </div>

                        {semanticSearch && (
                            <div className="mt-4 space-y-2">
                                <Label htmlFor="semantic-search-limit" className="text-xs">
                                    Daily Search Limit
                                </Label>
                                <div className="flex items-center gap-2">
                                    <CleanNumberInput
                                        id="semantic-search-limit"
                                        placeholder="30"
                                        value={semanticSearchDailyLimit}
                                        onChange={onSemanticSearchDailyLimitChange}
                                        disabled={disabled}
                                        className="w-32"
                                    />
                                    <LimitValueDisplay value={semanticSearchDailyLimit} />
                                    <span className="text-xs text-muted-foreground">requests/day</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* AI Chat */}
                    <div className="rounded-lg border bg-background/50 p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="ai-chat" className="flex items-center gap-2 text-sm font-medium">
                                    <MessageSquare className="h-4 w-4" />
                                    AI Chat Assistant
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Enable AI assistant chat feature
                                </p>
                            </div>
                            <Switch
                                id="ai-chat"
                                checked={aiChat}
                                onCheckedChange={onAiChatChange}
                                disabled={disabled}
                            />
                        </div>

                        {aiChat && (
                            <div className="mt-4 space-y-2">
                                <Label htmlFor="ai-chat-limit" className="text-xs">
                                    Daily Chat Limit
                                </Label>
                                <div className="flex items-center gap-2">
                                    <CleanNumberInput
                                        id="ai-chat-limit"
                                        placeholder="50"
                                        value={aiChatDailyLimit}
                                        onChange={onAiChatDailyLimitChange}
                                        disabled={disabled}
                                        className="w-32"
                                    />
                                    <LimitValueDisplay value={aiChatDailyLimit} />
                                    <span className="text-xs text-muted-foreground">messages/day</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
