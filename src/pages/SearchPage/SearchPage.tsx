import { useDeferredValue, useMemo, useRef, type ChangeEvent } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { useData } from '../../data/DataContext';
import PageHeader from '../../components/PageHeader/PageHeader';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import EmptyState from '../../components/EmptyState/EmptyState';
import HighlightedText from '../../components/HighlightedText/HighlightedText';
import CharacterImage from '../../components/CharacterImage/CharacterImage';
import {
  SORT_OPTIONS,
  isSortKey,
  matchesQuery,
  normalizeQuery,
  sortCharacters,
  type SortKey,
  type SortOrder,
} from '../../utils/characters';
import { createBrowseState } from '../../utils/browse';
import styles from './SearchPage.module.css';

export default function SearchPage() {
  const { characters } = useData();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const query = searchParams.get('q') ?? '';
  const sortParam = searchParams.get('sort');
  const sortKey: SortKey = isSortKey(sortParam) ? sortParam : 'name';
  const order: SortOrder = searchParams.get('order') === 'desc' ? 'desc' : 'asc';

  // Typing stays instant; filtering the list can lag a frame behind if needed.
  const deferredQuery = useDeferredValue(query);
  const normalized = normalizeQuery(deferredQuery);

  const results = useMemo(
    () => sortCharacters(characters.filter((c) => matchesQuery(c, normalized)), sortKey, order),
    [characters, normalized, sortKey, order],
  );

  const browseState = useMemo(
    () => createBrowseState(results.map((c) => c.id), 'search', location),
    [results, location],
  );

  const updateParam = (key: string, value: string, fallback: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value && value !== fallback) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  };

  const clearQuery = () => {
    updateParam('q', '', '');
    inputRef.current?.focus();
  };

  return (
    <section>
      <PageHeader eyebrow="List view" title="Search the multiverse">
        Find any of the {characters.length} characters by name. Results update as you type, and you can
        sort them however you like.
      </PageHeader>

      <div className={styles.toolbar}>
        <div className={styles.searchField}>
          <label htmlFor="character-search" className="visually-hidden">
            Search characters by name
          </label>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            id="character-search"
            className={styles.searchInput}
            type="search"
            placeholder="Try “Rick”, “Morty” or “Squanchy”…"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) => updateParam('q', e.target.value, '')}
          />
          {query && (
            <button type="button" className={styles.clearButton} onClick={clearQuery} aria-label="Clear search">
              ×
            </button>
          )}
        </div>

        <div className={styles.sortControls}>
          <label className={styles.sortLabel} htmlFor="sort-key">
            Sort by
          </label>
          <select
            id="sort-key"
            className={styles.select}
            value={sortKey}
            onChange={(e) => updateParam('sort', e.target.value, 'name')}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className={styles.segmented} role="group" aria-label="Sort order">
            <button
              type="button"
              className={styles.segment}
              aria-pressed={order === 'asc'}
              onClick={() => updateParam('order', 'asc', 'asc')}
            >
              <span aria-hidden="true">↑</span> Asc
            </button>
            <button
              type="button"
              className={styles.segment}
              aria-pressed={order === 'desc'}
              onClick={() => updateParam('order', 'desc', 'asc')}
            >
              <span aria-hidden="true">↓</span> Desc
            </button>
          </div>
        </div>
      </div>

      <p className={styles.summary} aria-live="polite">
        {normalized ? (
          <>
            <strong>{results.length}</strong> of {characters.length} characters match “{deferredQuery.trim()}”
          </>
        ) : (
          <>
            Showing all <strong>{characters.length}</strong> characters
          </>
        )}
      </p>

      {results.length === 0 ? (
        <EmptyState title="No one by that name in this dimension.">
          <p>Check the spelling or try a shorter search.</p>
          <button type="button" onClick={clearQuery}>
            Clear search
          </button>
        </EmptyState>
      ) : (
        <ol className={styles.list}>
          {results.map((c) => (
            <li key={c.id} className={styles.item}>
              <Link to={`/character/${c.id}`} state={browseState} className={styles.row}>
                <CharacterImage className={styles.thumb} src={c.image} alt="" size="sm" width={64} height={64} />
                <div className={styles.primary}>
                  <span className={styles.name}>
                    <HighlightedText text={c.name} query={normalized} />
                  </span>
                  <span className={styles.meta}>
                    {c.species}
                    {c.type && ` · ${c.type}`} · {c.gender === 'unknown' ? 'Unknown gender' : c.gender}
                  </span>
                </div>
                <div className={styles.secondary}>
                  <span className={styles.fieldLabel}>Last known location</span>
                  <span className={styles.fieldValue}>{c.location.name}</span>
                </div>
                <div className={styles.stats}>
                  <StatusBadge status={c.status} />
                  <span className={styles.episodes}>
                    {c.episodeIds.length} {c.episodeIds.length === 1 ? 'episode' : 'episodes'}
                  </span>
                </div>
                <span className={styles.chevron} aria-hidden="true">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
