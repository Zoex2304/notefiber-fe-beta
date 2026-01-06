import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_ELEMENT_COMMAND } from "lexical";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";

export function AlignmentControls() {
    const [editor] = useLexicalComposerContext();

    return (
        <div className="flex items-center gap-1">
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
                icon={AlignLeft}
                label="Align Left"
            />
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
                icon={AlignCenter}
                label="Align Center"
            />
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
                icon={AlignRight}
                label="Align Right"
            />
            <ToolbarButton
                onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")}
                icon={AlignJustify}
                label="Justify"
            />
        </div>
    );
}
