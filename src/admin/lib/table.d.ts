import '@tanstack/react-table'
import { SystemLog } from './types/admin-api'

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: 'select'
        className?: string
        thClassName?: string
        tdClassName?: string
        onViewDetails?: (log: SystemLog) => void
    }
}
