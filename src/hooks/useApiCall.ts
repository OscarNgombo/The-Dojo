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

        // If the API explicitly signals failure, throw an error.
        if (response.success === false) {
          throw new Error(response.message || 'API call failed');
        }

        // Extract data from various possible response structures.
        const responseData = (response as any).user || (response as any).records || response.data;

        // If we have data, the call was successful.
        if (responseData) {
          setState({ data: responseData, loading: false, error: null });
          return responseData;
        }

        // If there's no data but the call was explicitly successful (e.g., a successful DELETE request)
        if (response.success === true) {
          setState({ data: null, loading: false, error: null });
          return null;
        }

        // If none of the above, the response is unexpected.
        throw new Error(response.message || 'API call failed: Unexpected response structure');
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