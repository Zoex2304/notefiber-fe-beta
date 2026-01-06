import { $isAutoLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_CRITICAL,
    COMMAND_PRIORITY_HIGH,
    COMMAND_PRIORITY_LOW,
    KEY_ESCAPE_COMMAND,
    SELECTION_CHANGE_COMMAND,
} from "lexical";
import type {
    LexicalEditor,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch } from "react";
import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/shadui/button";
import { Input } from "@/components/shadui/input";
import { Edit2, Trash2, X, Check } from "lucide-react";

function FloatingLinkEditor({
    editor,
    isLink,
    setIsLink,
    anchorElem,
}: {
    editor: LexicalEditor;
    isLink: boolean;
    setIsLink: Dispatch<React.SetStateAction<boolean>>;
    anchorElem: HTMLElement;
}) {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [linkUrl, setLinkUrl] = useState("");
    const [isEditMode, setEditMode] = useState(false);

    const updateLinkEditor = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const node = selection.anchor.getNode();
            const parent = node.getParent();
            if ($isLinkNode(parent) || $isAutoLinkNode(parent)) {
                setLinkUrl(parent.getURL());
            } else if ($isLinkNode(node) || $isAutoLinkNode(node)) {
                setLinkUrl(node.getURL());
            } else {
                setLinkUrl("");
            }
        }
        const editorElem = editorRef.current;
        const nativeSelection = window.getSelection();
        const activeElement = document.activeElement;

        if (editorElem === null) {
            return;
        }

        const rootElement = editor.getRootElement();

        if (
            selection !== null &&
            nativeSelection !== null &&
            rootElement !== null &&
            rootElement.contains(nativeSelection.anchorNode) &&
            editor.isEditable()
        ) {
            const domRange = nativeSelection.getRangeAt(0);
            let rect;
            if (nativeSelection.anchorNode === rootElement) {
                let inner = rootElement;
                while (inner.firstElementChild != null) {
                    inner = inner.firstElementChild as HTMLElement;
                }
                rect = inner.getBoundingClientRect();
            } else {
                rect = domRange.getBoundingClientRect();
            }

            if (!isEditMode) {
                // Position calculation (center bottom)
                editorElem.style.opacity = "1";
                editorElem.style.transform = "translate(-50%, 10px)";
                editorElem.style.left = `${rect.left + rect.width / 2}px`;
                editorElem.style.top = `${rect.bottom + window.scrollY}px`;
            } else {
                // While editing, keep it stable or maybe centered? 
                // For now, keep dynamic
                editorElem.style.opacity = "1";
                editorElem.style.transform = "translate(-50%, 10px)";
                editorElem.style.left = `${rect.left + rect.width / 2}px`;
                editorElem.style.top = `${rect.bottom + window.scrollY}px`;
            }

        } else if (!activeElement || !editorElem.contains(activeElement as Node)) {
            if (isLink) {
                // keep it visible if we are interacting with it? 
                // No, rely on isLink state passing
            }
        }
    }, [editor, isEditMode, isLink]);

    useEffect(() => {
        const scrollerElem = anchorElem.parentElement;

        const update = () => {
            editor.getEditorState().read(() => {
                updateLinkEditor();
            });
        };

        window.addEventListener("resize", update);
        if (scrollerElem) {
            scrollerElem.addEventListener("scroll", update);
        }

        return () => {
            window.removeEventListener("resize", update);
            if (scrollerElem) {
                scrollerElem.removeEventListener("scroll", update);
            }
        };
    }, [anchorElem.parentElement, editor, updateLinkEditor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateLinkEditor();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    updateLinkEditor();
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                KEY_ESCAPE_COMMAND,
                () => {
                    if (isLink) {
                        setIsLink(false);
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_HIGH
            )
        );
    }, [editor, updateLinkEditor, setIsLink, isLink]);

    useEffect(() => {
        editor.getEditorState().read(() => {
            updateLinkEditor();
        });
    }, [editor, updateLinkEditor]);

    const handleSave = () => {
        if (linkUrl.trim() !== "") {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
        }
        setEditMode(false);
    };

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleRemove = () => {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        setIsLink(false);
    };

    useEffect(() => {
        if (isEditMode && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditMode]);

    if (!isLink) return null;

    return (
        <div
            ref={editorRef}
            className="absolute z-50 bg-white shadow-xl border border-gray-200 rounded-lg p-1 flex items-center gap-1 transition-opacity duration-200 pointer-events-auto"
            style={{ opacity: 0, top: 0, left: 0, willChange: "transform" }}
        >
            {isEditMode ? (
                <>
                    <Input
                        ref={inputRef}
                        className="h-8 w-64 text-sm"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://..."
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSave();
                            } else if (e.key === "Escape") {
                                e.preventDefault();
                                setEditMode(false);
                            }
                        }}
                    />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-50" onClick={handleSave}>
                        <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50" onClick={() => setEditMode(false)}>
                        <X className="h-4 w-4 text-red-600" />
                    </Button>
                </>
            ) : (
                <>
                    <a
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline max-w-[200px] truncate px-2 block font-medium"
                    >
                        {linkUrl}
                    </a>
                    <div className="h-4 w-[1px] bg-gray-200 mx-1" />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100" onClick={handleEdit}>
                        <Edit2 className="h-3 w-3 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50" onClick={handleRemove}>
                        <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                </>
            )}
        </div>
    );
}

export default function FloatingLinkEditorPlugin({
    anchorElem = document.body,
}: {
    anchorElem?: HTMLElement;
}): React.JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    const [activeEditor, setActiveEditor] = useState(editor);
    const [isLink, setIsLink] = useState(false);

    useEffect(() => {
        function updateToolbar() {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const node = selection.anchor.getNode();
                const linkParent = $findMatchingParent(
                    node,
                    ($node) => $isLinkNode($node) || $isAutoLinkNode($node)
                );

                if (linkParent != null) {
                    setIsLink(true);
                } else {
                    setIsLink(false);
                }
            } else {
                setIsLink(false);
            }
        }

        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateToolbar();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_payload, newEditor) => {
                    updateToolbar();
                    setActiveEditor(newEditor);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL
            )
        );
    }, [editor]);

    return createPortal(
        <FloatingLinkEditor
            editor={activeEditor}
            isLink={isLink}
            anchorElem={anchorElem}
            setIsLink={setIsLink}
        />,
        anchorElem
    );
}
