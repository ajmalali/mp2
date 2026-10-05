import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';

const positions = new Map<string, number>();

/**
 * Starts new pages at the top, but restores the previous scroll position when
 * the user goes back/forward (e.g. returning from a detail page to a long list).
 */
export function useScrollMemory(): void {
  const location = useLocation();
  const navigationType = useNavigationType();
  const keyRef = useRef(location.key);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => positions.set(keyRef.current, window.scrollY));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useLayoutEffect(() => {
    keyRef.current = location.key;
    const saved = positions.get(location.key);
    window.scrollTo(0, navigationType === 'POP' && saved !== undefined ? saved : 0);
  }, [location.key, navigationType]);
}
