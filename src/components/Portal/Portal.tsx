import styles from './Portal.module.css';

interface PortalProps {
  className?: string;
}

/** Rick's swirling green portal, drawn purely with CSS gradients. */
export default function Portal({ className = '' }: PortalProps) {
  return (
    <span className={`${styles.portal} ${className}`} aria-hidden="true">
      <span className={styles.swirl} />
      <span className={styles.ripples} />
      <span className={styles.core} />
    </span>
  );
}
