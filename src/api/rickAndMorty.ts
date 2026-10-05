import { apiClient } from './client';
import type {
  ApiCharacter,
  ApiEpisode,
  ApiPage,
  Character,
  Dataset,
  Episode,
  Place,
} from '../types';

// The API accepts comma-separated ids (e.g. /character/1,2,3), which lets us
// download the whole dataset in a handful of requests instead of one per page.
const IDS_PER_REQUEST = 200;

function idFromUrl(url: string): number | null {
  const match = /\/(\d+)\/?$/.exec(url);
  return match ? Number(match[1]) : null;
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

function toPlace(ref: { name: string; url: string }): Place {
  return { name: ref.name, id: ref.url ? idFromUrl(ref.url) : null };
}

export function normalizeCharacter(raw: ApiCharacter): Character {
  return {
    id: raw.id,
    name: raw.name,
    status: raw.status,
    species: raw.species,
    type: raw.type,
    gender: raw.gender,
    origin: toPlace(raw.origin),
    location: toPlace(raw.location),
    image: raw.image,
    episodeIds: raw.episode.map(idFromUrl).filter((id): id is number => id !== null),
    created: raw.created,
  };
}

export function normalizeEpisode(raw: ApiEpisode): Episode {
  const match = /S(\d+)E(\d+)/i.exec(raw.episode);
  return {
    id: raw.id,
    name: raw.name,
    airDate: raw.air_date,
    code: raw.episode,
    season: match ? Number(match[1]) : 0,
    number: match ? Number(match[2]) : 0,
  };
}

/** Fetches many resources by id; a single id returns an object, not an array. */
async function fetchByIds<T>(resource: string, ids: number[], signal?: AbortSignal): Promise<T[]> {
  const responses = await Promise.all(
    chunk(ids, IDS_PER_REQUEST).map((group) =>
      apiClient.get<T | T[]>(`/${resource}/${group.join(',')}`, { signal }),
    ),
  );
  return responses.flatMap(({ data }) => (Array.isArray(data) ? data : [data]));
}

async function fetchCount(resource: string, signal?: AbortSignal): Promise<number> {
  const { data } = await apiClient.get<ApiPage<unknown>>(`/${resource}`, { signal });
  return data.info.count;
}

export async function fetchDataset(signal?: AbortSignal): Promise<Dataset> {
  const [characterCount, episodeCount] = await Promise.all([
    fetchCount('character', signal),
    fetchCount('episode', signal),
  ]);

  const [rawCharacters, rawEpisodes] = await Promise.all([
    fetchByIds<ApiCharacter>('character', range(1, characterCount), signal),
    fetchByIds<ApiEpisode>('episode', range(1, episodeCount), signal),
  ]);

  return {
    characters: rawCharacters.map(normalizeCharacter).sort((a, b) => a.id - b.id),
    episodes: rawEpisodes.map(normalizeEpisode).sort((a, b) => a.id - b.id),
  };
}
