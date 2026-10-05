import type { Character, Episode } from '../types';

// ---------- Sorting (list view) ----------

export type SortKey = 'name' | 'id' | 'episodes' | 'species' | 'location';
export type SortOrder = 'asc' | 'desc';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'id', label: 'ID (debut order)' },
  { value: 'episodes', label: 'Episode count' },
  { value: 'species', label: 'Species' },
  { value: 'location', label: 'Last known location' },
];

const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });

const comparators: Record<SortKey, (a: Character, b: Character) => number> = {
  name: (a, b) => collator.compare(a.name, b.name),
  id: (a, b) => a.id - b.id,
  episodes: (a, b) => a.episodeIds.length - b.episodeIds.length,
  species: (a, b) => collator.compare(a.species, b.species),
  location: (a, b) => collator.compare(a.location.name, b.location.name),
};

export function sortCharacters(list: Character[], key: SortKey, order: SortOrder): Character[] {
  const compare = comparators[key];
  const direction = order === 'asc' ? 1 : -1;
  // Ties fall back to id so the order is stable and predictable.
  return [...list].sort((a, b) => (compare(a, b) || a.id - b.id) * direction);
}

export function isSortKey(value: string | null): value is SortKey {
  return value !== null && value in comparators;
}

// ---------- Search (list view) ----------

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesQuery(character: Character, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  return character.name.toLowerCase().includes(normalizedQuery);
}

// ---------- Gallery filters ----------

export interface GalleryFilters {
  status: string[];
  gender: string[];
  species: string[];
  season: string[];
  episode: string[];
}

export const EMPTY_FILTERS: GalleryFilters = { status: [], gender: [], species: [], season: [], episode: [] };

export const FILTER_KEYS = Object.keys(EMPTY_FILTERS) as (keyof GalleryFilters)[];

/**
 * Values within one group are OR-ed (Alive OR Dead), groups are AND-ed
 * (Alive AND Female). An empty group does not restrict anything.
 */
export function filterCharacters(
  list: Character[],
  filters: GalleryFilters,
  episodeById: Map<number, Episode>,
): Character[] {
  const seasons = new Set(filters.season.map(Number));
  const episodes = new Set(filters.episode.map(Number));

  return list.filter((c) => {
    if (filters.status.length && !filters.status.includes(c.status)) return false;
    if (filters.gender.length && !filters.gender.includes(c.gender)) return false;
    if (filters.species.length && !filters.species.includes(c.species)) return false;
    if (seasons.size && !c.episodeIds.some((id) => seasons.has(episodeById.get(id)?.season ?? -1))) {
      return false;
    }
    if (episodes.size && !c.episodeIds.some((id) => episodes.has(id))) return false;
    return true;
  });
}

export function countActiveFilters(filters: GalleryFilters): number {
  return FILTER_KEYS.reduce((total, key) => total + filters[key].length, 0);
}

/** Distinct values of a field, most common first, with their counts. */
export function tally<T extends string>(values: T[]): { value: T; count: number }[] {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || collator.compare(a.value, b.value));
}

// ---------- Display helpers ----------

export function firstEpisode(character: Character, episodeById: Map<number, Episode>): Episode | undefined {
  return character.episodeIds.length ? episodeById.get(character.episodeIds[0]) : undefined;
}

export function seasonLabel(season: number): string {
  return `Season ${season}`;
}
