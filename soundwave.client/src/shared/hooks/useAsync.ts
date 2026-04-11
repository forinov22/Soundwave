import {useCallback, useState} from 'react';

export function useAsync<T extends (...args: any[]) => Promise<any>>(asyncFunction: T) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reset = useCallback(() => {
        setError(null);
        setIsLoading(false);
    }, []);
    
    const execute = useCallback(async (...args: Parameters<T>) => {
        setIsLoading(true);
        setError(null);
        try {
            return await asyncFunction(...args);
        } catch (e: any) {
            const message = e.response?.data || e.message || "Произошла ошибка";
            setError(message);
            throw e; // pass exception in case component needs to handle it
        } finally {
            setIsLoading(false);
        }
    }, [asyncFunction]);

    return { execute, isLoading, error, setError, reset };
}
