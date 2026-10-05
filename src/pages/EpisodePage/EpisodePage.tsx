import { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { useData } from '../../data/DataContext';
import { useShowExtras } from '../../hooks/useShowExtras';
import EmptyState from '../../components/EmptyState/EmptyState';
import CharacterImage from '../../components/CharacterImage/CharacterImage';
import CharacterGrid from '../../components/CharacterGrid/CharacterGrid';
import { createBrowseState, readEpisodeOrigin } from '../../utils/browse';
import { htmlToParagraphs } from '../../utils/html';
import type { Episode } from '../../types';
import styles from './EpisodePage.module.css';

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

export default function EpisodePage() {
  const { id: idParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { characters, episodes, episodeById } = useData();
  const extras = useShowExtras();

  const id = Number(idParam);
  const episode = episodeById.get(id);
  const origin = readEpisodeOrigin(location.state);

  // Everyone who appears in this episode, in the API's id (debut) order.
  const cast = useMemo(() => characters.filter((c) => c.episodeIds.includes(id)), [characters, id]);
  const browseState = useMemo(
    () => createBrowseState(cast.map((c) => c.id), 'episode', location),
    [cast, location],
  );

  // PREVIOUS / NEXT cycle through every episode in airing order.
  const index = episodes.findIndex((e) => e.id === id);
  const prev = index === -1 ? undefined : episodes[(index - 1 + episodes.length) % episodes.length];
  const next = index === -1 ? undefined : episodes[(index + 1) % episodes.length];
  const canCycle = episodes.length > 1 && prev !== undefined && next !== undefined;

  const tv = episode ? extras.data?.episodesByCode[episode.code.toUpperCase()] : undefined;
  const summary = useMemo(() => (tv ? htmlToParagraphs(tv.summary) : []), [tv]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!canCycle || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      const target = event.key === 'ArrowLeft' ? prev : event.key === 'ArrowRight' ? next : undefined;
      if (target) navigate(`/episode/${target.id}`, { state: location.state, replace: true });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canCycle, prev, next, location.state, navigate]);

  useEffect(() => {
    document.title = episode ? `${episode.code} ${episode.name} · Rick & Morty Explorer` : 'Rick & Morty Explorer';
    return () => {
      document.title = 'Rick & Morty Explorer';
    };
  }, [episode]);

  if (!episode) {
    return (
      <EmptyState title="That episode never aired in this dimension.">
        <p>No episode with id “{idParam}” exists.</p>
        <Link to="/search" className={styles.inlineLink}>
          Go to search
        </Link>
      </EmptyState>
    );
  }

  const goBack = () => {
    // Prev/next use `replace`, so the character page is exactly one entry back.
    if (origin) navigate(-1);
    else navigate('/search');
  };

  return (
    <article className={styles.page}>
      <div className={styles.topBar}>
        <button type="button" className={styles.backButton} onClick={goBack}>
          <span aria-hidden="true">←</span>{' '}
          {origin ? `Back to ${origin.fromCharacter.name}` : 'Search characters'}
        </button>
        {index !== -1 && (
          <span className={styles.position}>
            Episode {index + 1} <span className={styles.positionOf}>of</span> {episodes.length}
          </span>
        )}
      </div>

      <div className={styles.hero}>
        <div className={styles.screen}>
          {extras.status === 'loading' ? (
            <span className={styles.screenLoading} role="status" aria-label="Loading episode still" />
          ) : (
            <CharacterImage
              key={episode.id}
              className={styles.still}
              src={tv?.image ?? ''}
              alt={`Still from ${episode.name}`}
              size="lg"
              loading="eager"
              width={1280}
              height={720}
            />
          )}
          <span className={styles.screenCode}>{episode.code}</span>
        </div>

        <div className={styles.info}>
          <p className={styles.eyebrow}>
            Season {episode.season} · Episode {episode.number}
          </p>
          <h1 className={styles.title}>{episode.name}</h1>

          <ul className={styles.meta}>
            <li className={styles.metaItem}>
              <span className={styles.metaLabel}>Aired</span>
              <span>{episode.airDate}</span>
            </li>
            {tv?.runtime != null && (
              <li className={styles.metaItem}>
                <span className={styles.metaLabel}>Runtime</span>
                <span>{tv.runtime} min</span>
              </li>
            )}
            {tv?.rating != null && (
              <li className={`${styles.metaItem} ${styles.rating}`}>
                <span className={styles.metaLabel}>Rating</span>
                <span>
                  <span aria-hidden="true">★</span> {tv.rating.toFixed(1)}{' '}
                  <span className={styles.ratingMax}>/ 10</span>
                </span>
              </li>
            )}
            <li className={styles.metaItem}>
              <span className={styles.metaLabel}>Characters</span>
              <span>{cast.length}</span>
            </li>
          </ul>

          <div className={styles.summary}>
            {extras.status === 'loading' && (
              <div className={styles.summaryLoading} role="status" aria-label="Loading episode summary">
                <span />
                <span />
                <span />
              </div>
            )}
            {extras.status === 'error' && (
              <div className={styles.notice} role="alert">
                <p>Couldn't load the episode summary. {extras.error}</p>
                <button type="button" onClick={extras.retry}>
                  Try again
                </button>
              </div>
            )}
            {extras.status === 'ready' &&
              (summary.length ? (
                summary.map((paragraph, i) => <p key={i}>{paragraph}</p>)
              ) : (
                <p className={styles.muted}>No summary is available for this episode yet.</p>
              ))}
          </div>

          {extras.status === 'ready' && (
            <div className={styles.links}>
              {tv && (
                <a className={styles.externalLink} href={tv.tvmazeUrl} target="_blank" rel="noreferrer">
                  View on TVmaze <span aria-hidden="true">↗</span>
                </a>
              )}
              {extras.data?.imdbId && (
                <a
                  className={`${styles.externalLink} ${styles.imdb}`}
                  href={`https://www.imdb.com/title/${extras.data.imdbId}/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Rick and Morty on IMDb <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          )}
          <p className={styles.credit}>
            Summary, still and rating from{' '}
            <a href="https://www.tvmaze.com/" target="_blank" rel="noreferrer">
              TVmaze
            </a>{' '}
            (CC BY-SA).
          </p>
        </div>
      </div>

      {canCycle && (
        <nav className={styles.pager} aria-label="Cycle through episodes">
          <EpisodeLink direction="prev" episode={prev} state={location.state} />
          <p className={styles.pagerHint}>
            Use <kbd>←</kbd> <kbd>→</kbd> to cycle
          </p>
          <EpisodeLink direction="next" episode={next} state={location.state} />
        </nav>
      )}

      <section className={styles.cast} aria-labelledby="cast-heading">
        <div className={styles.castHeader}>
          <h2 id="cast-heading" className={styles.sectionTitle}>
            Characters in this episode
          </h2>
          <span className={styles.castCount}>{cast.length}</span>
        </div>
        <p className={styles.sectionHint}>Select a character to see their details.</p>
        {cast.length ? (
          <CharacterGrid characters={cast} browseState={browseState} />
        ) : (
          <EmptyState title="Nobody showed up for this one." />
        )}
      </section>
    </article>
  );
}

interface EpisodeLinkProps {
  direction: 'prev' | 'next';
  episode: Episode;
  state: unknown;
}

function EpisodeLink({ direction, episode, state }: EpisodeLinkProps) {
  const isPrev = direction === 'prev';
  return (
    <Link
      to={`/episode/${episode.id}`}
      state={state}
      replace
      className={`${styles.neighbor} ${isPrev ? styles.neighborPrev : styles.neighborNext}`}
      aria-label={`${isPrev ? 'Previous' : 'Next'} episode: ${episode.code} ${episode.name}`}
    >
      <span className={styles.arrow} aria-hidden="true">
        {isPrev ? '←' : '→'}
      </span>
      <span className={styles.neighborText}>
        <span className={styles.neighborLabel}>
          {isPrev ? 'Previous' : 'Next'} · {episode.code}
        </span>
        <span className={styles.neighborName}>{episode.name}</span>
      </span>
    </Link>
  );
}
