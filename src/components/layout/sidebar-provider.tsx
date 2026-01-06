/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { PanelLeftIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/shadui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/shadui/tooltip'

// ========== Constants ==========
const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const SIDEBAR_WIDTH = '280px'
const SIDEBAR_WIDTH_COLLAPSED = '64px'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

// ========== Context ==========
type SidebarContextProps = {
    state: 'expanded' | 'collapsed'
    open: boolean
    setOpen: (open: boolean) => void
    toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

export function useSidebar() {
    const context = React.useContext(SidebarContext)
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider.')
    }
    return context
}

// ========== Provider ==========
interface SidebarProviderProps {
    children: React.ReactNode
    defaultOpen?: boolean
}

export function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
    const [open, setOpenState] = React.useState(() => {
        // Read from cookie on mount
        if (typeof document !== 'undefined') {
            const cookie = document.cookie
                .split('; ')
                .find(row => row.startsWith(SIDEBAR_COOKIE_NAME + '='))
            if (cookie) {
                return cookie.split('=')[1] === 'true'
            }
        }
        return defaultOpen
    })

    const setOpen = React.useCallback((value: boolean) => {
        setOpenState(value)
        // Persist to cookie
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    }, [])

    const toggleSidebar = React.useCallback(() => {
        setOpen(!open)
    }, [open, setOpen])

    // Keyboard shortcut: Ctrl/Cmd + B
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                toggleSidebar()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [toggleSidebar])

    const state = open ? 'expanded' : 'collapsed'

    const contextValue = React.useMemo<SidebarContextProps>(
        () => ({ state, open, setOpen, toggleSidebar }),
        [state, open, setOpen, toggleSidebar]
    )

    return (
        <SidebarContext.Provider value={contextValue}>
            <TooltipProvider delayDuration={0}>
                <div
                    data-sidebar-wrapper=""
                    style={{
                        '--sidebar-width': SIDEBAR_WIDTH,
                        '--sidebar-width-collapsed': SIDEBAR_WIDTH_COLLAPSED,
                    } as React.CSSProperties}
                    className="flex min-h-screen w-full"
                >
                    {children}
                </div>
            </TooltipProvider>
        </SidebarContext.Provider>
    )
}

// ========== Sidebar Container ==========
interface SidebarProps {
    children: React.ReactNode
    className?: string
}

export function Sidebar({ children, className }: SidebarProps) {
    const { state } = useSidebar()

    return (
        <aside
            data-state={state}
            className={cn(
                'flex flex-col border-r bg-card transition-[width] duration-200 ease-in-out',
                state === 'expanded' ? 'w-[var(--sidebar-width)]' : 'w-[var(--sidebar-width-collapsed)]',
                className
            )}
        >
            {children}
        </aside>
    )
}

// ========== Sidebar Header ==========
export function SidebarHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('flex flex-col gap-2 p-3 border-b', className)}>
            {children}
        </div>
    )
}

// ========== Sidebar Content ==========
export function SidebarContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('flex-1 overflow-auto', className)}>
            {children}
        </div>
    )
}

// ========== Sidebar Footer ==========
export function SidebarFooter({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('flex flex-col gap-2 p-3 border-t mt-auto', className)}>
            {children}
        </div>
    )
}

// ========== Sidebar Rail (Collapse Handle) ==========
export function SidebarRail({ className }: { className?: string }) {
    const { toggleSidebar, state } = useSidebar()

    return (
        <button
            aria-label="Toggle Sidebar"
            onClick={toggleSidebar}
            className={cn(
                'absolute -right-3 top-1/2 -translate-y-1/2 z-10',
                'flex h-6 w-6 items-center justify-center rounded-full',
                'bg-card border shadow-sm hover:bg-muted transition-colors',
                className
            )}
        >
            <PanelLeftIcon
                className={cn(
                    'h-3.5 w-3.5 text-muted-foreground transition-transform duration-200',
                    state === 'collapsed' && 'rotate-180'
                )}
            />
        </button>
    )
}

// ========== Sidebar Trigger Button ==========
export function SidebarTrigger({ className }: { className?: string }) {
    const { toggleSidebar } = useSidebar()

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', className)}
            onClick={toggleSidebar}
        >
            <PanelLeftIcon className="h-4 w-4" />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
    )
}

// ========== Sidebar Action Button (Icon-only with tooltip) ==========
interface SidebarActionButtonProps {
    icon: React.ReactNode
    label: string
    onClick: () => void
    disabled?: boolean
    className?: string
}

export function SidebarActionButton({ icon, label, onClick, disabled, className }: SidebarActionButtonProps) {
    const { state } = useSidebar()

    const button = (
        <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8 shrink-0', className)}
            onClick={onClick}
            disabled={disabled}
        >
            {icon}
            <span className="sr-only">{label}</span>
        </Button>
    )

    // Always show tooltip when collapsed, or on hover when expanded
    return (
        <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right" hidden={state === 'expanded'}>
                {label}
            </TooltipContent>
        </Tooltip>
    )
}
