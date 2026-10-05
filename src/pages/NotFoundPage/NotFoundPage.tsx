import { Link } from 'react-router';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <EmptyState title="404: This page doesn't exist in any dimension.">
      <p>Maybe it got portal-gunned somewhere else.</p>
      <div className={styles.links}>
        <Link to="/search">Search characters</Link>
        <Link to="/gallery">Open the gallery</Link>
      </div>
    </EmptyState>
  );
}
