import axios from 'axios';
import type { ShowExtras, TvEpisode } from '../types';

// TVmaze is a free, keyless TV database (data licensed CC BY-SA, attribution
// required). IMDb has no free public API, but TVmaze links to the IMDb page.
const TVMAZE_BASE_URL = 'https://api.tvmaze.com';
const RICK_AND_MORTY_SHOW_ID = 216;

const CACHE_KEY = 'rm-explorer:tvmaze:v1';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const tvmazeClient = axios.create({ baseURL: TVMAZE_BASE_URL, timeout: 15000 });

interface RawTvEpisode {
  url: string;
  name: string;
  season: number;
  number: number | null;
  airdate: string;
  runtime: number | null;
  rating: { average: number | null } | null;
  image: { medium: string; original: string } | null;
  summary: string | null;
}

interface RawShow {
  url: string;
  externals: { imdb: string | null } | null;
  network: { name: string } | null;
  _embedded: { episodes: RawTvEpisode[] };
}

export function episodeCode(season: number, number: number): string {
  return `S${String(season).padStart(2, '0')}E${String(number).padStart(2, '0')}`;
}

function normalizeEpisode(raw: RawTvEpisode): TvEpisode {
  return {
    tvmazeUrl: raw.url,
    name: raw.name,
    airDate: raw.airdate,
    runtime: raw.runtime,
    rating: raw.rating?.average ?? null,
    image: raw.image?.original ?? raw.image?.medium ?? null,
    summary: raw.summary ?? '',
  };
}

function normalizeShow(raw: RawShow): ShowExtras {
  const episodesByCode: Record<string, TvEpisode> = {};
  for (const episode of raw._embedded.episodes) {
    if (episode.number === null) continue; // specials have no episode number
    episodesByCode[episodeCode(episode.season, episode.number)] = normalizeEpisode(episode);
  }
  return {
    tvmazeUrl: raw.url,
    imdbId: raw.externals?.imdb ?? null,
    network: raw.network?.name ?? null,
    episodesByCode,
  };
}

function readCache(): ShowExtras | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as { savedAt: number; data: ShowExtras };
    if (Date.now() - entry.savedAt > MAX_AGE_MS || !entry.data?.episodesByCode) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function writeCache(data: ShowExtras): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Caching is an optimization; ignore quota/storage errors.
  }
}

/** All episodes in a single request; cached for a week. */
export async function fetchShowExtras(): Promise<ShowExtras> {
  const cached = readCache();
  if (cached) return cached;
  const { data } = await tvmazeClient.get<RawShow>(`/shows/${RICK_AND_MORTY_SHOW_ID}`, {
    params: { embed: 'episodes' },
  });
  const extras = normalizeShow(data);
  writeCache(extras);
  return extras;
}
