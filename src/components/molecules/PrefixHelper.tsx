import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/shadui/popover";
import { Button } from "@/components/shadui/button";
import { Command } from "lucide-react";
import { useNuances } from "@/hooks/chat/useNuances";

interface PrefixHelperProps {
    onSelect: (prefix: string) => void;
}

export function PrefixHelper({ onSelect }: PrefixHelperProps) {
    const { nuances } = useNuances();

    const commands = [
        { cmd: "/bypass", desc: "No RAG (Direct)" },
        ...nuances.map(n => ({
            cmd: `/${n.key}`,
            desc: n.description
        }))
    ];

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Command className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 max-h-[300px] overflow-y-auto" align="start">
                <div className="p-2">
                    <h4 className="mb-2 px-2 text-xs font-medium text-muted-foreground">Available Commands</h4>
                    <div className="grid gap-1">
                        {commands.map((p) => (
                            <button
                                key={p.cmd}
                                onClick={() => onSelect(p.cmd + " ")}
                                className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground text-left"
                            >
                                <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-primary shrink-0">{p.cmd}</code>
                                <span className="text-xs text-muted-foreground ml-2 truncate">{p.desc}</span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-2 border-t pt-2 px-2 pb-1">
                        <p className="text-xs text-muted-foreground">
                            Type <code className="text-xs">/</code> for commands, <code className="text-xs">@</code> for notes.
                        </p>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
