import { useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import { useData } from '../../data/DataContext';
import PageHeader from '../../components/PageHeader/PageHeader';
import FilterGroup, { type FilterOption } from '../../components/FilterGroup/FilterGroup';
import EmptyState from '../../components/EmptyState/EmptyState';
import CharacterGrid from '../../components/CharacterGrid/CharacterGrid';
import {
  FILTER_KEYS,
  countActiveFilters,
  filterCharacters,
  seasonLabel,
  tally,
  type GalleryFilters,
} from '../../utils/characters';
import { readList, toggleValue, writeList } from '../../utils/searchParams';
import { createBrowseState } from '../../utils/browse';
import styles from './GalleryPage.module.css';

const STATUS_ORDER = ['Alive', 'Dead', 'unknown'];
const GENDER_ORDER = ['Female', 'Male', 'Genderless', 'unknown'];

const prettify = (value: string) => (value === 'unknown' ? 'Unknown' : value);

function withCounts(order: string[], counts: Map<string, number>): FilterOption[] {
  return order.map((value) => ({ value, label: prettify(value), count: counts.get(value) ?? 0 }));
}

export default function GalleryPage() {
  const { characters, episodes, episodeById } = useData();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = useMemo<GalleryFilters>(() => {
    const entries = FILTER_KEYS.map((key) => [key, readList(searchParams, key)] as const);
    return Object.fromEntries(entries) as unknown as GalleryFilters;
  }, [searchParams]);

  // Option lists (with how many characters have each value) come from the data itself.
  const options = useMemo(() => {
    const statusCounts = new Map(tally(characters.map((c) => c.status)).map((t) => [t.value as string, t.count]));
    const genderCounts = new Map(tally(characters.map((c) => c.gender)).map((t) => [t.value as string, t.count]));

    const species: FilterOption[] = tally(characters.map((c) => c.species)).map((t) => ({
      value: t.value,
      label: prettify(t.value),
      count: t.count,
    }));

    const seasonCounts = new Map<number, number>();
    for (const c of characters) {
      const seasons = new Set(c.episodeIds.map((id) => episodeById.get(id)?.season ?? 0));
      for (const season of seasons) seasonCounts.set(season, (seasonCounts.get(season) ?? 0) + 1);
    }
    const seasons: FilterOption[] = [...new Set(episodes.map((e) => e.season))]
      .sort((a, b) => a - b)
      .map((season) => ({ value: String(season), label: seasonLabel(season), count: seasonCounts.get(season) ?? 0 }));

    return {
      status: withCounts(STATUS_ORDER, statusCounts),
      gender: withCounts(GENDER_ORDER, genderCounts),
      species,
      season: seasons,
    };
  }, [characters, episodes, episodeById]);

  const results = useMemo(
    () => filterCharacters(characters, filters, episodeById),
    [characters, filters, episodeById],
  );

  const browseState = useMemo(
    () => createBrowseState(results.map((c) => c.id), 'gallery', location),
    [results, location],
  );

  const activeCount = countActiveFilters(filters);

  const setFilter = (key: keyof GalleryFilters, values: string[]) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        writeList(next, key, values);
        return next;
      },
      { replace: true },
    );
  };

  const toggle = (key: keyof GalleryFilters) => (value: string) => setFilter(key, toggleValue(filters[key], value));

  const clearAll = () => setSearchParams({}, { replace: true });

  const selectedEpisodes = filters.episode
    .map((id) => episodeById.get(Number(id)))
    .filter((e): e is NonNullable<typeof e> => e !== undefined);

  return (
    <section>
      <PageHeader eyebrow="Gallery view" title="Portrait gallery">
        Mix and match filters to narrow the crowd. Options in the same group widen the results (Alive{' '}
        <em>or</em> Dead); different groups narrow them (Alive <em>and</em> Female).
      </PageHeader>

      <div className={styles.layout}>
        <button
          type="button"
          className={styles.filtersToggle}
          aria-expanded={filtersOpen}
          aria-controls="gallery-filters"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          {filtersOpen ? 'Hide filters' : 'Show filters'}
          {activeCount > 0 && <span className={styles.toggleBadge}>{activeCount}</span>}
        </button>

        <aside
          id="gallery-filters"
          className={`${styles.sidebar} ${filtersOpen ? styles.sidebarOpen : ''}`}
          aria-label="Gallery filters"
        >
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Filters</h2>
            <button type="button" className={styles.clearButton} onClick={clearAll} disabled={activeCount === 0}>
              Clear all
            </button>
          </div>

          <FilterGroup title="Status" options={options.status} selected={filters.status} onToggle={toggle('status')} />
          <FilterGroup title="Gender" options={options.gender} selected={filters.gender} onToggle={toggle('gender')} />
          <FilterGroup title="Season" options={options.season} selected={filters.season} onToggle={toggle('season')} />

          <fieldset className={styles.episodeGroup}>
            <legend className={styles.episodeLegend}>Appears in episode</legend>
            <select
              className={styles.select}
              value=""
              aria-label="Add an episode filter"
              onChange={(e) => e.target.value && setFilter('episode', [...filters.episode, e.target.value])}
            >
              <option value="">Add an episode…</option>
              {episodes
                .filter((e) => !filters.episode.includes(String(e.id)))
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.code} · {e.name}
                  </option>
                ))}
            </select>
            {selectedEpisodes.length > 0 && (
              <ul className={styles.episodeChips}>
                {selectedEpisodes.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      className={styles.episodeChip}
                      onClick={() => toggle('episode')(String(e.id))}
                      aria-label={`Remove ${e.code} ${e.name}`}
                    >
                      <span className={styles.episodeCode}>{e.code}</span>
                      {e.name}
                      <span aria-hidden="true">×</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>

          <FilterGroup
            title="Species"
            options={options.species}
            selected={filters.species}
            onToggle={toggle('species')}
          />
        </aside>

        <div className={styles.content}>
          <p className={styles.summary} aria-live="polite">
            <strong>{results.length}</strong> of {characters.length} characters
            {activeCount > 0 && ` · ${activeCount} ${activeCount === 1 ? 'filter' : 'filters'} active`}
          </p>

          {results.length === 0 ? (
            <EmptyState title="Nobody fits all of those filters.">
              <p>Try removing a filter or two.</p>
              <button type="button" onClick={clearAll}>
                Clear all filters
              </button>
            </EmptyState>
          ) : (
            <CharacterGrid characters={results} browseState={browseState} />
          )}
        </div>
      </div>
    </section>
  );
}
