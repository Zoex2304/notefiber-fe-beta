import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import {
    COMMAND_PRIORITY_HIGH,
    DROP_COMMAND,
    PASTE_COMMAND,
} from 'lexical';
import { useEffect } from 'react';
import { $createFileNode } from '../nodes/FileNode';

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function FilePlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([])) {
            // Check for FileNode registration if strictly required, but for now skip explicit check
        }

        return editor.registerCommand(
            DROP_COMMAND,
            (event: DragEvent) => {
                const dataTransfer = event.dataTransfer;
                if (!dataTransfer || !dataTransfer.files || dataTransfer.files.length === 0) {
                    return false;
                }

                const files = Array.from(dataTransfer.files);
                // Filter only non-image files, or allow all? Typically ImagePlugin handles images.
                // We should let ImagePlugin handle images if possible.
                // But ImagePlugin implementation must consume the event first or check types.
                // Assuming ImagePlugin is HIGH priority too, conflict might occur.
                // Let's filter out images here to avoid duplication.

                const nonImageFiles = files.filter(f => !f.type.startsWith('image/'));
                if (nonImageFiles.length === 0) return false;

                event.preventDefault();

                editor.update(() => {
                    nonImageFiles.forEach((file) => {
                        const src = URL.createObjectURL(file);
                        const fileNode = $createFileNode(src, file.name, formatBytes(file.size), file.type);
                        $insertNodeToNearestRoot(fileNode);
                    });
                });

                return true;
            },
            COMMAND_PRIORITY_HIGH,
        );
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            PASTE_COMMAND,
            (event: ClipboardEvent) => {
                const dataTransfer = event.clipboardData;
                if (!dataTransfer || !dataTransfer.files || dataTransfer.files.length === 0) {
                    return false;
                }

                const files = Array.from(dataTransfer.files);
                const nonImageFiles = files.filter(f => !f.type.startsWith('image/'));

                if (nonImageFiles.length === 0) return false;

                event.preventDefault();
                editor.update(() => {
                    nonImageFiles.forEach((file) => {
                        const src = URL.createObjectURL(file);
                        const fileNode = $createFileNode(src, file.name, formatBytes(file.size), file.type);
                        $insertNodeToNearestRoot(fileNode);
                    });
                });

                return true;
            },
            COMMAND_PRIORITY_HIGH
        );
    }, [editor]);

    return null;
}
