import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { UNDO_COMMAND, REDO_COMMAND } from "lexical";
import { Undo, Redo } from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";

export function HistoryControls() {
    const [editor] = useLexicalComposerContext();

    return (
        <div className="flex items-center gap-1">
            <ToolbarButton
                onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                icon={Undo}
                label="Undo"
            />
            <ToolbarButton
                onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                icon={Redo}
                label="Redo"
            />
        </div>
    );
}
