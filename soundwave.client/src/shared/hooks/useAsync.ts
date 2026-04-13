import { useCallback, useState, useRef, useEffect } from "react";

export function useAsync<T extends (...args: any[]) => Promise<any>>(
  asyncFunction: T,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackRef = useRef(asyncFunction);

  useEffect(() => {
    callbackRef.current = asyncFunction;
  }, [asyncFunction]);

  const execute = useCallback(async (...args: Parameters<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      return await callbackRef.current(...args);
    } catch (e: any) {
      const message = e.response?.data || e.message || "Произошла ошибка";
      setError(message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    execute,
    isLoading,
    error,
    reset: useCallback(() => {
      setError(null);
      setIsLoading(false);
    }, []),
  };
}
