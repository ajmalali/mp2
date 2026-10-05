// ---- Raw shapes returned by https://rickandmortyapi.com/api ----

export type CharacterStatus = 'Alive' | 'Dead' | 'unknown';
export type CharacterGender = 'Female' | 'Male' | 'Genderless' | 'unknown';

export interface ApiInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

export interface ApiPage<T> {
  info: ApiInfo;
  results: T[];
}

export interface ApiResourceRef {
  name: string;
  url: string;
}

export interface ApiCharacter {
  id: number;
  name: string;
  status: CharacterStatus;
  species: string;
  type: string;
  gender: CharacterGender;
  origin: ApiResourceRef;
  location: ApiResourceRef;
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface ApiEpisode {
  id: number;
  name: string;
  air_date: string;
  episode: string; // e.g. "S01E01"
  characters: string[];
  url: string;
  created: string;
}

// ---- Normalized shapes used throughout the app ----
// URLs are reduced to numeric ids so the cached dataset stays small.

export interface Place {
  id: number | null;
  name: string;
}

export interface Character {
  id: number;
  name: string;
  status: CharacterStatus;
  species: string;
  type: string;
  gender: CharacterGender;
  origin: Place;
  location: Place;
  image: string;
  episodeIds: number[];
  created: string;
}

export interface Episode {
  id: number;
  name: string;
  airDate: string;
  code: string; // "S01E01"
  season: number;
  number: number;
}

export interface Dataset {
  characters: Character[];
  episodes: Episode[];
}

// ---- Extra episode details from TVmaze (https://www.tvmaze.com/api) ----

export interface TvEpisode {
  tvmazeUrl: string;
  name: string;
  airDate: string; // ISO yyyy-mm-dd
  runtime: number | null;
  rating: number | null;
  image: string | null;
  summary: string; // HTML from TVmaze; converted to text before rendering
}

export interface ShowExtras {
  tvmazeUrl: string;
  imdbId: string | null;
  network: string | null;
  /** Keyed by "S01E01" so it lines up with the Rick and Morty API's episode codes. */
  episodesByCode: Record<string, TvEpisode>;
}

/**
 * Passed through router location state when opening a detail page, so the
 * PREVIOUS / NEXT buttons cycle through exactly the list the user came from.
 */
export interface BrowseState {
  ids: number[];
  source: 'search' | 'gallery' | 'episode';
  backTo: string;
}

/** Router state for an episode page opened from a character page. */
export interface EpisodeOrigin {
  fromCharacter: { id: number; name: string };
}
