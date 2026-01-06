import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_TEXT_COMMAND, $getSelection, $isRangeSelection } from "lexical";
import { Bold, Italic, Underline, Strikethrough, Subscript, Superscript, Code } from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";
import { useEffect, useState } from "react";

export function TextFormatControls() {
    const [editor] = useLexicalComposerContext();
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isSubscript, setIsSubscript] = useState(false);
    const [isSuperscript, setIsSuperscript] = useState(false);
    const [isCode, setIsCode] = useState(false);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    setIsBold(selection.hasFormat("bold"));
                    setIsItalic(selection.hasFormat("italic"));
                    setIsUnderline(selection.hasFormat("underline"));
                    setIsStrikethrough(selection.hasFormat("strikethrough"));
                    setIsSubscript(selection.hasFormat("subscript"));
                    setIsSuperscript(selection.hasFormat("superscript"));
                    setIsCode(selection.hasFormat("code"));
                }
            });
        });
    }, [editor]);

    return (
        <div className="flex items-center gap-1">
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
                icon={Bold}
                label="Bold"
                isActive={isBold}
            />
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
                icon={Italic}
                label="Italic"
                isActive={isItalic}
            />
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
                icon={Underline}
                label="Underline"
                isActive={isUnderline}
            />
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
                icon={Strikethrough}
                label="Strikethrough"
                isActive={isStrikethrough}
            />
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")}
                icon={Subscript}
                label="Subscript"
                isActive={isSubscript}
            />
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")}
                icon={Superscript}
                label="Superscript"
                isActive={isSuperscript}
            />
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
                icon={Code}
                label="Inline Code"
                isActive={isCode}
            />
        </div>
    );
}
