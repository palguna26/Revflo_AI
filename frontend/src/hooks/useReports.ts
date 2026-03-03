import { useQuery } from '@tanstack/react-query'
import { getReport } from '../lib/api'

export function useReport(reportId: string | undefined) {
    return useQuery({
        queryKey: ['report', reportId],
        queryFn: () => getReport(reportId!),
        enabled: !!reportId,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    })
}
