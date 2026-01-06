import type { NodeKey } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
    $getNodeByKey,
    $getSelection,
    $isNodeSelection,
    CLICK_COMMAND,
    COMMAND_PRIORITY_LOW,
    DRAGSTART_COMMAND,
    KEY_BACKSPACE_COMMAND,
    KEY_DELETE_COMMAND,
    SELECTION_CHANGE_COMMAND,
} from 'lexical';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { $isImageNode } from './ImageNode';
import ImageResizer from '../ui/ImageResizer';

interface ImageComponentProps {
    altText: string;
    height: 'inherit' | number;
    maxWidth: number;
    nodeKey: NodeKey;
    resizable: boolean;
    src: string;
    width: 'inherit' | number;
}

export default function ImageComponent({
    src,
    altText,
    nodeKey,
    width: propWidth,
    height: propHeight,
    resizable,
}: ImageComponentProps): React.JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
    const [isResizing, setIsResizing] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const [width, setWidth] = useState<number | 'inherit'>(propWidth);
    const [height, setHeight] = useState<number | 'inherit'>(propHeight);

    const onDelete = useCallback(
        (payload: KeyboardEvent) => {
            if (isSelected && $isNodeSelection($getSelection())) {
                const event: KeyboardEvent = payload;
                event.preventDefault();
                const node = $getNodeByKey(nodeKey);
                if ($isImageNode(node)) {
                    node.remove();
                }
            }
            return false;
        },
        [isSelected, nodeKey],
    );

    useEffect(() => {
        const unregister = mergeRegister(
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    // Clear selection if clicking outside
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                CLICK_COMMAND,
                (payload: MouseEvent) => {
                    const event = payload;
                    if (isResizing) {
                        return true;
                    }
                    if (event.target === imageRef.current) {
                        if (event.shiftKey) {
                            setSelected(!isSelected);
                        } else {
                            clearSelection(); // Clear existing
                            setSelected(true); // Select this
                        }
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                DRAGSTART_COMMAND,
                (event) => {
                    if (event.target === imageRef.current) {
                        // TODO: Implement drag
                        event.preventDefault();
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
            editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
        );
        return () => {
            unregister();
        };
    }, [clearSelection, editor, isResizing, isSelected, nodeKey, onDelete, setSelected]);

    // Handle Resize
    const onResizeEnd = (nextWidth: 'inherit' | number, nextHeight: 'inherit' | number) => {
        // Adjust values as needed logic
        setTimeout(() => {
            setIsResizing(false);
        }, 200);

        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isImageNode(node)) {
                node.setWidthAndHeight(nextWidth, nextHeight);
            }
        });
        setWidth(nextWidth);
        setHeight(nextHeight);
    };

    const onResizeStart = () => {
        setIsResizing(true);
    };

    return (
        <React.Suspense fallback={null}>
            <>
                <div draggable={isSelected} className="inline-block relative select-none">
                    <img
                        className={cn("max-w-full h-auto", isSelected ? "focused" : "")}
                        src={src}
                        alt={altText}
                        ref={imageRef}
                        style={{
                            width: typeof width === 'number' ? width : undefined,
                            height: typeof height === 'number' ? height : undefined,
                            maxWidth: '100%',
                        }}
                        draggable="false"
                    />
                    {resizable && isSelected && (
                        <ImageResizer
                            showCaption={false}
                            setShowCaption={() => { }}
                            editor={editor}
                            buttonRef={{ current: null }}
                            imageRef={imageRef}
                            maxWidth={1000} // Hardcoded or calculated
                            onResizeStart={onResizeStart}
                            onResizeEnd={onResizeEnd}
                            captionsEnabled={false}
                        />
                    )}
                </div>
            </>
        </React.Suspense>
    );
}
