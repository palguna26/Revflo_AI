import { useQuery } from '@tanstack/react-query'
import { getRepositories } from '../lib/api'

export function useRepositories() {
    return useQuery({
        queryKey: ['repositories'],
        queryFn: getRepositories,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    })
}
