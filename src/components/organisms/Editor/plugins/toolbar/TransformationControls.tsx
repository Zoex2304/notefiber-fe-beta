import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/shadui/dropdown-menu";
import { Button } from "@/components/shadui/button";
import { CaseSensitive } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { $patchStyleText } from "@lexical/selection";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/shadui/tooltip";

export function TransformationControls() {
    const [editor] = useLexicalComposerContext();

    const applyTransform = (transform: "uppercase" | "lowercase" | "capitalize" | "none") => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $patchStyleText(selection, { "text-transform": transform });
            }
        });
    };

    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <CaseSensitive className="h-4 w-4" />
                            <span className="sr-only">Text Transform</span>
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Text Transform</p>
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => applyTransform("uppercase")}>Uppercase</DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyTransform("lowercase")}>Lowercase</DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyTransform("capitalize")}>Capitalize</DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyTransform("none")}>Normal</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
