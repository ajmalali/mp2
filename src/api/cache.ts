import type { Dataset } from '../types';

// Caching the full dataset keeps us well under the API's rate limits and makes
// repeat visits instant. Bump the version whenever the normalized shape changes.
const CACHE_KEY = 'rm-explorer:dataset:v1';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface CacheEntry {
  savedAt: number;
  data: Dataset;
}

export interface CachedDataset {
  data: Dataset;
  isFresh: boolean;
  savedAt: number;
}

export function readCache(): CachedDataset | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (!entry?.data?.characters?.length || !Array.isArray(entry.data.episodes)) return null;
    return {
      data: entry.data,
      savedAt: entry.savedAt,
      isFresh: Date.now() - entry.savedAt < MAX_AGE_MS,
    };
  } catch {
    // Storage blocked (private mode) or corrupted JSON: behave as if empty.
    return null;
  }
}

export function writeCache(data: Dataset): void {
  try {
    const entry: CacheEntry = { savedAt: Date.now(), data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Quota exceeded or storage blocked: caching is an optimization, so ignore.
  }
}

export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}
