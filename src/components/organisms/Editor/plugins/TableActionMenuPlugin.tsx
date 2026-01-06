import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $deleteTableColumn__EXPERIMENTAL,
    $deleteTableRow__EXPERIMENTAL,
    $getTableNodeFromLexicalNodeOrThrow,
    $insertTableColumn__EXPERIMENTAL,
    $insertTableRow__EXPERIMENTAL,
    $isTableCellNode,
} from "@lexical/table";
import {
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_LOW,
    SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/shadui/button";
import { Trash2, ArrowDown, ArrowRight, X } from "lucide-react";

function TableActionMenu({
    onClose,
    cellElement,
    anchorElem,
}: {
    onClose: () => void;
    tableCellNode: any;
    setIsMenuOpen: (isOpen: boolean) => void;
    cellElement: HTMLElement;
    anchorElem: HTMLElement;
}) {
    const [editor] = useLexicalComposerContext();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Reposition logic could go here, but for now we'll just float it near the cell
    useEffect(() => {
        const dropdown = dropdownRef.current;
        if (!dropdown || !cellElement) return;

        const rect = cellElement.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + window.scrollY + 5}px`;
        dropdown.style.left = `${rect.left + window.scrollX}px`;
    }, [cellElement]);

    const deleteTable = useCallback(() => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const tableNode = $getTableNodeFromLexicalNodeOrThrow(selection.anchor.getNode());
                tableNode.remove();
            }
            onClose();
        });
    }, [editor, onClose]);

    const insertRowBelow = useCallback(() => {
        editor.update(() => {
            $insertTableRow__EXPERIMENTAL(false);
            onClose();
        });
    }, [editor, onClose]);

    const insertColRight = useCallback(() => {
        editor.update(() => {
            $insertTableColumn__EXPERIMENTAL(false);
            onClose();
        });
    }, [editor, onClose]);

    const deleteRow = useCallback(() => {
        editor.update(() => {
            $deleteTableRow__EXPERIMENTAL();
            onClose();
        });
    }, [editor, onClose]);

    const deleteCol = useCallback(() => {
        editor.update(() => {
            $deleteTableColumn__EXPERIMENTAL();
            onClose();
        });
    }, [editor, onClose]);

    return createPortal(
        <div
            ref={dropdownRef}
            className="absolute z-50 bg-white shadow-lg border border-gray-200 rounded-md p-1 flex items-center gap-1"
            style={{ width: "max-content" }}
        >
            <Button variant="ghost" size="sm" onClick={insertRowBelow} title="Add Row Below">
                <ArrowDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={insertColRight} title="Add Col Right">
                <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="w-[1px] h-4 bg-gray-200 mx-1" />
            <Button variant="ghost" size="sm" onClick={deleteRow} title="Delete Row" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <X className="h-4 w-4" /> Row
            </Button>
            <Button variant="ghost" size="sm" onClick={deleteCol} title="Delete Column" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <X className="h-4 w-4" /> Col
            </Button>
            <div className="w-[1px] h-4 bg-gray-200 mx-1" />
            <Button variant="ghost" size="sm" onClick={deleteTable} title="Delete Table" className="text-red-600 hover:text-red-800 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" /> Delete Table
            </Button>
        </div>,

        anchorElem
    );
}

export default function TableActionMenuPlugin({
    anchorElem = document.body,
}: {
    anchorElem?: HTMLElement;
}): React.ReactElement | null {
    const [editor] = useLexicalComposerContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeCellElement, setActiveCellElement] = useState<HTMLElement | null>(null);
    const [activeCellNode, setActiveCellNode] = useState<any | null>(null);

    const moveMenu = useCallback(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const node = selection.anchor.getNode();
                if ($isTableCellNode(node)) {
                    setActiveCellNode(node);
                    const el = editor.getElementByKey(node.getKey());
                    setActiveCellElement(el);
                    setIsMenuOpen(true);
                    return;
                }
                const parent = node.getParent();
                if (parent && $isTableCellNode(parent)) {
                    setActiveCellNode(parent);
                    const el = editor.getElementByKey(parent.getKey());
                    setActiveCellElement(el);
                    setIsMenuOpen(true);
                    return;
                }
            }
            // Close if not in table
            setIsMenuOpen(false);
        });
    }, [editor]);

    useEffect(() => {
        return editor.registerUpdateListener(() => {
            moveMenu();
        });
    }, [editor, moveMenu]);

    useEffect(() => {
        return editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            () => {
                moveMenu();
                return false;
            },
            COMMAND_PRIORITY_LOW
        );
    }, [editor, moveMenu]);

    if (!isMenuOpen || !activeCellElement) return null;

    return (
        <TableActionMenu
            setIsMenuOpen={setIsMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            tableCellNode={activeCellNode}
            cellElement={activeCellElement}
            anchorElem={anchorElem}
        />
    );
}
