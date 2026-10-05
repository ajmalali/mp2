import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = 'https://rickandmortyapi.com/api';

const MAX_RETRIES = 2;

interface RetryableConfig extends InternalAxiosRequestConfig {
  retryCount?: number;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

function isRetryable(error: AxiosError): boolean {
  if (!error.response) return error.code !== 'ERR_CANCELED'; // network error / timeout
  const { status } = error.response;
  return status === 429 || status >= 500;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry transient failures (network blips, rate limiting, 5xx) with backoff.
apiClient.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetryableConfig | undefined;
  if (!config || !isRetryable(error)) throw error;

  config.retryCount = (config.retryCount ?? 0) + 1;
  if (config.retryCount > MAX_RETRIES) throw error;

  const retryAfter = Number(error.response?.headers['retry-after']);
  const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** config.retryCount;
  await wait(delay);
  return apiClient.request(config);
});

/** Turns any thrown value into a message that is safe to show to the user. */
export function describeError(error: unknown, service = 'the Rick and Morty API'): string {
  const Service = service.charAt(0).toUpperCase() + service.slice(1);
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return `The request to ${service} timed out. It might be slow right now.`;
    if (!error.response) return `Could not reach ${service}. Check your connection.`;
    const { status } = error.response;
    if (status === 404) return `That resource does not exist in ${service}.`;
    if (status === 429) return `Too many requests. ${Service} is rate limiting us, so try again in a moment.`;
    if (status >= 500) return `${Service} is having trouble (HTTP ${status}).`;
    return `Request failed with HTTP ${status}.`;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong.';
}
