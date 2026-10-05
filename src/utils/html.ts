/**
 * Converts an HTML snippet (e.g. a TVmaze summary) into plain-text paragraphs
 * so it can be rendered as text, never injected as markup. DOMParser does not
 * run scripts or load resources from the parsed document.
 */
export function htmlToParagraphs(html: string): string[] {
  if (!html.trim()) return [];
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const blocks = [...doc.body.querySelectorAll('p')];
  const texts = (blocks.length ? blocks : [doc.body]).map((el) => el.textContent?.replace(/\s+/g, ' ').trim() ?? '');
  return texts.filter(Boolean);
}
