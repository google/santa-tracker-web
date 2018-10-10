
export function findClosestLink(ev) {
  const path = ev.composedPath();
  path.reverse();
  for (const cand of path) {
    if (cand.localName === 'a' && cand.href) {
      return cand;
    }
  }
  return null;
}