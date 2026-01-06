import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { $patchStyleText } from "@lexical/selection";
import { RemoveFormatting } from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";
import { useCallback } from "react";

export function ClearFormatButton() {
    const [editor] = useLexicalComposerContext();

    const clearFormatting = useCallback(() => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                // Clear all inline styles
                $patchStyleText(selection, {
                    "font-family": "",
                    "font-size": "",
                    "font-weight": "",
                    "font-style": "",
                    "text-decoration": "",
                    "color": "",
                    "background-color": "",
                    "vertical-align": "",
                });

                // Clear text format flags
                const selectedNodes = selection.getNodes();
                selectedNodes.forEach(() => {
                    // Remove bold, italic, etc.
                    if (selection.hasFormat("bold")) {
                        selection.toggleFormat("bold");
                    }
                    if (selection.hasFormat("italic")) {
                        selection.toggleFormat("italic");
                    }
                    if (selection.hasFormat("underline")) {
                        selection.toggleFormat("underline");
                    }
                    if (selection.hasFormat("strikethrough")) {
                        selection.toggleFormat("strikethrough");
                    }
                    if (selection.hasFormat("subscript")) {
                        selection.toggleFormat("subscript");
                    }
                    if (selection.hasFormat("superscript")) {
                        selection.toggleFormat("superscript");
                    }
                    if (selection.hasFormat("code")) {
                        selection.toggleFormat("code");
                    }
                });
            }
        });
    }, [editor]);

    return (
        <ToolbarButton
            onClick={clearFormatting}
            icon={RemoveFormatting}
            label="Clear Formatting"
        />
    );
}
