import { useEffect, useRef, useState } from 'react';
import styles from './CharacterImage.module.css';

type Status = 'loading' | 'loaded' | 'error';

// Bursts of avatar requests (e.g. scrolling the gallery) occasionally fail or
// get throttled, so retry a couple of times with backoff before giving up.
const MAX_RETRIES = 2;
const RETRY_BASE_MS = 700;

interface CharacterImageProps {
  src: string;
  /** Empty string marks the image as decorative. */
  alt: string;
  /** Sizing, borders and radius come from the caller; the image fills this box. */
  className?: string;
  /** Large images show a caption and a manual retry button when they fail. */
  size?: 'sm' | 'md' | 'lg';
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
}

interface ImageState {
  src: string;
  attempt: number;
  status: Status;
}

function withRetryParam(src: string, attempt: number): string {
  if (attempt === 0) return src;
  return `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}`;
}

export default function CharacterImage({
  src,
  alt,
  className = '',
  size = 'md',
  loading = 'lazy',
  width,
  height,
}: CharacterImageProps) {
  const [state, setState] = useState<ImageState>(() => ({ src, attempt: 0, status: src ? 'loading' : 'error' }));
  const imgRef = useRef<HTMLImageElement>(null);
  const retryTimer = useRef<number | undefined>(undefined);

  // A new src (e.g. cycling to the next character) starts over.
  if (state.src !== src) {
    setState({ src, attempt: 0, status: src ? 'loading' : 'error' });
  }

  useEffect(() => () => window.clearTimeout(retryTimer.current), []);

  // Images served from the browser cache can finish before React sees the load event.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setState((prev) => (prev.status === 'loading' ? { ...prev, status: 'loaded' } : prev));
    }
  }, [state.src, state.attempt]);

  const handleLoad = () => setState((prev) => ({ ...prev, status: 'loaded' }));

  const handleError = () => {
    if (state.attempt < MAX_RETRIES) {
      const delay = RETRY_BASE_MS * 2 ** state.attempt;
      window.clearTimeout(retryTimer.current);
      retryTimer.current = window.setTimeout(() => {
        setState((prev) => (prev.src === src ? { ...prev, attempt: prev.attempt + 1 } : prev));
      }, delay);
    } else {
      setState((prev) => ({ ...prev, status: 'error' }));
    }
  };

  const retryNow = () => setState((prev) => ({ ...prev, attempt: prev.attempt + 1, status: 'loading' }));

  const label = alt ? `${alt} (image unavailable)` : undefined;

  return (
    <span className={`${styles.frame} ${styles[size]} ${className}`} data-status={state.status}>
      {state.status === 'error' ? (
        <span
          className={styles.fallback}
          role={label ? 'img' : undefined}
          aria-label={label}
          aria-hidden={label ? undefined : true}
        >
          <svg className={styles.fallbackArt} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <circle className={styles.halo} cx="32" cy="32" r="30" />
            <circle className={styles.head} cx="32" cy="25" r="12" />
            <path className={styles.body} d="M12 58c2-11 10-17 20-17s18 6 20 17z" />
            <text className={styles.mark} x="32" y="31" textAnchor="middle">
              ?
            </text>
          </svg>
          {size === 'lg' && (
            <>
              <span className={styles.caption}>Image lost in another dimension</span>
              {src && (
                <button type="button" className={styles.retry} onClick={retryNow}>
                  Try again
                </button>
              )}
            </>
          )}
        </span>
      ) : (
        <img
          // A fresh element per attempt guarantees the browser re-requests the image.
          key={state.attempt}
          ref={imgRef}
          className={styles.img}
          src={withRetryParam(src, state.attempt)}
          alt={alt}
          // A retry only happens for an image that already started loading, i.e. one
          // in view, so it shouldn't wait on lazy-loading heuristics again.
          loading={state.attempt > 0 ? 'eager' : loading}
          decoding="async"
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </span>
  );
}
