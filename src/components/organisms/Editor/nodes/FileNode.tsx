import type {
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from 'lexical';

import { DecoratorNode } from 'lexical';
import * as React from 'react';
import { Suspense } from 'react';

const FileComponent = React.lazy(() => import('./FileComponent.tsx'));

export type SerializedFileNode = Spread<
    {
        src: string;
        fileName: string;
        fileSize: string;
        fileType: string;
    },
    SerializedLexicalNode
>;

export class FileNode extends DecoratorNode<React.JSX.Element> {
    __src: string;
    __fileName: string;
    __fileSize: string;
    __fileType: string;

    static getType(): string {
        return 'file';
    }

    static clone(node: FileNode): FileNode {
        return new FileNode(
            node.__src,
            node.__fileName,
            node.__fileSize,
            node.__fileType,
            node.__key,
        );
    }

    static importJSON(serializedNode: SerializedFileNode): FileNode {
        const { src, fileName, fileSize, fileType } = serializedNode;
        return $createFileNode(src, fileName, fileSize, fileType);
    }

    exportJSON(): SerializedFileNode {
        return {
            fileName: this.__fileName,
            fileSize: this.__fileSize,
            fileType: this.__fileType,
            src: this.__src,
            type: 'file',
            version: 1,
        };
    }

    constructor(
        src: string,
        fileName: string,
        fileSize: string,
        fileType: string,
        key?: NodeKey,
    ) {
        super(key);
        this.__src = src;
        this.__fileName = fileName;
        this.__fileSize = fileSize;
        this.__fileType = fileType;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const span = document.createElement('span');
        const theme = config.theme;
        const className = theme.file;
        if (className !== undefined) {
            span.className = className;
        }
        return span;
    }

    updateDOM(): false {
        return false;
    }

    getSrc(): string {
        return this.__src;
    }

    getFileName(): string {
        return this.__fileName;
    }

    getFileSize(): string {
        return this.__fileSize;
    }

    getFileType(): string {
        return this.__fileType;
    }

    decorate(): React.JSX.Element {
        return (
            <Suspense fallback={null}>
                <FileComponent
                    src={this.__src}
                    fileName={this.__fileName}
                    fileSize={this.__fileSize}
                    fileType={this.__fileType}
                    nodeKey={this.getKey()}
                />
            </Suspense>
        );
    }
}

export function $createFileNode(
    src: string,
    fileName: string,
    fileSize: string,
    fileType: string,
): FileNode {
    return new FileNode(src, fileName, fileSize, fileType);
}

export function $isFileNode(
    node: LexicalNode | null | undefined,
): node is FileNode {
    return node instanceof FileNode;
}
