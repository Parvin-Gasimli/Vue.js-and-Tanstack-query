import { useQuery } from '@tanstack/vue-query'
import { type Ref } from 'vue'

export interface UseRequestOptions<T> {
    queryKey: string[]
    queryFn: () => Promise<T>
    enabled?: Ref<boolean> | boolean
    staleTime?: number
    cacheTime?: number
    refetchOnWindowFocus?: boolean
    retry?: number | boolean
}

export interface UseRequestReturn<T> {
    data: Ref<T | undefined>
    error: Ref<Error | null>
    isPending: Ref<boolean>
    isFetching: Ref<boolean>
    isError: Ref<boolean>
    isSuccess: Ref<boolean>
    refetch: () => void
}

export function useRequest<T = any>(options: UseRequestOptions<T>): UseRequestReturn<T> {
    const {
        queryKey,
        queryFn,
        enabled = true,
        staleTime = 5 * 60 * 1000,
        cacheTime = 10 * 60 * 1000,
        refetchOnWindowFocus = false,
        retry = 3
    } = options

    const query = useQuery({
        queryKey,
        queryFn,
        enabled,
        staleTime,
        cacheTime,
        refetchOnWindowFocus,
        retry
    })

    return {
        data: query.data,
        error: query.error,
        isPending: query.isPending,
        isFetching: query.isFetching,
        isError: query.isError,
        isSuccess: query.isSuccess,
        refetch: query.refetch
    }
}

export function useGetRequest<T = any>(
    url: string,
    options?: Omit<UseRequestOptions<T>, 'queryKey' | 'queryFn'>
): UseRequestReturn<T> {
    return useRequest<T>({
        queryKey: ['get', url],
        queryFn: async () => {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            return response.json()
        },
        ...options
    })
}
