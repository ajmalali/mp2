import { useEffect, useMemo, type ComponentType } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { useData } from '../../data/DataContext';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import EmptyState from '../../components/EmptyState/EmptyState';
import Portal from '../../components/Portal/Portal';
import CharacterImage from '../../components/CharacterImage/CharacterImage';
import { DnaIcon, FilmIcon, GenderIcon, PinIcon, PlanetIcon, TvIcon } from '../../components/Icons/Icons';
import { readBrowseState } from '../../utils/browse';
import { firstEpisode, seasonLabel } from '../../utils/characters';
import type { BrowseState, Character, Episode, EpisodeOrigin } from '../../types';
import styles from './CharacterPage.module.css';

const SOURCE_LABELS: Record<BrowseState['source'] | 'all', string> = {
  search: 'Back to search results',
  gallery: 'Back to gallery',
  episode: 'Back to episode',
  all: 'Browse all characters',
};

const prettify = (value: string) => (value === 'unknown' ? 'Unknown' : value);

function groupBySeason(episodes: Episode[]): [number, Episode[]][] {
  const groups = new Map<number, Episode[]>();
  for (const episode of episodes) {
    const group = groups.get(episode.season) ?? [];
    group.push(episode);
    groups.set(episode.season, group);
  }
  return [...groups.entries()].sort(([a], [b]) => a - b);
}

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

export default function CharacterPage() {
  const { id: idParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { characters, characterById, episodeById } = useData();

  const id = Number(idParam);
  const character = characterById.get(id);

  // The list to cycle through: whatever the user was looking at, or everyone
  // (in id order) when the page was opened directly from a URL.
  const browse = readBrowseState(location.state, id);
  const ids = useMemo(() => browse?.ids ?? characters.map((c) => c.id), [browse?.ids, characters]);
  const index = ids.indexOf(id);
  const prev = index === -1 ? undefined : characterById.get(ids[(index - 1 + ids.length) % ids.length]);
  const next = index === -1 ? undefined : characterById.get(ids[(index + 1) % ids.length]);
  const canCycle = ids.length > 1 && prev !== undefined && next !== undefined;

  const linkState = browse ?? undefined;

  // Keyboard shortcuts: ← / → cycle, Esc goes back.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      if (canCycle && event.key === 'ArrowLeft') {
        navigate(`/character/${prev.id}`, { state: linkState, replace: true });
      } else if (canCycle && event.key === 'ArrowRight') {
        navigate(`/character/${next.id}`, { state: linkState, replace: true });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canCycle, prev, next, linkState, navigate]);

  // Warm the browser cache so cycling feels instant.
  useEffect(() => {
    for (const neighbor of [prev, next]) {
      if (neighbor) new Image().src = neighbor.image;
    }
  }, [prev, next]);

  useEffect(() => {
    document.title = character ? `${character.name} · Rick & Morty Explorer` : 'Rick & Morty Explorer';
    return () => {
      document.title = 'Rick & Morty Explorer';
    };
  }, [character]);

  if (!character) {
    return (
      <EmptyState title="That character has slipped into another dimension.">
        <p>No character with id “{idParam}” exists.</p>
        <Link to="/search" className={styles.inlineLink}>
          Go to search
        </Link>
      </EmptyState>
    );
  }

  const goBack = () => {
    // Prev/next use `replace`, so the list is always exactly one entry back.
    if (browse) navigate(-1);
    else navigate('/search');
  };

  const characterEpisodes = character.episodeIds
    .map((episodeId) => episodeById.get(episodeId))
    .filter((e): e is Episode => e !== undefined);
  const debut = firstEpisode(character, episodeById);
  const episodeOrigin: EpisodeOrigin = { fromCharacter: { id: character.id, name: character.name } };

  return (
    <article className={styles.page}>
      <div className={styles.topBar}>
        <button type="button" className={styles.backButton} onClick={goBack}>
          <span aria-hidden="true">←</span> {SOURCE_LABELS[browse?.source ?? 'all']}
        </button>
        {index !== -1 && (
          <span className={styles.position}>
            {index + 1} <span className={styles.positionOf}>of</span> {ids.length}
          </span>
        )}
      </div>

      <div className={styles.hero}>
        <div className={styles.portraitStage}>
          {/* Keyed so the portal "re-opens" each time you cycle to a new character. */}
          <Portal key={character.id} className={styles.portal} />
          <div key={`img-${character.id}`} className={styles.portrait}>
            <CharacterImage
              className={styles.portraitImage}
              src={character.image}
              alt={character.name}
              size="lg"
              loading="eager"
              width={300}
              height={300}
            />
          </div>
        </div>

        <div className={styles.summary}>
          <p className={styles.idTag}>Character #{character.id}</p>
          <h1 className={styles.name}>{character.name}</h1>
          <div className={styles.tags}>
            <StatusBadge status={character.status} size="md" />
            {character.type && <span className={styles.tag}>{character.type}</span>}
          </div>

          <dl className={styles.facts}>
            <Fact icon={GenderIcon} label="Gender" value={prettify(character.gender)} />
            <Fact icon={DnaIcon} label="Species" value={character.species} />
            <Fact icon={PlanetIcon} label="Origin" value={prettify(character.origin.name)} />
            <Fact icon={PinIcon} label="Last known location" value={prettify(character.location.name)} />
            <Fact icon={TvIcon} label="First seen in" value={debut ? `${debut.code} · ${debut.name}` : 'Unknown'} />
            <Fact
              icon={FilmIcon}
              label="Appearances"
              value={`${characterEpisodes.length} ${characterEpisodes.length === 1 ? 'episode' : 'episodes'}`}
            />
          </dl>
        </div>
      </div>

      {canCycle && (
        <nav className={styles.pager} aria-label="Cycle through characters">
          <NeighborLink direction="prev" character={prev} state={linkState} />
          <p className={styles.pagerHint}>
            Use <kbd>←</kbd> <kbd>→</kbd> to cycle
          </p>
          <NeighborLink direction="next" character={next} state={linkState} />
        </nav>
      )}

      <section className={styles.episodes} aria-labelledby="episodes-heading">
        <h2 id="episodes-heading" className={styles.sectionTitle}>
          Episode appearances
        </h2>
        <p className={styles.sectionHint}>Select an episode to see its details and everyone who appears in it.</p>
        {groupBySeason(characterEpisodes).map(([season, list]) => (
          <div key={season} className={styles.season}>
            <h3 className={styles.seasonTitle}>{seasonLabel(season)}</h3>
            <ul className={styles.episodeList}>
              {list.map((episode) => (
                <li key={episode.id}>
                  <Link
                    to={`/episode/${episode.id}`}
                    state={episodeOrigin}
                    className={styles.episode}
                  >
                    <span className={styles.episodeCode}>{episode.code}</span>
                    <span className={styles.episodeName}>{episode.name}</span>
                    <span className={styles.episodeDate}>{episode.airDate}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </article>
  );
}

interface FactProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function Fact({ icon: Icon, label, value }: FactProps) {
  return (
    <div className={styles.fact}>
      <dt className={styles.factTerm}>
        <Icon className={styles.factIcon} />
        <span className={styles.factLabel}>{label}</span>
      </dt>
      <dd className={styles.factValue}>{value}</dd>
    </div>
  );
}

interface NeighborLinkProps {
  direction: 'prev' | 'next';
  character: Character;
  state: BrowseState | undefined;
}

function NeighborLink({ direction, character, state }: NeighborLinkProps) {
  const isPrev = direction === 'prev';
  return (
    <Link
      to={`/character/${character.id}`}
      state={state}
      replace
      className={`${styles.neighbor} ${isPrev ? styles.neighborPrev : styles.neighborNext}`}
      aria-label={`${isPrev ? 'Previous' : 'Next'} character: ${character.name}`}
    >
      <span className={styles.arrow} aria-hidden="true">
        {isPrev ? '←' : '→'}
      </span>
      <CharacterImage
        className={styles.neighborThumb}
        src={character.image}
        alt=""
        size="sm"
        loading="eager"
        width={48}
        height={48}
      />
      <span className={styles.neighborText}>
        <span className={styles.neighborLabel}>{isPrev ? 'Previous' : 'Next'}</span>
        <span className={styles.neighborName}>{character.name}</span>
      </span>
    </Link>
  );
}
