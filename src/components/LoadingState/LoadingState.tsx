import Portal from '../Portal/Portal';
import styles from './LoadingState.module.css';

export default function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <Portal className={styles.portal} />
      <p className={styles.message}>{message}</p>
    </div>
  );
}
