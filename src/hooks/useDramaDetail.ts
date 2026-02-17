import { useQuery } from "@tanstack/react-query";
import type { DramaDetailResponse, Episode } from "@/types/drama";
import type { SupportedLanguage } from "@/types/language";

const API_BASE = "/api/dramabox";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ===========================================
// FIX 2.2: Retry Logic with Exponential Backoff
// Retry wrapper for handling transient failures (504, timeout, etc.)
// ===========================================
async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetcher();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = baseDelay * Math.pow(2, attempt);

      // Log retry for debugging
      console.warn(
        `[fetchWithRetry] Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms:`,
        error instanceof Error ? error.message : error
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

async function fetchDramaDetail(bookId: string, lang?: SupportedLanguage): Promise<DramaDetailResponse> {
  const url = lang
    ? `${API_BASE}/detail/${bookId}?lang=${lang}`
    : `${API_BASE}/detail/${bookId}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch drama detail: ${response.status} ${response.statusText}`);
  }
  const result: ApiResponse<DramaDetailResponse> = await response.json();
  return result.data;
}

async function fetchAllEpisodes(bookId: string, lang?: SupportedLanguage): Promise<Episode[]> {
  const url = lang
    ? `${API_BASE}/allepisode/${bookId}?lang=${lang}`
    : `${API_BASE}/allepisode/${bookId}`;

  const response = await fetch(url);

  // Handle 503 Service Unavailable (upstream timeout)
  if (response.status === 503) {
    const errorData = await response.json().catch(() => ({}));
    if (errorData.error === 'upstream_timeout') {
      throw new Error('Upstream timeout - please try again later');
    }
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch episodes: ${response.status} ${response.statusText}`);
  }

  const result: ApiResponse<Episode[]> = await response.json();
  return result.data;
}

export function useDramaDetail(bookId: string, lang?: SupportedLanguage) {
  return useQuery({
    queryKey: ["drama", "detail", bookId, lang],
    queryFn: () => fetchDramaDetail(bookId, lang),
    enabled: !!bookId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1, // Retry once on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}

export function useEpisodes(bookId: string, lang?: SupportedLanguage) {
  return useQuery({
    queryKey: ["drama", "episodes", bookId, lang],
    // ===========================================
    // FIX 2.2: Use fetchWithRetry for exponential backoff
    // Combined with React Query built-in retry for double protection
    // ===========================================
    queryFn: () =>
      fetchWithRetry(
        () => fetchAllEpisodes(bookId, lang),
        2, // 2 retries (total 3 attempts)
        1000 // 1s base delay → 1s, 2s, 4s intervals
      ),
    enabled: !!bookId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // React Query built-in retry (extra layer of protection)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
