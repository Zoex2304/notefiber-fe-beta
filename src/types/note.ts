export interface BreadcrumbItem {
    id: string;
    name: string;
}

export interface Note {
    id: string
    title: string
    content: string
    notebookId: string
    breadcrumb?: BreadcrumbItem[]
    createdAt: Date
    updatedAt: Date
}
