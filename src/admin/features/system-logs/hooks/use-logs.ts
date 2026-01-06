import { useQuery } from '@tanstack/react-query'
import { adminLogsApi } from '@admin/lib/api/admin-api'
import type { LogListParams } from '@admin/lib/types/admin-api'

export const logKeys = {
    all: ['system-logs'] as const,
    lists: () => [...logKeys.all, 'list'] as const,
    list: (params: LogListParams) => [...logKeys.lists(), params] as const,
    details: () => [...logKeys.all, 'detail'] as const,
    detail: (id: string) => [...logKeys.details(), id] as const,
}

export const useLogs = (params: LogListParams) => {
    return useQuery({
        queryKey: logKeys.list(params),
        queryFn: () => adminLogsApi.getLogs(params),
    })
}

export const useLog = (id: string) => {
    return useQuery({
        queryKey: logKeys.detail(id),
        queryFn: () => adminLogsApi.getLogDetail(id),
        enabled: !!id,
    })
}
