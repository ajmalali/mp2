// Filters, search text and sorting live in the URL query string so that views
// are shareable/bookmarkable and survive a trip to the detail page and back.

export function readList(params: URLSearchParams, key: string): string[] {
  const raw = params.get(key);
  return raw ? raw.split(',').filter(Boolean) : [];
}

export function writeList(params: URLSearchParams, key: string, values: string[]): void {
  if (values.length) params.set(key, values.join(','));
  else params.delete(key);
}

export function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}
