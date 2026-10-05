import styles from './HighlightedText.module.css';

interface HighlightedTextProps {
  text: string;
  /** Already lower-cased and trimmed. */
  query: string;
}

/** Wraps the first case-insensitive match of `query` inside `text` in a <mark>. */
export default function HighlightedText({ text, query }: HighlightedTextProps) {
  const start = query ? text.toLowerCase().indexOf(query) : -1;
  if (start === -1) return <>{text}</>;

  const end = start + query.length;
  return (
    <>
      {text.slice(0, start)}
      <mark className={styles.mark}>{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  );
}
