import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
    $getNodeByKey,
    $getSelection,
    $isNodeSelection,
    CLICK_COMMAND,
    COMMAND_PRIORITY_LOW,
    KEY_BACKSPACE_COMMAND,
    KEY_DELETE_COMMAND,
} from 'lexical';
import type { NodeKey } from 'lexical';
import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { FileText, Download } from 'lucide-react';

interface FileComponentProps {
    src: string;
    fileName: string;
    fileSize: string;
    fileType: string;
    nodeKey: NodeKey;
}

export default function FileComponent({
    src,
    fileName,
    fileSize,
    nodeKey,
}: FileComponentProps): React.JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
    const divRef = useRef<HTMLDivElement>(null);

    const onDelete = useCallback(
        (payload: KeyboardEvent) => {
            if (isSelected && $isNodeSelection($getSelection())) {
                const event: KeyboardEvent = payload;
                event.preventDefault();
                const node = $getNodeByKey(nodeKey);
                if (node && node.getType() === 'file') {
                    node.remove();
                }
            }
            return false;
        },
        [isSelected, nodeKey],
    );

    useEffect(() => {
        return mergeRegister(
            editor.registerCommand(
                CLICK_COMMAND,
                (payload: MouseEvent) => {
                    const event = payload;
                    if (event.target === divRef.current || divRef.current?.contains(event.target as Node)) {
                        if (event.shiftKey) {
                            setSelected(!isSelected);
                        } else {
                            clearSelection();
                            setSelected(true);
                        }
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
            editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
        );
    }, [clearSelection, editor, isSelected, nodeKey, onDelete, setSelected]);

    return (
        <div
            ref={divRef}
            className={cn(
                "inline-flex items-center gap-2 p-2 rounded-md border border-gray-200 bg-gray-50 my-2 cursor-pointer transition-colors hover:bg-gray-100 select-none max-w-sm",
                isSelected && "ring-2 ring-blue-500 ring-offset-1 border-blue-500"
            )}
        >
            <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-gray-900 truncate" title={fileName}>
                    {fileName}
                </span>
                <span className="text-xs text-gray-500">
                    {fileSize}
                </span>
            </div>
            <a
                href={src}
                download={fileName}
                className="p-1 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noreferrer"
                title="Download"
            >
                <Download className="h-4 w-4" />
            </a>
        </div>
    );
}
