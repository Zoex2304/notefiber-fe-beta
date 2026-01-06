import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/shadui/dropdown-menu";
import { Button } from "@/components/shadui/button";
import { ChevronDown } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { $patchStyleText, $getSelectionStyleValueForProperty } from "@lexical/selection";
import { useCallback, useState, useEffect } from "react";

// Web-safe fonts that are universally available
const WEB_SAFE_FONTS = [
    { name: "Arial", value: "Arial, sans-serif" },
    { name: "Helvetica", value: "Helvetica, Arial, sans-serif" },
    { name: "Times New Roman", value: "'Times New Roman', Times, serif" },
    { name: "Georgia", value: "Georgia, serif" },
    { name: "Verdana", value: "Verdana, Geneva, sans-serif" },
    { name: "Courier New", value: "'Courier New', Courier, monospace" },
    { name: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
    { name: "Impact", value: "Impact, Charcoal, sans-serif" },
];

// Popular Google Fonts (commonly available)
const POPULAR_FONTS = [
    { name: "Inter", value: "Inter, sans-serif" },
    { name: "Roboto", value: "Roboto, sans-serif" },
    { name: "Open Sans", value: "'Open Sans', sans-serif" },
    { name: "Lato", value: "Lato, sans-serif" },
    { name: "Montserrat", value: "Montserrat, sans-serif" },
    { name: "Poppins", value: "Poppins, sans-serif" },
    { name: "Source Code Pro", value: "'Source Code Pro', monospace" },
    { name: "Playfair Display", value: "'Playfair Display', serif" },
];

// Extended font sizes
const FONT_SIZES = [
    "8px", "9px", "10px", "11px", "12px", "14px", "16px", "18px",
    "20px", "24px", "28px", "32px", "36px", "48px", "64px", "72px"
];

// Detect available fonts using document.fonts API
function useAvailableFonts(): Array<{ name: string; value: string }> {
    const [fonts, setFonts] = useState<Array<{ name: string; value: string }>>(WEB_SAFE_FONTS);

    useEffect(() => {
        const checkFonts = async () => {
            const allFonts = [...WEB_SAFE_FONTS];

            // Check which popular fonts are available
            if (document.fonts) {
                for (const font of POPULAR_FONTS) {
                    try {
                        const isAvailable = document.fonts.check(`12px "${font.name}"`);
                        if (isAvailable) {
                            allFonts.push(font);
                        }
                    } catch {
                        // Font check failed, skip
                    }
                }
            }

            // Sort alphabetically
            allFonts.sort((a, b) => a.name.localeCompare(b.name));
            setFonts(allFonts);
        };

        // Wait for fonts to load
        if (document.fonts?.ready) {
            document.fonts.ready.then(checkFonts);
        } else {
            checkFonts();
        }
    }, []);

    return fonts;
}

export function FontControls() {
    const [editor] = useLexicalComposerContext();
    const availableFonts = useAvailableFonts();
    const [currentFont, setCurrentFont] = useState<string>("Arial, sans-serif");
    const [currentSize, setCurrentSize] = useState<string>("16px");

    // Sync current selection styles
    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const fontFamily = $getSelectionStyleValueForProperty(selection, "font-family", "Arial, sans-serif");
                    const fontSize = $getSelectionStyleValueForProperty(selection, "font-size", "16px");
                    setCurrentFont(fontFamily);
                    setCurrentSize(fontSize);
                }
            });
        });
    }, [editor]);

    const applyStyle = useCallback((styles: Record<string, string>) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $patchStyleText(selection, styles);
            }
        });
    }, [editor]);

    const handleFontFamilyChange = (value: string) => {
        setCurrentFont(value);
        applyStyle({ "font-family": value });
    };

    const handleFontSizeChange = (value: string) => {
        setCurrentSize(value);
        applyStyle({ "font-size": value });
    };

    // Get display name for current font
    const getCurrentFontName = () => {
        const font = availableFonts.find(f => f.value === currentFont);
        if (font) return font.name;
        // Extract first font name from CSS value
        const match = currentFont.match(/^['"]?([^'",]+)/);
        return match ? match[1] : "Font";
    };

    return (
        <div className="flex items-center gap-1">
            {/* Font Family Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 min-w-[100px] max-w-[140px] justify-between">
                        <span className="truncate text-xs">{getCurrentFontName()}</span>
                        <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
                    {availableFonts.map((font, index) => (
                        <DropdownMenuItem
                            key={font.value}
                            onClick={() => handleFontFamilyChange(font.value)}
                            style={{ fontFamily: font.value }}
                            className="text-sm"
                        >
                            {font.name}
                            {index === WEB_SAFE_FONTS.length - 1 && availableFonts.length > WEB_SAFE_FONTS.length && (
                                <DropdownMenuSeparator className="my-1" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Font Size Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 min-w-[60px] justify-between">
                        <span className="truncate text-xs">{currentSize}</span>
                        <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
                    {FONT_SIZES.map((size) => (
                        <DropdownMenuItem
                            key={size}
                            onClick={() => handleFontSizeChange(size)}
                            className="text-sm"
                        >
                            {size}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
