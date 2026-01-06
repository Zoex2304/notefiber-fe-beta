import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils';
import {
    $createParagraphNode,
    $createRangeSelection,
    $getSelection,
    $insertNodes,
    $isNodeSelection,
    $isRootOrShadowRoot,
    $setSelection,
    COMMAND_PRIORITY_EDITOR,
    COMMAND_PRIORITY_HIGH,
    COMMAND_PRIORITY_LOW,
    DRAGOVER_COMMAND,
    DRAGSTART_COMMAND,
    DROP_COMMAND,
    PASTE_COMMAND,
} from 'lexical';
import type { LexicalEditor, LexicalNode } from 'lexical';
import { useEffect } from 'react';
import * as React from 'react';

import { $createImageNode, $isImageNode, ImageNode, INSERT_IMAGE_COMMAND } from '../nodes/ImageNode';
import type { ImagePayload } from '../nodes/ImageNode';

export default function ImagePlugin({
    captionsEnabled,
}: {
    captionsEnabled?: boolean;
}): React.ReactElement | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([ImageNode])) {
            throw new Error('ImagePlugin: ImageNode not registered on editor');
        }

        return mergeRegister(
            editor.registerCommand<ImagePayload>(
                INSERT_IMAGE_COMMAND,
                (payload) => {
                    const imageNode = $createImageNode(payload);
                    $insertNodes([imageNode]);
                    if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
                        $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
                    }
                    return true;
                },
                COMMAND_PRIORITY_EDITOR,
            ),
            editor.registerCommand<DragEvent>(
                DRAGSTART_COMMAND,
                (event) => {
                    return onDragStart(event);
                },
                COMMAND_PRIORITY_HIGH,
            ),
            editor.registerCommand<DragEvent>(
                DRAGOVER_COMMAND,
                (event) => {
                    return onDragOver(event);
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand<DragEvent>(
                DROP_COMMAND,
                (event) => {
                    return onDrop(event, editor);
                },
                COMMAND_PRIORITY_HIGH,
            ),
            editor.registerCommand(
                PASTE_COMMAND,
                (event) => {
                    // Start of fix for ClipboardEvent type mismatch
                    const clipboardEvent = event as ClipboardEvent;
                    return onPaste(clipboardEvent, editor);
                },
                COMMAND_PRIORITY_HIGH,
            )
        );
    }, [captionsEnabled, editor]);

    return null;
}

const TRANSPARENT_IMAGE =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const img = document.createElement('img');
img.src = TRANSPARENT_IMAGE;

function onDragStart(event: DragEvent): boolean {
    const node = getImageNodeInSelection();
    if (node) {
        const { dataTransfer } = event;
        if (!dataTransfer) {
            return false;
        }
        dataTransfer.setData('text/plain', '_');
        dataTransfer.setDragImage(img, 0, 0);
        dataTransfer.setData(
            'application/x-lexical-drag',
            JSON.stringify({
                data: {
                    altText: node.__altText,
                    height: node.__height,
                    key: node.getKey(),
                    maxWidth: node.__maxWidth,
                    src: node.__src,
                    width: node.__width,
                },
                type: 'image',
            }),
        );

        return true;
    }
    return false;
}

function onDragOver(event: DragEvent): boolean {
    const node = getImageNodeInSelection();
    if (node) {
        return true;
    }
    if (!canDropImage(event)) {
        return false;
    }
    return true;
}

function onDrop(event: DragEvent, editor: LexicalEditor): boolean {
    const node = getImageNodeInSelection();
    if (node) {
        return true;
    }
    const data = getDragImageData(event);
    if (!data) {
        return false;
    }
    event.preventDefault();
    if (canDropImage(event)) {
        const range = getDragSelection(event);
        if (node) {
            (node as LexicalNode).remove();
        }
        const rangeSelection = $createRangeSelection();
        if (rangeSelection !== null && range !== null && range !== undefined) {
            rangeSelection.applyDOMRange(range);
            $setSelection(rangeSelection);
            editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);
        }
    }
    return true;
}

function onPaste(event: ClipboardEvent, editor: LexicalEditor): boolean {
    const { clipboardData } = event;
    if (!clipboardData) return false;

    // Handle files
    if (clipboardData.files.length > 0) {
        const file = clipboardData.files[0];
        // Only handle images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                        altText: file.name,
                        src: reader.result,
                    });
                }
            };
            reader.readAsDataURL(file);
            event.preventDefault(); // Stop default paste
            return true;
        }
    }

    return false;
}


function getImageNodeInSelection(): ImageNode | null {
    const selection = $getSelection();
    if (!$isNodeSelection(selection)) {
        return null;
    }
    const nodes = selection.getNodes();
    const node = nodes[0];
    return $isImageNode(node) ? node : null;
}

function getDragImageData(event: DragEvent): null | ImagePayload {
    const dragData = event.dataTransfer?.getData('application/x-lexical-drag');
    if (!dragData) {
        return null;
    }
    const { type, data } = JSON.parse(dragData);
    if (type !== 'image') {
        return null;
    }
    return data;
}

declare global {
    interface DragEvent {
        rangeOffset?: number;
        rangeParent?: Node;
    }
}

function canDropImage(event: DragEvent): boolean {
    const target = event.target;
    return !!(
        target &&
        target instanceof HTMLElement &&
        !target.closest('code, span.editor-image') &&
        target.parentElement &&
        target.parentElement.closest('div.ContentEditable__root')
    );
}

function getDragSelection(event: DragEvent): Range | null | undefined {
    let range;
    const target = event.target as null | Element | Document;
    const targetWindow =
        target == null
            ? null
            : target.nodeType === 9
                ? (target as Document).defaultView
                : (target as Element).ownerDocument.defaultView;
    const domSelection = getDOMSelection(targetWindow);
    if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(event.clientX, event.clientY);
    } else if (event.rangeParent && domSelection !== null) {
        domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
        range = domSelection.getRangeAt(0);
    } else {
        throw Error(`Cannot get the selection from drag event`);
    }

    return range;
}

function getDOMSelection(targetWindow: Window | null): Selection | null {
    return targetWindow ? targetWindow.getSelection() : null;
}
