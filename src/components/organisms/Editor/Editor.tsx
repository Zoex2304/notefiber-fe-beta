import { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS, $convertFromMarkdownString } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { type EditorState } from "lexical";

import { EditorNodes } from "./nodes";
import { editorTheme } from "./theme";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import TablePlugin from "./plugins/TablePlugin";
import CheckListPlugin from "./plugins/CheckListPlugin";
import HashtagPlugin from "./plugins/HashtagPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import MentionsPlugin from "./plugins/MentionsPlugin";
import ImagePlugin from "./plugins/ImagePlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import TableActionMenuPlugin from "./plugins/TableActionMenuPlugin";
import FilePlugin from "./plugins/FilePlugin";
import "./Editor.css";

function Placeholder() {
    return <div className="editor-placeholder">Enter some text...</div>;
}

// Plugin to handle initial content loading (JSON first, Markdown fallback)
function InitialStatePlugin({ content }: { content: string }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!content) return;

        editor.update(() => {
            try {
                // Try parsing as JSON first
                const parsedState = JSON.parse(content);
                if (parsedState.root) {
                    const editorState = editor.parseEditorState(parsedState);
                    editor.setEditorState(editorState);
                    return;
                }
            } catch {
                // Not valid JSON, fall back to Markdown
            }

            // Fallback: Convert from Markdown
            $convertFromMarkdownString(content, TRANSFORMERS);
        });
    }, [content, editor]);

    return null;
}

const editorConfig = {
    namespace: "NoteFiberEditor",
    theme: editorTheme,
    onError(error: Error) {
        throw error;
    },
    nodes: EditorNodes
};

interface EditorProps {
    initialContent?: string;
    onChange?: (jsonString: string) => void;
    readOnly?: boolean;
}

export function Editor({ initialContent = "", onChange, readOnly = false }: EditorProps) {
    const onChangeHandler = (editorState: EditorState) => {
        if (readOnly) return;

        editorState.read(() => {
            // Serialize to JSON to preserve full Lexical state (tables, checklists, etc.)
            const jsonState = editorState.toJSON();
            if (onChange) {
                onChange(JSON.stringify(jsonState));
            }
        });
    };

    const initialConfig = {
        ...editorConfig,
        editable: !readOnly,
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className={`editor-container border rounded-lg shadow-sm bg-card overflow-hidden flex flex-col w-full h-full ${readOnly ? 'border-none shadow-none' : 'min-h-[500px] border-border'}`}>
                {!readOnly && <ToolbarPlugin />}
                <div className="editor-inner relative flex-1 overflow-auto">
                    <RichTextPlugin
                        contentEditable={<ContentEditable className={`editor-input h-full ${readOnly ? 'resize-none' : ''}`} />}
                        placeholder={!readOnly ? <Placeholder /> : null}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin />
                    <AutoFocusPlugin />
                    <ListPlugin />
                    <LinkPlugin />
                    <HorizontalRulePlugin />
                    <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                    <OnChangePlugin onChange={onChangeHandler} />
                    <InitialStatePlugin content={initialContent} />
                    {/* Extended Plugins */}
                    <TablePlugin />
                    <CheckListPlugin />
                    <HashtagPlugin />
                    <CodeHighlightPlugin />
                    <MentionsPlugin />
                    <ImagePlugin />
                    <FloatingLinkEditorPlugin />
                    <TableActionMenuPlugin />
                    <FilePlugin />
                </div>
            </div>
        </LexicalComposer>
    );
}
