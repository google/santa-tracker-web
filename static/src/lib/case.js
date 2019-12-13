
/**
 * @param {string} arg to flatten from e.g. "fooBar" to "foo-bar"
 * @return {string}
 */
export function dashCamelCase(arg) {
  return arg.replace(/[A-Z]/g, (v) => {
    return '-' + v.toLowerCase();
  });
}
