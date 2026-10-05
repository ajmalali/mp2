import type { CharacterStatus } from '../../types';
import styles from './StatusBadge.module.css';

const statusClass: Record<CharacterStatus, string> = {
  Alive: styles.alive,
  Dead: styles.dead,
  unknown: styles.unknown,
};

interface StatusBadgeProps {
  status: CharacterStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const sizeClass = size === 'md' ? styles.md : '';
  return (
    <span className={`${styles.badge} ${statusClass[status]} ${sizeClass}`}>
      <span className={styles.dot} aria-hidden="true" />
      {status === 'unknown' ? 'Unknown' : status}
    </span>
  );
}
