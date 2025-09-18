import { useState, useCallback } from 'react';
import type { ApiResponse } from '../types';

interface UseApiCallState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * A custom hook for handling API calls with loading and error states
 */
export const useApiCall = <T>() => {
  const [state, setState] = useState<UseApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  /**
   * Execute an API call and handle its states
   */
  const execute = useCallback(
    async (apiCall: () => Promise<ApiResponse<T>>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiCall();
        if (response.success) {
          setState({ data: response.data, loading: false, error: null });
          return response.data;
        } else {
          throw new Error(response.message || 'API call failed');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setState({ data: null, loading: false, error: errorMessage });
        throw error;
      }
    },
    [],
  );

  return { ...state, execute };
};