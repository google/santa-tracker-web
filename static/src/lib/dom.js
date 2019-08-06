
export function findClosestLink(ev) {
  // can't use closest() when shadow DOM is involved
  const path = ev.composedPath();
  path.reverse();
  for (const cand of path) {
    if (cand.localName === 'a' && cand.href) {
      return cand;
    }
  }
  return null;
}

export function urlFromClickEvent(ev) {
  if (ev.ctrlKey || ev.metaKey || ev.which > 1) {
    return null;  // ignore event while buttons are pressed
  }

  const path = ev.composedPath();
  path.reverse();
  for (const cand of path) {
    if (cand.localName === 'a' && cand.href) {
      return new URL(cand.href);
    }
  }
  return null;
}