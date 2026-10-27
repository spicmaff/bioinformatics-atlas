/** Add the repository prefix exactly once. Works for root hosting too. */
export function withBase(path = '', base = import.meta.env.BASE_URL): string {
  const prefix = `${base.replace(/\/+$/, '')}/`;
  const relative = path.replace(/^\/+/, '');
  return prefix + relative;
}
