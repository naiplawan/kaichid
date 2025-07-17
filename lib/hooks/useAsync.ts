import { useState, useEffect, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

type AsyncFunction<T> = () => Promise<T>;

export function useAsync<T>(
  asyncFunction: AsyncFunction<T>,
  dependencies: any[] = []
): AsyncState<T> & { retry: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    retry: execute,
  };
}

export function useAsyncCallback<T>(
  asyncFunction: AsyncFunction<T>
): AsyncState<T> & { execute: () => Promise<void> } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }, [asyncFunction]);

  return {
    ...state,
    execute,
  };
}