# Dokumentasi Fitur: Note Management (User Perspective)

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend  
**Perspektif:** User (dalam konteks Workspace)

---

## Alur Data Semantik

```
[User Interaksi di Workspace]
    -> [Create Note: Klik "New Note" -> API POST -> Refresh List -> Auto-Select]
    -> [Read Note: Klik Note di Sidebar -> Set Selected Note -> Render Editor]
    -> [Update Note: Edit Title/Content -> Toggle hasChanges -> Klik Save -> API PUT]
    -> [Delete Note: Klik Menu -> Delete -> API DELETE -> Refresh List]
    -> [Move Note: Drag Note -> Drop ke Notebook -> API PUT Move -> Refresh List]
```

---

## A. Laporan Implementasi Fitur Note Management

### Deskripsi Fungsional

Fitur ini menyediakan kemampuan lengkap pengelolaan catatan (notes) dalam workspace pengguna. Setiap note terkait dengan satu notebook dan dapat dipindahkan antar notebook menggunakan drag-and-drop.

**Operasi yang Didukung:**

| Operasi | Trigger | API Endpoint | Hasil |
|---------|---------|--------------|-------|
| **Create** | Klik "New Note" | `POST /note/v1` | Note baru dengan judul default |
| **Read** | Klik note di sidebar | - (client-side) | Editor menampilkan konten |
| **Update** | Edit + Klik Save | `PUT /note/v1/{id}` | Perubahan tersimpan |
| **Delete** | Menu â†’ Delete | `DELETE /note/v1/{id}` | Note dihapus |
| **Move** | Drag & Drop | `PUT /note/v1/{id}/move` | Note pindah notebook |

**Editor Capabilities:**
- Rich text editing dengan Lexical framework
- Markdown shortcuts support
- Toolbar untuk formatting (bold, italic, lists, dll)
- Code highlighting
- Table support
- Checklist/todo items
- Mode Preview vs Edit

### Visualisasi

> [PLACEHOLDER SCREENSHOT - WORKSPACE]
> *Gambar 1: Workspace dengan sidebar notebooks/notes dan area editor.*

> [PLACEHOLDER SCREENSHOT - CREATE NOTE]
> *Gambar 2: Button "New Note" dan note baru yang muncul di sidebar.*

> [PLACEHOLDER SCREENSHOT - EDIT NOTE]
> *Gambar 3: Editor dengan toolbar dan konten note yang sedang diedit.*

> [PLACEHOLDER SCREENSHOT - SAVE INDICATOR]
> *Gambar 4: Indikator "Save" muncul saat ada perubahan yang belum tersimpan.*

> [PLACEHOLDER SCREENSHOT - DRAG DROP]
> *Gambar 5: Visual feedback saat drag note ke notebook berbeda.*

> [PLACEHOLDER SCREENSHOT - DELETE MENU]
> *Gambar 6: Dropdown menu dengan opsi Delete pada note item.*

---

## B. Bedah Arsitektur & Komponen

---

### [src/pages/MainApp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx)
**Layer Terdeteksi:** `Page Component (State Orchestrator)`

**Narasi Operasional:**

Komponen ini adalah pusat pengelolaan state untuk seluruh workspace termasuk notes. State `notes` menyimpan array seluruh note yang di-fetch dari backend. State `selectedNote` melacak note mana yang sedang aktif di editor.

Function [handleCreateNote](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx#215-243) memeriksa usage limit terlebih dahulu, lalu membuat note baru dengan judul default "Untitled Note" dan konten placeholder. Setelah API berhasil, list di-refresh dan note baru otomatis dipilih.

Function [handleNoteUpdate](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx#95-107) menerima perubahan dari [NoteEditor](file:///d:/notetaker/notefiber-FE/src/components/note-editor.tsx#16-113) dan mengirim ke backend via API PUT. Function [handleDeleteNote](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx#130-146) menghapus note dan membersihkan selection jika note yang dihapus sedang dipilih.

Function [handleMoveNote](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx#158-184) memindahkan note ke notebook target, memperbarui state optimistically, lalu mengirim ke backend, dan auto-expand notebook target.

```tsx
const [notes, setNotes] = useState<Note[]>([]);
const [selectedNote, setSelectedNote] = useState<string | null>(null);
const currentNote = notes.find((note) => note.id === selectedNote);

const handleCreateNote = async () => {
    if (!selectedNotebook || isCreatingNote) return;

    const canCreate = await checkCanCreateNote();
    if (!canCreate) return;

    setIsCreatingNote(true);

    const request: CreateNoteRequest = {
        title: "Untitled Note",
        content: "# Untitled Note\n\nStart writing...",
        notebook_id: selectedNotebook,
    };
    const res = await apiClient.post<BaseResponse<CreateNoteResponse>>(`/note/v1`, request);

    await fetchAllNotebooks();
    setSelectedNote(res.data.data.id);
    setExpandedNotebooks((prev) => new Set([...prev, selectedNotebook]));
    setIsCreatingNote(false);
};
```
*Caption: Snippet 1: Handler create note dengan usage limit check dan auto-select.*

```tsx
const handleNoteUpdate = async (noteId: string, updates: Partial<Note>) => {
    const request: UpdateNoteRequest = {
        title: updates.title ?? "",
        content: updates.content ?? "",
    };
    await apiClient.put<BaseResponse<UpdateNoteResponse>>(`/note/v1/${noteId}`, request);
    await fetchAllNotebooks();
};
```
*Caption: Snippet 2: Handler update note yang diteruskan ke NoteEditor.*

---

### [src/components/note-editor.tsx](file:///d:/notetaker/notefiber-FE/src/components/note-editor.tsx)
**Layer Terdeteksi:** `Component (Editor Container)`

**Narasi Operasional:**

Komponen ini menyediakan antarmuka editing untuk note yang dipilih. State lokal `title` dan `content` menyimpan nilai yang sedang diedit, sementara `hasChanges` melacak apakah ada perubahan yang belum disimpan.

Effect pertama menyinkronkan state lokal dengan prop `note` saat note berbeda dipilih â€” ini me-reset editor dengan konten note baru. Effect kedua membandingkan nilai lokal dengan nilai asli untuk menentukan `hasChanges`.

Header menampilkan input title yang editable dan button Save yang hanya muncul saat `hasChanges` bernilai true. Toggle Preview/Edit memungkinkan user beralih antara mode editing dan preview rendered.

```tsx
const [content, setContent] = useState(note.content);
const [title, setTitle] = useState(note.title);
const [hasChanges, setHasChanges] = useState(false);

useEffect(() => {
    setContent(note.content);
    setTitle(note.title);
    setHasChanges(false);
}, [note.id, note.content, note.title]);

useEffect(() => {
    setHasChanges(content !== note.content || title !== note.title);
}, [content, title, note.content, note.title]);

const handleSave = async () => {
    setIsSaving(true);
    try {
        await onUpdate(note.id, { content, title });
        setHasChanges(false);
    } finally {
        setIsSaving(false);
    }
};
```
*Caption: Snippet 3: State management untuk change detection dan save operation.*

```tsx
return (
    <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                <div className="flex items-center gap-2">
                    {hasChanges && (
                        <Button onClick={handleSave} disabled={isSaving}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    )}
                    <Button onClick={() => setIsPreview(!isPreview)}>
                        {isPreview ? <><Edit /> Edit</> : <><Eye /> Preview</>}
                    </Button>
                </div>
            </div>
            <div className="text-xs text-gray-500">{formatUpdatedAt(note.updatedAt)}</div>
        </div>
        <div className="flex-1 overflow-hidden">
            <Editor initialContent={isPreview ? content : note.content} readOnly={isPreview} onChange={setContent} />
        </div>
    </div>
);
```
*Caption: Snippet 4: Layout editor dengan header dan content area.*

---

### [src/components/organisms/Editor/Editor.tsx](file:///d:/notetaker/notefiber-FE/src/components/organisms/Editor/Editor.tsx)
**Layer Terdeteksi:** `Component (Rich Text Editor - Lexical)`

**Narasi Operasional:**

Komponen ini mengimplementasikan rich text editor menggunakan Lexical framework dari Meta. Mendukung berbagai fitur editing termasuk rich text, lists, links, tables, code blocks dengan highlighting, checklists, dan markdown shortcuts.

Plugin [InitialStatePlugin](file:///d:/notetaker/notefiber-FE/src/components/organisms/Editor/Editor.tsx#31-58) menangani loading konten awal dengan strategi fallback: pertama mencoba parse sebagai JSON (format native Lexical), jika gagal fallback ke konversi dari Markdown. Ini memungkinkan backward compatibility dengan konten lama.

Plugin `OnChangePlugin` menangkap setiap perubahan editor state dan serialize ke JSON string yang kemudian diteruskan ke parent component via callback [onChange](file:///d:/notetaker/notefiber-FE/src/components/organisms/Editor/Editor.tsx#75-86). Format JSON mempertahankan struktur lengkap Lexical termasuk tables dan checklists yang tidak bisa direpresentasikan di Markdown biasa.

```tsx
function InitialStatePlugin({ content }: { content: string }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!content) return;

        editor.update(() => {
            try {
                const parsedState = JSON.parse(content);
                if (parsedState.root) {
                    const editorState = editor.parseEditorState(parsedState);
                    editor.setEditorState(editorState);
                    return;
                }
            } catch {
                // Not valid JSON, fall back to Markdown
            }
            $convertFromMarkdownString(content, TRANSFORMERS);
        });
    }, [content, editor]);

    return null;
}
```
*Caption: Snippet 5: Plugin untuk load konten dengan JSON/Markdown fallback.*

```tsx
export function Editor({ initialContent = "", onChange, readOnly = false }: EditorProps) {
    const onChangeHandler = (editorState: EditorState) => {
        if (readOnly) return;

        editorState.read(() => {
            const jsonState = editorState.toJSON();
            if (onChange) {
                onChange(JSON.stringify(jsonState));
            }
        });
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="editor-container">
                {!readOnly && <ToolbarPlugin />}
                <div className="editor-inner">
                    <RichTextPlugin ... />
                    <HistoryPlugin />
                    <ListPlugin />
                    <LinkPlugin />
                    <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                    <TablePlugin />
                    <CheckListPlugin />
                    <CodeHighlightPlugin />
                    <MentionsPlugin />
                </div>
            </div>
        </LexicalComposer>
    );
}
```
*Caption: Snippet 6: Struktur editor dengan plugin-plugin Lexical.*

---

### [src/components/sidebar.tsx](file:///d:/notetaker/notefiber-FE/src/components/sidebar.tsx)
**Layer Terdeteksi:** `Component (Navigation & Drag-Drop)`

**Narasi Operasional:**

Komponen ini menampilkan hierarki notebooks dan notes dalam bentuk tree view. Notes ditampilkan di dalam notebook parent-nya dan diurutkan secara alfabetis.

Setiap note item mendukung drag-and-drop untuk pemindahan ke notebook lain. Event `onDragStart` menyimpan informasi item yang di-drag, `onDragOver` memberikan visual feedback, dan `onDrop` memanggil callback `onMoveNote` untuk memproses perpindahan.

Dropdown menu pada setiap note menyediakan opsi Delete. Loading state `isDeletingNote` ditampilkan selama proses penghapusan berlangsung untuk mencegah interaksi ganda.

```tsx
const handleDragStart = (e: React.DragEvent, type: "notebook" | "note", id: string) => {
    if (isProcessingMove || isDeletingNote) {
        e.preventDefault();
        return;
    }
    e.stopPropagation();
    setDraggedItem({ type, id });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${type}:${id}`);
};

const handleDrop = (e: React.DragEvent, targetType: "notebook" | "note", targetId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const data = e.dataTransfer.getData("text/plain");
    const [draggedType, draggedId] = data.split(":") as ["notebook" | "note", string];

    if (draggedType === "note" && targetType === "notebook") {
        onMoveNote(draggedId, targetId);
    }

    setDraggedItem(null);
    setDragOverItem(null);
};
```
*Caption: Snippet 7: Handler drag-and-drop untuk pemindahan note.*

```tsx
{notebookNotes.map((note) => (
    <div
        key={note.id}
        draggable={!isProcessingMove && !isThisNoteDeleting}
        onDragStart={(e) => handleDragStart(e, "note", note.id)}
        onDragOver={(e) => handleDragOver(e, "note", note.id)}
        onDrop={(e) => handleDrop(e, "note", note.id)}
    >
        <Button onClick={() => onNoteSelect(note.id)}>
            <FileText className="h-3.5 w-3.5 mr-2" />
            <span className="truncate">{note.title}</span>
        </Button>

        <DropdownMenu>
            <DropdownMenuItem onClick={() => onDeleteNote(note.id)} className="text-red-600">
                {isThisNoteDeleting ? "Deleting..." : <><Trash2 /> Delete</>}
            </DropdownMenuItem>
        </DropdownMenu>
    </div>
))}
```
*Caption: Snippet 8: Render note item dengan drag-drop dan delete menu.*

---

### [src/types/note.ts](file:///d:/notetaker/notefiber-FE/src/types/note.ts)
**Layer Terdeteksi:** `Type Definition (Entity Interface)`

**Narasi Operasional:**

File ini mendefinisikan interface TypeScript untuk entity Note yang digunakan di seluruh aplikasi. Properties mencakup identifier, konten, relasi ke notebook, dan timestamp. Interface ini digunakan untuk type-safety saat manipulasi data note.

```tsx
export interface Note {
    id: string
    title: string
    content: string
    notebookId: string
    createdAt: Date
    updatedAt: Date
}
```
*Caption: Snippet 9: Interface Note entity.*

---

### [src/dto/note.ts](file:///d:/notetaker/notefiber-FE/src/dto/note.ts)
**Layer Terdeteksi:** `DTO Definition (API Contract)`

**Narasi Operasional:**

File ini mendefinisikan struktur request dan response untuk operasi API note. [CreateNoteRequest](file:///d:/notetaker/notefiber-FE/src/dto/note.ts#1-6) mencakup title, content, dan notebook_id. [UpdateNoteRequest](file:///d:/notetaker/notefiber-FE/src/dto/note.ts#11-15) hanya mencakup title dan content karena notebook tidak bisa diubah via update (harus via move). [MoveNoteRequest](file:///d:/notetaker/notefiber-FE/src/dto/note.ts#20-23) hanya membutuhkan target notebook_id.

```tsx
export interface CreateNoteRequest {
    title: string;
    content: string;
    notebook_id: string;
}

export interface UpdateNoteRequest {
    title: string;
    content: string;
}

export interface MoveNoteRequest {
    notebook_id: string;
}

export interface CreateNoteResponse {
    id: string;
}
```
*Caption: Snippet 10: DTO untuk operasi create, update, dan move note.*

---

## C. Ringkasan Ketergantungan Komponen

| Komponen | Menerima Dari | Meneruskan Ke |
|----------|---------------|---------------|
| [MainApp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx) | User Action (button click) | [Sidebar](file:///d:/notetaker/notefiber-FE/src/components/sidebar.tsx#37-424), [NoteEditor](file:///d:/notetaker/notefiber-FE/src/components/note-editor.tsx#16-113), API Client |
| `Sidebar.tsx` | [MainApp](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx#37-437) (notes array) | [MainApp](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx#37-437) callbacks (select, delete, move) |
| `NoteEditor.tsx` | [MainApp](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx#37-437) (selected note) | `MainApp.handleNoteUpdate`, [Editor](file:///d:/notetaker/notefiber-FE/src/components/organisms/Editor/Editor.tsx#74-121) |
| [Editor.tsx](file:///d:/notetaker/notefiber-FE/src/components/organisms/Editor/Editor.tsx) | [NoteEditor](file:///d:/notetaker/notefiber-FE/src/components/note-editor.tsx#16-113) (content) | [NoteEditor](file:///d:/notetaker/notefiber-FE/src/components/note-editor.tsx#16-113) (onChange callback) |

---

## D. Diagram Alur CRUD Note

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         MainApp                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚   TopBar     â”‚  â”‚   Sidebar    â”‚  â”‚     NoteEditor       â”‚  â”‚
â”‚  â”‚              â”‚  â”‚              â”‚  â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚  â”‚
â”‚  â”‚  [New Note]  â”‚  â”‚  Notebooks   â”‚  â”‚   â”‚    Header    â”‚   â”‚  â”‚
â”‚  â”‚              â”‚  â”‚    â”” Notes   â”‚  â”‚   â”‚  [Title]     â”‚   â”‚  â”‚
â”‚  â”‚              â”‚  â”‚      â€¢ Note1 â”‚â”€â”€â”€â”€â”€â”€>â”‚  [Save]     â”‚   â”‚  â”‚
â”‚  â”‚              â”‚  â”‚      â€¢ Note2 â”‚  â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚  â”‚
â”‚  â”‚              â”‚  â”‚              â”‚  â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚  â”‚
â”‚  â”‚              â”‚  â”‚              â”‚  â”‚   â”‚    Editor    â”‚   â”‚  â”‚
â”‚  â”‚              â”‚  â”‚              â”‚  â”‚   â”‚   (Lexical)  â”‚   â”‚  â”‚
â”‚  â”‚              â”‚  â”‚              â”‚  â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”‚
                              â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚   API Client    â”‚
                    â”‚                 â”‚
                    â”‚ POST /note/v1   â”‚  â† Create
                    â”‚ GET via notebookâ”‚  â† Read
                    â”‚ PUT /note/v1/id â”‚  â† Update
                    â”‚ DELETE /note/id â”‚  â† Delete
                    â”‚ PUT /note/move  â”‚  â† Move
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## E. Editor Plugins & Features

| Plugin | Fungsi |
|--------|--------|
| `RichTextPlugin` | Base rich text editing |
| `HistoryPlugin` | Undo/Redo support |
| `ListPlugin` | Ordered/Unordered lists |
| `LinkPlugin` | Hyperlink support |
| `MarkdownShortcutPlugin` | **bold**, *italic*, etc. |
| `TablePlugin` | Table creation & editing |
| `CheckListPlugin` | Todo/Checklist items |
| `CodeHighlightPlugin` | Syntax highlighting |
| `HashtagPlugin` | #hashtag detection |
| `MentionsPlugin` | @mention support |
| `ToolbarPlugin` | Formatting toolbar |

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
