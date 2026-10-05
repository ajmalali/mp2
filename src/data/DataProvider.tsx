import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import axios from 'axios';
import { describeError } from '../api/client';
import { readCache, writeCache } from '../api/cache';
import { fetchDataset } from '../api/rickAndMorty';
import type { Dataset } from '../types';
import { DataContext, type DataContextValue, type DataStatus } from './DataContext';

interface LoadState {
  status: DataStatus;
  data: Dataset | null;
  error: string | null;
  staleSince: number | null;
}

function initialState(): LoadState {
  const cached = readCache();
  if (cached?.isFresh) return { status: 'ready', data: cached.data, error: null, staleSince: null };
  return { status: 'loading', data: null, error: null, staleSince: null };
}

export default function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LoadState>(initialState);
  const [reloadToken, setReloadToken] = useState(0);
  const needsFetch = state.status === 'loading';

  useEffect(() => {
    if (!needsFetch) return;
    const controller = new AbortController();

    fetchDataset(controller.signal)
      .then((data) => {
        writeCache(data);
        setState({ status: 'ready', data, error: null, staleSince: null });
      })
      .catch((error: unknown) => {
        if (axios.isCancel(error)) return;
        // Fall back to an expired cache rather than showing nothing.
        const cached = readCache();
        if (cached) {
          setState({ status: 'ready', data: cached.data, error: null, staleSince: cached.savedAt });
        } else {
          setState({ status: 'error', data: null, error: describeError(error), staleSince: null });
        }
      });

    return () => controller.abort();
  }, [needsFetch, reloadToken]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    setReloadToken((token) => token + 1);
  }, []);

  const value = useMemo<DataContextValue>(() => {
    const characters = state.data?.characters ?? [];
    const episodes = state.data?.episodes ?? [];
    return {
      status: state.status,
      characters,
      episodes,
      characterById: new Map(characters.map((c) => [c.id, c])),
      episodeById: new Map(episodes.map((e) => [e.id, e])),
      error: state.error,
      staleSince: state.staleSince,
      reload,
    };
  }, [state, reload]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
