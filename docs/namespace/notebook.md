# Dokumentasi Fitur: Notebook CRUD Management (User Perspective)

**Tanggal Dokumentasi:** 25 Desember 2024  
**Fokus Domain:** Frontend  
**Perspektif:** User (dalam konteks Workspace)

---

## Alur Data Semantik

```
[User Interaksi di Workspace]
    -> [Create: Klik "New Notebook" -> API POST -> Refresh List -> Auto-Expand Parent]
    -> [Read: Fetch All Notebooks -> Build Tree Hierarchy -> Render Sidebar]
    -> [Update: Klik Rename -> Edit Inline -> API PUT -> Refresh List]
    -> [Delete: Klik Menu -> Delete -> API DELETE -> Refresh List -> Clear Selection]
    -> [Move: Drag Notebook -> Drop ke Target/Root -> API PUT Move -> Refresh List]
```

---

## A. Laporan Implementasi Fitur Notebook CRUD

### Deskripsi Fungsional

Fitur ini menyediakan kemampuan pengelolaan notebook dalam workspace pengguna. Notebooks mendukung **nested hierarchy** â€” sebuah notebook dapat memiliki notebook anak (sub-notebooks) tanpa batas kedalaman.

**Operasi yang Didukung:**

| Operasi | Trigger | API Endpoint | Hasil |
|---------|---------|--------------|-------|
| **Create** | Klik "New Notebook" | `POST /notebook/v1` | Notebook baru (sebagai child dari selected atau root) |
| **Read** | Auto-fetch saat mount | `GET /notebook/v1` | Seluruh notebooks dengan notes |
| **Update** | Menu â†’ Rename | `PUT /notebook/v1/{id}` | Nama notebook diperbarui |
| **Delete** | Menu â†’ Delete | `DELETE /notebook/v1/{id}` | Notebook dihapus (cascade) |
| **Move** | Drag & Drop | `PUT /notebook/v1/{id}/move` | Notebook pindah parent atau ke root |

**Fitur Khusus:**
- **Nested Hierarchy:** Notebooks dapat memiliki sub-notebooks
- **Visual Tree:** Expand/collapse untuk navigasi hierarki
- **Smart Create:** Notebook baru menjadi child dari notebook yang dipilih (jika ada)
- **Move Validation:** Tidak bisa memindahkan notebook ke dalam dirinya sendiri atau ke child-nya
- **Inline Rename:** Edit nama langsung di sidebar tanpa modal

### Visualisasi

> [PLACEHOLDER SCREENSHOT - WORKSPACE]
> *Gambar 1: Workspace dengan sidebar menampilkan hierarki notebooks.*

> [PLACEHOLDER SCREENSHOT - CREATE NOTEBOOK]
> *Gambar 2: Button "New Notebook" dan notebook baru yang muncul di sidebar.*

> [PLACEHOLDER SCREENSHOT - EXPANDED TREE]
> *Gambar 3: Notebook di-expand menampilkan sub-notebooks dan notes.*

> [PLACEHOLDER SCREENSHOT - RENAME INLINE]
> *Gambar 4: Inline editing nama notebook di sidebar.*

> [PLACEHOLDER SCREENSHOT - DRAG DROP]
> *Gambar 5: Visual feedback saat drag notebook ke notebook lain.*

> [PLACEHOLDER SCREENSHOT - DELETE MENU]
> *Gambar 6: Dropdown menu dengan opsi Rename dan Delete.*

---

## B. Bedah Arsitektur & Komponen

---

### [src/pages/MainApp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx)
**Layer Terdeteksi:** `Page Component (State Orchestrator)`

**Narasi Operasional:**

Komponen ini adalah pusat pengelolaan state untuk notebooks. State `notebooks` menyimpan array flat seluruh notebook yang di-fetch dari backend. State `selectedNotebook` melacak notebook mana yang sedang dipilih. State `expandedNotebooks` (Set) melacak notebook mana yang sedang di-expand di tree view.

**Create Notebook:**
Function [handleCreateNotebook](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx#244-271) memeriksa usage limit terlebih dahulu via `checkCanCreateNotebook`. Jika notebook sedang dipilih, notebook baru akan menjadi child-nya (via `parent_id`). Setelah create berhasil, parent notebook otomatis di-expand.

**Delete Notebook:**
Function [handleDeleteNotebook](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx#112-129) menghapus notebook via API. Jika notebook yang dihapus sedang dipilih, selection dibersihkan. Delete bersifat cascade â€” menghapus semua sub-notebooks dan notes di dalamnya.

**Move Notebook:**
Function [handleMoveNotebook](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx#185-214) memvalidasi bahwa target bukan dirinya sendiri atau child-nya. Setelah API berhasil, target parent otomatis di-expand.

```tsx
const [notebooks, setNotebooks] = useState<Notebook[]>([]);
const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set());

const handleCreateNotebook = async () => {
    if (isCreatingNotebook) return;

    const canCreate = await checkCanCreateNotebook();
    if (!canCreate) return;

    setIsCreatingNotebook(true);

    const request: CreateNotebookRequest = {
        name: "New Notebook",
        parent_id: selectedNotebook ?? null,
    };
    await apiClient.post<BaseResponse<CreateNotebookResponse>>(`/notebook/v1`, request);

    await fetchAllNotebooks();

    // Auto-expand parent notebook
    if (selectedNotebook) {
        setExpandedNotebooks((prev) => new Set([...prev, selectedNotebook]));
    }

    setIsCreatingNotebook(false);
};
```
*Caption: Snippet 1: Handler create notebook dengan parent_id dari selected notebook.*

```tsx
const handleDeleteNotebook = async (notebookId: string) => {
    if (isDeletingNotebook === notebookId) return;

    setIsDeletingNotebook(notebookId);

    await apiClient.delete(`/notebook/v1/${notebookId}`);
    await fetchAllNotebooks();

    // Clear selection if deleted
    if (selectedNotebook === notebookId) {
        setSelectedNotebook(null);
        setSelectedNote(null);
    }

    setIsDeletingNotebook(null);
};
```
*Caption: Snippet 2: Handler delete notebook dengan cascade selection clear.*

```tsx
const getAllChildNotebooks = (parentId: string): string[] => {
    const children = notebooks.filter((nb) => nb.parentId === parentId);
    const allIds = [parentId];

    children.forEach((child) => {
        allIds.push(...getAllChildNotebooks(child.id));
    });

    return allIds;
};

const handleMoveNotebook = async (notebookId: string, targetParentId: string | null) => {
    // Prevent moving a notebook into itself or its children
    const childIds = getAllChildNotebooks(notebookId);
    if (targetParentId && childIds.includes(targetParentId)) {
        return;
    }

    setIsProcessingMove(true);

    const request: MoveNotebookRequest = { parent_id: targetParentId };
    await apiClient.put<BaseResponse<MoveNotebookResponse>>(`/notebook/v1/${notebookId}/move`, request);

    await fetchAllNotebooks();

    // Auto-expand target parent
    if (targetParentId) {
        setExpandedNotebooks((prev) => new Set([...prev, targetParentId]));
    }
    setIsProcessingMove(false);
};
```
*Caption: Snippet 3: Handler move notebook dengan validasi circular reference.*

```tsx
const fetchAllNotebooks = async () => {
    const data = await apiClient.get<BaseResponse<GetAllNotebookResponse[]>>(`/notebook/v1`);

    const notebooksData = data.data.data ?? [];
    setNotebooks(
        notebooksData.map((notebook) => ({
            id: notebook.id,
            name: notebook.name,
            parentId: notebook.parent_id,
            createdAt: new Date(notebook.created_at),
            updatedAt: new Date(notebook.updated_at ?? notebook.created_at),
        }))
    );

    // Also extract notes from response
    const notes = notebooksData.reduce<Note[]>((currentNotes, notebook) => {
        return [...currentNotes, ...notebook.notes.map((n) => ({ ...n, notebookId: notebook.id }))];
    }, []);
    setNotes(notes);
};
```
*Caption: Snippet 4: Fetch notebooks dengan transformasi response dan ekstraksi notes.*

---

### [src/components/sidebar.tsx](file:///d:/notetaker/notefiber-FE/src/components/sidebar.tsx)
**Layer Terdeteksi:** `Component (Tree View & Interaction)`

**Narasi Operasional:**

Komponen ini merender hierarki notebooks dalam bentuk tree view dengan dukungan expand/collapse, drag-and-drop, inline rename, dan context menu.

**Tree Building:**
Function [buildNotebookTree](file:///d:/notetaker/notefiber-FE/src/components/sidebar.tsx#72-75) mem-filter notebooks berdasarkan `parentId` untuk membangun hierarki. Dipanggil secara rekursif dalam [renderNotebook](file:///d:/notetaker/notefiber-FE/src/components/sidebar.tsx#176-401) untuk merender sub-notebooks.

**Expand/Collapse:**
State `expandedNotebooks` (Set) dari parent menentukan notebook mana yang ter-expand. Toggle dilakukan saat klik pada notebook yang memiliki children.

**Inline Rename:**
State lokal `editingNotebook` dan `editingName` mengelola mode edit. Saat rename dipilih dari menu, input inline muncul menggantikan label. Enter atau blur menyimpan, Escape membatalkan.

**Drag & Drop:**
Notebooks dapat di-drag ke notebook lain (menjadi child) atau ke area root (menjadi top-level). Visual feedback diberikan saat drag-over.

```tsx
const buildNotebookTree = (parentId: string | null = null): Notebook[] => {
    return notebooks
        .filter((notebook) => notebook.parentId === parentId)
        .sort((a, b) => a.name.localeCompare(b.name));
};

const toggleNotebook = (notebookId: string) => {
    const newExpanded = new Set(expandedNotebooks);
    if (newExpanded.has(notebookId)) {
        newExpanded.delete(notebookId);
    } else {
        newExpanded.add(notebookId);
    }
    setExpandedNotebooks(newExpanded);
};
```
*Caption: Snippet 5: Utility functions untuk tree building dan toggle expand.*

```tsx
const startEditingNotebook = (notebook: Notebook) => {
    setEditingNotebook(notebook.id);
    setEditingName(notebook.name);
};

const saveNotebookName = async () => {
    if (editingNotebook && editingName.trim()) {
        setIsSavingNotebookName(true);

        const request: UpdateNotebookRequest = { name: editingName.trim() };
        await apiClient.put<BaseResponse<UpdateNotebookResponse>>(
            `/notebook/v1/${editingNotebook}`,
            request,
        );

        onNotebookUpdate(editingNotebook, { name: editingName.trim() });
        setIsSavingNotebookName(false);
    }
    setEditingNotebook(null);
    setEditingName("");
};
```
*Caption: Snippet 6: Handler inline rename notebook.*

```tsx
const handleDrop = (e: React.DragEvent, targetType: "notebook" | "note", targetId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const data = e.dataTransfer.getData("text/plain");
    const [draggedType, draggedId] = data.split(":") as ["notebook" | "note", string];

    if (draggedType === "notebook" && targetType === "notebook") {
        if (draggedId !== targetId) {
            onMoveNotebook(draggedId, targetId);
        }
    }

    setDraggedItem(null);
    setDragOverItem(null);
};

const handleDropOnRoot = (e: React.DragEvent) => {
    e.preventDefault();

    const data = e.dataTransfer.getData("text/plain");
    const [draggedType, draggedId] = data.split(":") as ["notebook" | "note", string];

    if (draggedType === "notebook") {
        onMoveNotebook(draggedId, null); // null = move to root
    }
};
```
*Caption: Snippet 7: Handler drag-drop untuk move notebook ke parent atau root.*

```tsx
const renderNotebook = (notebook: Notebook, level = 0) => {
    const children = buildNotebookTree(notebook.id);
    const notebookNotes = getNotebookNotes(notebook.id);
    const isExpanded = expandedNotebooks.has(notebook.id);
    const hasChildren = children.length > 0 || notebookNotes.length > 0;
    const isEditing = editingNotebook === notebook.id;

    return (
        <div key={notebook.id}>
            <div
                draggable={!isEditing && !isProcessingMove}
                onDragStart={(e) => handleDragStart(e, "notebook", notebook.id)}
                onDragOver={(e) => handleDragOver(e, "notebook", notebook.id)}
                onDrop={(e) => handleDrop(e, "notebook", notebook.id)}
            >
                <Button style={{ paddingLeft: `${level * 16 + 8}px` }} onClick={() => { onNotebookSelect(notebook.id); if (hasChildren) toggleNotebook(notebook.id); }}>
                    {hasChildren && (isExpanded ? <ChevronDown /> : <ChevronRight />)}
                    {isExpanded ? <FolderOpen /> : <Folder />}
                    {isEditing ? (
                        <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} onBlur={saveNotebookName} autoFocus />
                    ) : (
                        <span>{notebook.name}</span>
                    )}
                </Button>

                <DropdownMenu>
                    <DropdownMenuItem onClick={() => startEditingNotebook(notebook)}>
                        <Edit2 /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteNotebook(notebook.id)} className="text-red-600">
                        <Trash2 /> Delete
                    </DropdownMenuItem>
                </DropdownMenu>
            </div>

            {isExpanded && (
                <div>
                    {notebookNotes.map((note) => renderNote(note))}
                    {children.map((child) => renderNotebook(child, level + 1))}
                </div>
            )}
        </div>
    );
};
```
*Caption: Snippet 8: Recursive render notebook dengan indentasi level dan context menu.*

---

### [src/types/notebook.ts](file:///d:/notetaker/notefiber-FE/src/types/notebook.ts)
**Layer Terdeteksi:** `Type Definition (Entity Interface)`

**Narasi Operasional:**

File ini mendefinisikan interface TypeScript untuk entity Notebook. Property `parentId` yang nullable memungkinkan representasi hierarki â€” notebook dengan `parentId: null` adalah root-level, sementara yang memiliki value adalah child.

```tsx
export interface Notebook {
    id: string
    name: string
    parentId: string | null  // null = root level
    createdAt: Date
    updatedAt: Date
}
```
*Caption: Snippet 9: Interface Notebook entity dengan support hierarchy.*

---

### [src/dto/notebook.ts](file:///d:/notetaker/notefiber-FE/src/dto/notebook.ts)
**Layer Terdeteksi:** `DTO Definition (API Contract)`

**Narasi Operasional:**

File ini mendefinisikan struktur request/response untuk operasi API notebook.

- [GetAllNotebookResponse](file:///d:/notetaker/notefiber-FE/src/dto/notebook.ts#1-9): Response dari fetch all, mencakup nested notes
- [CreateNotebookRequest](file:///d:/notetaker/notefiber-FE/src/dto/notebook.ts#18-22): Name dan optional parent_id
- [UpdateNotebookRequest](file:///d:/notetaker/notefiber-FE/src/dto/notebook.ts#27-30): Hanya name (parent tidak bisa diubah via update)
- [MoveNotebookRequest](file:///d:/notetaker/notefiber-FE/src/dto/notebook.ts#35-38): Hanya parent_id untuk memindahkan posisi hierarki

```tsx
export interface GetAllNotebookResponse {
    id: string;
    name: string;
    parent_id: string | null;
    created_at: Date;
    updated_at: Date | null;
    notes: GetAllNotebookResponseNote[];  // Nested notes
}

export interface CreateNotebookRequest {
    name: string;
    parent_id: string | null;  // null = create at root
}

export interface UpdateNotebookRequest {
    name: string;  // Only name can be updated
}

export interface MoveNotebookRequest {
    parent_id: string | null;  // null = move to root
}
```
*Caption: Snippet 10: DTO untuk operasi CRUD notebook.*

---

## C. Ringkasan Ketergantungan Komponen

| Komponen | Menerima Dari | Meneruskan Ke |
|----------|---------------|---------------|
| [MainApp.tsx](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx) | User Action (button click) | [Sidebar](file:///d:/notetaker/notefiber-FE/src/components/sidebar.tsx#37-424), API Client |
| `Sidebar.tsx` | [MainApp](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx#37-437) (notebooks array) | [MainApp](file:///d:/notetaker/notefiber-FE/src/pages/MainApp.tsx#37-437) callbacks (select, update, delete, move) |

---

## D. Diagram Alur CRUD Notebook

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         MainApp                                  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚         TopBar               â”‚  â”‚      NoteEditor        â”‚  â”‚
â”‚  â”‚  [New Notebook] [New Note]   â”‚  â”‚                        â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚                        â”‚  â”‚
â”‚                                     â”‚                        â”‚  â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚                        â”‚  â”‚
â”‚  â”‚         Sidebar              â”‚  â”‚                        â”‚  â”‚
â”‚  â”‚  ðŸ“ Notebook A               â”‚  â”‚                        â”‚  â”‚
â”‚  â”‚    â”œâ”€ ðŸ“ Sub-Notebook A1     â”‚  â”‚                        â”‚  â”‚
â”‚  â”‚    â”‚   â””â”€ ðŸ“„ Note 1          â”‚  â”‚                        â”‚  â”‚
â”‚  â”‚    â””â”€ ðŸ“„ Note 2              â”‚  â”‚                        â”‚  â”‚
â”‚  â”‚  ðŸ“ Notebook B               â”‚  â”‚                        â”‚  â”‚
â”‚  â”‚    â””â”€ ðŸ“„ Note 3              â”‚  â”‚                        â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”‚
                              â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚   API Client    â”‚
                    â”‚                 â”‚
                    â”‚ GET /notebook   â”‚  â† Fetch All
                    â”‚ POST /notebook  â”‚  â† Create
                    â”‚ PUT /notebook/idâ”‚  â† Rename
                    â”‚ DELETE /nb/id   â”‚  â† Delete (cascade)
                    â”‚ PUT /nb/id/move â”‚  â† Move
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## E. Hierarchy & Move Validation

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Notebook Hierarchy Example:                                  â”‚
â”‚                                                               â”‚
â”‚  ROOT                                                         â”‚
â”‚  â”œâ”€â”€ Work [id: 1]                                            â”‚
â”‚  â”‚   â”œâ”€â”€ Projects [id: 2]                                    â”‚
â”‚  â”‚   â”‚   â””â”€â”€ Note: "Q1 Goals"                                â”‚
â”‚  â”‚   â””â”€â”€ Meetings [id: 3]                                    â”‚
â”‚  â””â”€â”€ Personal [id: 4]                                        â”‚
â”‚      â””â”€â”€ Ideas [id: 5]                                       â”‚
â”‚                                                               â”‚
â”‚  Move Validation Rules:                                       â”‚
â”‚  âœ“ Move "Projects" -> "Personal" (OK, different branch)      â”‚
â”‚  âœ“ Move "Work" -> ROOT (OK, already at root is no-op)        â”‚
â”‚  âœ— Move "Work" -> "Projects" (BLOCKED, Projects is child)    â”‚
â”‚  âœ— Move "Work" -> "Meetings" (BLOCKED, Meetings is child)    â”‚
â”‚  âœ— Move "Work" -> "Work" (BLOCKED, same notebook)            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Validation Logic:**
```tsx
const getAllChildNotebooks = (parentId: string): string[] => {
    const children = notebooks.filter((nb) => nb.parentId === parentId);
    const allIds = [parentId];
    children.forEach((child) => allIds.push(...getAllChildNotebooks(child.id)));
    return allIds;
};

// In handleMoveNotebook:
const childIds = getAllChildNotebooks(notebookId);
if (targetParentId && childIds.includes(targetParentId)) {
    return; // Block circular reference
}
```

---

## F. UI States & Loading

| Operation | Loading State | Disabled Elements |
|-----------|---------------|-------------------|
| Creating | `isCreatingNotebook` | Create button, spinner shown |
| Renaming | `isSavingNotebookName` | Input disabled, spinner shown |
| Deleting | `isDeletingNotebook` (per-id) | That notebook's menu, "Deleting..." shown |
| Moving | `isProcessingMove` | All drag operations, buttons |

---

*Dokumen ini dibuat secara otomatis berdasarkan analisis kode sumber dalam mode READ-ONLY.*
