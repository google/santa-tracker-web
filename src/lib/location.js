export const scope = new URL('./', self.location.href);

/**
 * Builds a URL pointing to static. In dev, this is just the top-level.
 *
 * @return {!URL}
 */
function build() {
  let raw = document.body.getAttribute('data-baseurl') || null;
  if (raw === null) {
    return scope;
  }
  if (!raw.endsWith('/')) {
    raw += '/';
  }

  try {
    const cand = new URL(raw);
    return cand;
  } catch (e) {
    // ignore
  }
  return new URL(raw, scope);
}

export const baseurl = build();

export function urlToStatic(req) {
  const url = new URL(req, baseurl);
  return url.toString();
}
