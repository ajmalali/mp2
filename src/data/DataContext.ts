import { createContext, useContext } from 'react';
import type { Character, Episode } from '../types';

export type DataStatus = 'loading' | 'ready' | 'error';

export interface DataContextValue {
  status: DataStatus;
  characters: Character[];
  episodes: Episode[];
  characterById: Map<number, Character>;
  episodeById: Map<number, Episode>;
  /** Set when the API failed to load and the error is shown instead of data. */
  error: string | null;
  /** Set when the API failed but older cached data is being shown. */
  staleSince: number | null;
  reload: () => void;
}

export const DataContext = createContext<DataContextValue | null>(null);

export function useData(): DataContextValue {
  const value = useContext(DataContext);
  if (!value) throw new Error('useData must be used inside <DataProvider>');
  return value;
}
