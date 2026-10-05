import type { Location } from 'react-router';
import type { BrowseState, EpisodeOrigin } from '../types';

export function createBrowseState(
  ids: number[],
  source: BrowseState['source'],
  location: Location,
): BrowseState {
  return { ids, source, backTo: location.pathname + location.search };
}

/** Router state is untyped and may be stale or hand-crafted, so validate it. */
export function readBrowseState(state: unknown, currentId: number): BrowseState | null {
  if (!state || typeof state !== 'object') return null;
  const candidate = state as Partial<BrowseState>;
  if (!Array.isArray(candidate.ids) || !candidate.ids.includes(currentId)) return null;
  if (candidate.source !== 'search' && candidate.source !== 'gallery' && candidate.source !== 'episode') return null;
  if (typeof candidate.backTo !== 'string') return null;
  return candidate as BrowseState;
}

export function readEpisodeOrigin(state: unknown): EpisodeOrigin | null {
  if (!state || typeof state !== 'object') return null;
  const from = (state as Partial<EpisodeOrigin>).fromCharacter;
  if (!from || typeof from.id !== 'number' || typeof from.name !== 'string') return null;
  return { fromCharacter: from };
}
