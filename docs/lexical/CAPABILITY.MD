# Editor Capabilities

The NoteFiber Editor is powered by Lexical and supports the following advanced features:

## Core Editing
- **Atomic Blocks**: Paragraphs, Headings (H1-H6), Quotes, Code Blocks.
- **Lists**: Bullet lists, Numbered lists, and Checklists (with toggle support).
- **Tables**: Basic table insertion and cell editing.
- **Markdown Support**: Auto-formatting shortcuts (e.g., `# ` for H1, `* ` for list).

## Typography & Styling
- **Font Control**: Selection of font families (Arial, Georgia, etc.) and font sizes.
- **Text Formatting**: Bold, Italic, Underline, Strikethrough, Subscript, Superscript, Inline Code.
- **Alignment**: Left, Center, Right, Justify alignment for blocks.
- **Transformations**: Uppercase, Lowercase, Capitalize (via CSS).

## Organization
- **Separators**: Horizontal Rule support.
- **History**: Robust Undo/Redo stack.

## Technical Architecture
- **Atomic Design**: Toolbar components are modular (`BlockTypeDropdown`, `FontControls`, etc.).
- **Serialization**: Full JSON serialization for storage and retrieval.
- **Type Safety**: Fully typed with TypeScript and Lexical definitions.
