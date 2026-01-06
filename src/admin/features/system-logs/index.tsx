import { getRouteApi } from '@tanstack/react-router'
import { Main } from '@admin/components/layout/main'
import { LogsTable } from './components/logs-table'
import { useLogs } from './hooks/use-logs'
import type { LogListParams } from '@admin/lib/types/admin-api'
import type { NavigateFn } from '@admin/hooks/use-table-url-state'

const route = getRouteApi('/admin/_authenticated/logs')

export function Logs() {

    const search = route.useSearch() as LogListParams
    const navigate = route.useNavigate() as NavigateFn

    // safely cast search params
    const queryParams: LogListParams = {
        page: search.page || 1,
        limit: search.limit || 10,
        level: search.level,
    }

    const { data: logs = [], isLoading } = useLogs(queryParams)

    return (
        <>
            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>System Logs</h2>
                        <p className='text-muted-foreground'>
                            View system activity and audit logs.
                        </p>
                    </div>
                </div>
                <LogsTable data={logs} isLoading={isLoading} search={search} navigate={navigate} />
            </Main>
        </>
    )
}
