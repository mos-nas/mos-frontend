// composables/useApi.ts
import { showSnackbarError, showSnackbarSuccess } from './snackbar';
import { useOverlay } from './useOverlay';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiCallOptions {
  method?: HttpMethod;
  body?: unknown;
  errorLabel: string;
  successLabel?: string;
}

interface ApiErrorResponse {
  error?: string;
}

export function useApi() {
  const { overlay } = useOverlay();

  const authHeaders = (json = false): Record<string, string> => ({
    Authorization: 'Bearer ' + localStorage.getItem('authToken'),
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  });

  const call = async <T = unknown>(url: string, options: ApiCallOptions): Promise<T | null> => {
    const { method = 'GET', body, errorLabel, successLabel } = options;

    overlay.value = true;
    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(!!body),
        ...(body ? { body: JSON.stringify(body) } : {}),
      });

      if (!res.ok) {
        const errorDetails: ApiErrorResponse = await res.json().catch(() => ({}));
        throw new Error(`${errorLabel}|$| ${errorDetails.error || 'unknown error'}`);
      }

      if (successLabel) showSnackbarSuccess(successLabel);

      return res.status === 204 ? null : ((await res.json()) as T);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      const [userMessage, apiErrorMessage] = message.split('|$|');
      showSnackbarError(userMessage, apiErrorMessage);
      throw e;
    } finally {
      overlay.value = false;
    }
  };

  return { call };
}