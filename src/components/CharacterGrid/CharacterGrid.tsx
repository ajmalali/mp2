import { Link } from 'react-router';
import CharacterImage from '../CharacterImage/CharacterImage';
import StatusBadge from '../StatusBadge/StatusBadge';
import type { BrowseState, Character } from '../../types';
import styles from './CharacterGrid.module.css';

interface CharacterGridProps {
  characters: Character[];
  /** Router state for the detail page so PREVIOUS / NEXT cycle through this grid. */
  browseState: BrowseState;
}

/** Grid of trading-card style portraits that link to each character's detail page. */
export default function CharacterGrid({ characters, browseState }: CharacterGridProps) {
  return (
    <ul className={styles.grid}>
      {characters.map((c) => (
        <li key={c.id} className={styles.cell}>
          <Link to={`/character/${c.id}`} state={browseState} className={styles.card}>
            <CharacterImage className={styles.image} src={c.image} alt={c.name} width={300} height={300} />
            <span className={styles.badge}>
              <StatusBadge status={c.status} />
            </span>
            <span className={styles.caption}>
              <span className={styles.name}>{c.name}</span>
              <span className={styles.species}>{c.species}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
