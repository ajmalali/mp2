import { useCallback, useEffect, useState } from 'react';
import { describeError } from '../api/client';
import { fetchShowExtras } from '../api/tvmaze';
import type { ShowExtras } from '../types';

type Status = 'loading' | 'ready' | 'error';

interface State {
  status: Status;
  data: ShowExtras | null;
  error: string | null;
}

// Shared across every episode page so cycling episodes doesn't refetch.
let pending: Promise<ShowExtras> | null = null;
let resolved: ShowExtras | null = null;

function load(): Promise<ShowExtras> {
  pending ??= fetchShowExtras()
    .then((data) => {
      resolved = data;
      return data;
    })
    .catch((error: unknown) => {
      pending = null; // allow a retry
      throw error;
    });
  return pending;
}

/**
 * Loads the supplementary TVmaze data on demand. The episode page works
 * without it (core data comes from the Rick and Morty API), so failures are
 * reported but never block the page.
 */
export function useShowExtras() {
  const [state, setState] = useState<State>(() =>
    resolved ? { status: 'ready', data: resolved, error: null } : { status: 'loading', data: null, error: null },
  );

  useEffect(() => {
    if (state.status !== 'loading') return;
    let active = true;
    load()
      .then((data) => active && setState({ status: 'ready', data, error: null }))
      .catch(
        (error: unknown) => active && setState({ status: 'error', data: null, error: describeError(error, 'TVmaze') }),
      );
    return () => {
      active = false;
    };
  }, [state.status]);

  const retry = useCallback(() => setState({ status: 'loading', data: null, error: null }), []);

  return { ...state, retry };
}
