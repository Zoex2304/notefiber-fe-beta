import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/shadui/dropdown-menu";
import { Button } from "@/components/shadui/button";
import { ChevronDown, Check, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Type, Quote, Code, List, ListOrdered } from "lucide-react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, $createParagraphNode } from "lexical";
import { $createHeadingNode, $createQuoteNode, type HeadingTagType } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { useCallback, useEffect, useState } from "react";
import { $createCodeNode } from "@lexical/code";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, $isListNode, ListNode } from "@lexical/list";
import { $getNearestNodeOfType } from "@lexical/utils";
import type { LucideIcon } from "lucide-react";

interface BlockType {
    label: string;
    icon: LucideIcon;
    type: "block" | "list";
}

const BLOCK_TYPES: Record<string, BlockType> = {
    paragraph: { label: "Normal", icon: Type, type: "block" },
    h1: { label: "Heading 1", icon: Heading1, type: "block" },
    h2: { label: "Heading 2", icon: Heading2, type: "block" },
    h3: { label: "Heading 3", icon: Heading3, type: "block" },
    h4: { label: "Heading 4", icon: Heading4, type: "block" },
    h5: { label: "Heading 5", icon: Heading5, type: "block" },
    h6: { label: "Heading 6", icon: Heading6, type: "block" },
    quote: { label: "Quote", icon: Quote, type: "block" },
    code: { label: "Code Block", icon: Code, type: "block" },
    bullet: { label: "Bullet List", icon: List, type: "list" },
    number: { label: "Numbered List", icon: ListOrdered, type: "list" },
};

export function BlockTypeDropdown() {
    const [editor] = useLexicalComposerContext();
    const [blockType, setBlockType] = useState<string>("paragraph");

    const updateBlockType = useCallback(() => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const anchorNode = selection.anchor.getNode();
                const element = anchorNode.getKey() === "root"
                    ? anchorNode
                    : anchorNode.getTopLevelElementOrThrow();
                const elementType = element.getType();

                // Check for list type
                if ($isListNode(element)) {
                    const listType = element.getListType();
                    setBlockType(listType === "number" ? "number" : "bullet");
                    return;
                }

                // Check for list parent
                const listNode = $getNearestNodeOfType(anchorNode, ListNode);
                if (listNode) {
                    const listType = listNode.getListType();
                    setBlockType(listType === "number" ? "number" : "bullet");
                    return;
                }

                // For headings, check the tag
                if (elementType === 'heading') {
                    // @ts-expect-error LexicalEditor type doesn't recognize dynamic command names
                    const tag = element.getTag();
                    setBlockType(tag);
                } else if (elementType in BLOCK_TYPES) {
                    setBlockType(elementType);
                } else {
                    setBlockType("paragraph");
                }
            }
        });
    }, [editor]);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateBlockType();
            });
        });
    }, [editor, updateBlockType]);

    const formatBlock = (type: string) => {
        const blockInfo = BLOCK_TYPES[type];
        if (!blockInfo) return;

        if (blockInfo.type === "list") {
            // Handle list types
            if (type === "bullet") {
                editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
            } else if (type === "number") {
                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
            }
        } else if (type === "paragraph") {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createParagraphNode());
                }
            });
        } else if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(type)) {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createHeadingNode(type as HeadingTagType));
                }
            });
        } else if (type === "quote") {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createQuoteNode());
                }
            });
        } else if (type === "code") {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createCodeNode());
                }
            });
        }
    };

    const currentBlock = BLOCK_TYPES[blockType] || BLOCK_TYPES.paragraph;
    const CurrentIcon = currentBlock.icon;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1 min-w-[120px] justify-between">
                    <div className="flex items-center gap-1.5">
                        <CurrentIcon className="h-4 w-4" />
                        <span className="truncate text-xs">{currentBlock.label}</span>
                    </div>
                    <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[160px]">
                {/* Text blocks */}
                {["paragraph", "h1", "h2", "h3", "h4", "h5", "h6"].map((type) => {
                    const block = BLOCK_TYPES[type];
                    const Icon = block.icon;
                    return (
                        <DropdownMenuItem
                            key={type}
                            onClick={() => formatBlock(type)}
                            className="justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {block.label}
                            </div>
                            {blockType === type && <Check className="h-3 w-3" />}
                        </DropdownMenuItem>
                    );
                })}

                <DropdownMenuSeparator />

                {/* Lists */}
                {["bullet", "number"].map((type) => {
                    const block = BLOCK_TYPES[type];
                    const Icon = block.icon;
                    return (
                        <DropdownMenuItem
                            key={type}
                            onClick={() => formatBlock(type)}
                            className="justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {block.label}
                            </div>
                            {blockType === type && <Check className="h-3 w-3" />}
                        </DropdownMenuItem>
                    );
                })}

                <DropdownMenuSeparator />

                {/* Special blocks */}
                {["quote", "code"].map((type) => {
                    const block = BLOCK_TYPES[type];
                    const Icon = block.icon;
                    return (
                        <DropdownMenuItem
                            key={type}
                            onClick={() => formatBlock(type)}
                            className="justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {block.label}
                            </div>
                            {blockType === type && <Check className="h-3 w-3" />}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
