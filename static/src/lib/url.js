
/**
 * Joins the given URL and any following paths.
 *
 * @param {string|!URL} url to start with
 * @param  {...string} paths to append
 */
export function join(url, ...paths) {
  let u = new URL(url);

  while (paths.length) {
    let next = String(paths.shift());
    if (!next.endsWith('/') && paths.length) {
      next += '/';
    }
    u = new URL(next, u);
  }

  // FIXME: It's not clear what domain this loads from, so just return the whole URL.
  return u.toString();
}
