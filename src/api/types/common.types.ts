/**
 * Common API Types
 */

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

export interface PaginatedList<T> {
    items: T[];
    meta: PaginationMeta;
}
