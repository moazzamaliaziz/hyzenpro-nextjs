import { useState, useCallback, useRef } from 'react';

interface OptimisticState<T> {
    data: T | null;
    isSaving: boolean;
    error: Error | null;
    isOptimistic: boolean;
}

interface UseOptimisticSaveOptions<T, TData> {
    initialData: T;
    saveFn: (data: T) => Promise<TData>;
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
    applyOptimisticUpdate?: (current: T, pending: T) => T;
}

export function useOptimisticSave<T, TData = T>({
    initialData,
    saveFn,
    onSuccess,
    onError,
    applyOptimisticUpdate,
}: UseOptimisticSaveOptions<T, TData>) {
    const [state, setState] = useState<OptimisticState<T>>({
        data: initialData,
        isSaving: false,
        error: null,
        isOptimistic: false,
    });

    const pendingDataRef = useRef<T | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const save = useCallback(
        async (data: T, options?: { optimistic?: boolean }) => {
            const isOptimistic = options?.optimistic ?? true;

            if (isOptimistic) {
                pendingDataRef.current = data;
                setState((prev) => ({
                    ...prev,
                    data: applyOptimisticUpdate && prev.data != null
                        ? applyOptimisticUpdate(prev.data, data)
                        : data,
                    isOptimistic: true,
                    error: null,
                }));
            }

            setState((prev) => ({ ...prev, isSaving: true, error: null }));

            abortControllerRef.current = new AbortController();

            try {
                const result = await saveFn(data);

                setState((prev) => ({
                    ...prev,
                    data: isOptimistic ? prev.data : data,
                    isSaving: false,
                    isOptimistic: false,
                    error: null,
                }));

                pendingDataRef.current = null;
                onSuccess?.(result);
                return result;
            } catch (error) {
                const err = error instanceof Error ? error : new Error('Save failed');

                if (isOptimistic && pendingDataRef.current) {
                    setState((prev) => ({
                        ...prev,
                        data: initialData,
                        isOptimistic: false,
                    }));
                }

                setState((prev) => ({
                    ...prev,
                    isSaving: false,
                    error: err,
                }));

                onError?.(err);
                throw err;
            }
        },
        [initialData, saveFn, onSuccess, onError, applyOptimisticUpdate]
    );

    const rollback = useCallback(() => {
        if (pendingDataRef.current) {
            setState((prev) => ({
                ...prev,
                data: initialData,
                isOptimistic: false,
                error: null,
            }));
            pendingDataRef.current = null;
        }
    }, [initialData]);

    const cancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        rollback();
        setState((prev) => ({ ...prev, isSaving: false }));
    }, [rollback]);

    const reset = useCallback(() => {
        setState({
            data: initialData,
            isSaving: false,
            error: null,
            isOptimistic: false,
        });
        pendingDataRef.current = null;
    }, [initialData]);

    return {
        ...state,
        save,
        rollback,
        cancel,
        reset,
    };
}