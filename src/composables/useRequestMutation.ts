import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { type Ref } from 'vue'

export interface UseRequestMutationOptions<TData, TVariables> {
    mutationFn: (variables: TVariables) => Promise<TData>
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: Error, variables: TVariables) => void
    invalidateQueries?: string[][]
}

export interface UseRequestMutationReturn<TData, TVariables> {
    mutate: (variables: TVariables) => void
    mutateAsync: (variables: TVariables) => Promise<TData>
    data: Ref<TData | undefined>
    error: Ref<Error | null>
    isPending: Ref<boolean>
    isError: Ref<boolean>
    isSuccess: Ref<boolean>
    reset: () => void
}

export function useRequestMutation<TData = any, TVariables = any>(
    options: UseRequestMutationOptions<TData, TVariables>
): UseRequestMutationReturn<TData, TVariables> {
    const queryClient = useQueryClient()

    const {
        mutationFn,
        onSuccess,
        onError,
        invalidateQueries = []
    } = options

    const mutation = useMutation({
        mutationFn,
        onSuccess: (data, variables) => {
            invalidateQueries.forEach(queryKey => {
                queryClient.invalidateQueries({ queryKey })
            })

            if (onSuccess) {
                onSuccess(data, variables)
            }
        },
        onError: (error, variables) => {
            if (onError) {
                onError(error as Error, variables)
            }
        }
    })

    return {
        mutate: mutation.mutate,
        mutateAsync: mutation.mutateAsync,
        data: mutation.data,
        error: mutation.error,
        isPending: mutation.isPending,
        isError: mutation.isError,
        isSuccess: mutation.isSuccess,
        reset: mutation.reset
    }
}

// Helper functions for common HTTP methods
export function usePostRequest<TData = any, TVariables = any>(
    url: string,
    options?: Omit<UseRequestMutationOptions<TData, TVariables>, 'mutationFn'>
): UseRequestMutationReturn<TData, TVariables> {
    return useRequestMutation({
        mutationFn: async (variables: TVariables) => {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(variables)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return response.json()
        },
        ...options
    })
}

export function usePutRequest<TData = any, TVariables = any>(
    url: string,
    options?: Omit<UseRequestMutationOptions<TData, TVariables>, 'mutationFn'>
): UseRequestMutationReturn<TData, TVariables> {
    return useRequestMutation({
        mutationFn: async (variables: TVariables) => {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(variables)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return response.json()
        },
        ...options
    })
}

export function useDeleteRequest<TData = any, TVariables = any>(
    url: string,
    options?: Omit<UseRequestMutationOptions<TData, TVariables>, 'mutationFn'>
): UseRequestMutationReturn<TData, TVariables> {
    return useRequestMutation({
        mutationFn: async (variables: TVariables) => {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(variables)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return response.json()
        },
        ...options
    })
}
