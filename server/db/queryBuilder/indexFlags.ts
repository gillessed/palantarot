export function indexFlags(query: string) {
  let q = query;
  let index = 1;
  while (q.indexOf('?') >= 0) {
    q = q.replace(/\?/, `$${index}`);
    index = index + 1;
  }
  return q;
}
