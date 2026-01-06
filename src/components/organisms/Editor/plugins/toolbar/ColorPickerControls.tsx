import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/shadui/popover";
import { Button } from "@/components/shadui/button";
import { Paintbrush, Highlighter, Check } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { $patchStyleText, $getSelectionStyleValueForProperty } from "@lexical/selection";
import { useCallback, useState, useEffect } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/shadui/tooltip";

// Color palette - organized by hue
const COLOR_PALETTE = [
    // Grayscale
    { name: "Black", value: "#000000" },
    { name: "Dark Gray", value: "#4B5563" },
    { name: "Gray", value: "#9CA3AF" },
    { name: "Light Gray", value: "#D1D5DB" },
    { name: "White", value: "#FFFFFF" },
    // Reds
    { name: "Red", value: "#EF4444" },
    { name: "Rose", value: "#F43F5E" },
    { name: "Pink", value: "#EC4899" },
    // Oranges & Yellows
    { name: "Orange", value: "#F97316" },
    { name: "Amber", value: "#F59E0B" },
    { name: "Yellow", value: "#EAB308" },
    // Greens
    { name: "Lime", value: "#84CC16" },
    { name: "Green", value: "#22C55E" },
    { name: "Emerald", value: "#10B981" },
    { name: "Teal", value: "#14B8A6" },
    // Blues
    { name: "Cyan", value: "#06B6D4" },
    { name: "Sky", value: "#0EA5E9" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Indigo", value: "#6366F1" },
    // Purples
    { name: "Violet", value: "#8B5CF6" },
    { name: "Purple", value: "#A855F7" },
    { name: "Fuchsia", value: "#D946EF" },
];

// Highlight colors (lighter versions for background)
const HIGHLIGHT_PALETTE = [
    { name: "None", value: "transparent" },
    { name: "Yellow", value: "#FEF08A" },
    { name: "Green", value: "#BBF7D0" },
    { name: "Blue", value: "#BFDBFE" },
    { name: "Pink", value: "#FBCFE8" },
    { name: "Purple", value: "#DDD6FE" },
    { name: "Orange", value: "#FED7AA" },
    { name: "Red", value: "#FECACA" },
    { name: "Cyan", value: "#A5F3FC" },
    { name: "Gray", value: "#E5E7EB" },
];

interface ColorGridProps {
    colors: Array<{ name: string; value: string }>;
    selectedColor: string;
    onSelect: (color: string) => void;
}

function ColorGrid({ colors, selectedColor, onSelect }: ColorGridProps) {
    return (
        <div className="grid grid-cols-5 gap-1 p-2">
            {colors.map((color) => (
                <Tooltip key={color.value}>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => onSelect(color.value)}
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{
                                backgroundColor: color.value === "transparent" ? "white" : color.value,
                                backgroundImage: color.value === "transparent"
                                    ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)"
                                    : undefined,
                                backgroundSize: "6px 6px",
                                backgroundPosition: "0 0, 3px 3px",
                            }}
                        >
                            {selectedColor === color.value && (
                                <Check
                                    className="h-3 w-3"
                                    style={{
                                        color: color.value === "#FFFFFF" || color.value === "transparent" || color.value.startsWith("#F")
                                            ? "#000"
                                            : "#FFF"
                                    }}
                                />
                            )}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                        {color.name}
                    </TooltipContent>
                </Tooltip>
            ))}
        </div>
    );
}

export function ColorPickerControls() {
    const [editor] = useLexicalComposerContext();
    const [textColor, setTextColor] = useState<string>("#000000");
    const [bgColor, setBgColor] = useState<string>("transparent");
    const [textOpen, setTextOpen] = useState(false);
    const [bgOpen, setBgOpen] = useState(false);

    // Sync with current selection
    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const color = $getSelectionStyleValueForProperty(selection, "color", "#000000");
                    const background = $getSelectionStyleValueForProperty(selection, "background-color", "transparent");
                    setTextColor(color);
                    setBgColor(background || "transparent");
                }
            });
        });
    }, [editor]);

    const applyTextColor = useCallback((color: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $patchStyleText(selection, { color });
            }
        });
        setTextColor(color);
        setTextOpen(false);
    }, [editor]);

    const applyBgColor = useCallback((color: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $patchStyleText(selection, { "background-color": color === "transparent" ? "" : color });
            }
        });
        setBgColor(color);
        setBgOpen(false);
    }, [editor]);

    return (
        <div className="flex items-center gap-1">
            {/* Text Color */}
            <Popover open={textOpen} onOpenChange={setTextOpen}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 relative"
                            >
                                <Paintbrush className="h-4 w-4" />
                                <div
                                    className="absolute bottom-1 left-1 right-1 h-1 rounded-sm"
                                    style={{ backgroundColor: textColor }}
                                />
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Text Color</TooltipContent>
                </Tooltip>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-2 border-b text-xs font-medium text-gray-600">
                        Text Color
                    </div>
                    <ColorGrid
                        colors={COLOR_PALETTE}
                        selectedColor={textColor}
                        onSelect={applyTextColor}
                    />
                </PopoverContent>
            </Popover>

            {/* Background/Highlight Color */}
            <Popover open={bgOpen} onOpenChange={setBgOpen}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 relative"
                            >
                                <Highlighter className="h-4 w-4" />
                                <div
                                    className="absolute bottom-1 left-1 right-1 h-1 rounded-sm border border-gray-300"
                                    style={{
                                        backgroundColor: bgColor === "transparent" ? "white" : bgColor,
                                    }}
                                />
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Highlight Color</TooltipContent>
                </Tooltip>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-2 border-b text-xs font-medium text-gray-600">
                        Highlight Color
                    </div>
                    <ColorGrid
                        colors={HIGHLIGHT_PALETTE}
                        selectedColor={bgColor}
                        onSelect={applyBgColor}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
