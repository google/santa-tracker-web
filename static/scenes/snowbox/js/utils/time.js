export function getNow() {
  // prevent gastby build error
  // https://www.gatsbyjs.org/docs/debugging-html-builds/#how-to-check-if-window-is-defined
  if (typeof window !== 'undefined') {
    return 'now' in window.performance ? performance.now() : new Date().getTime()
  }

  return new Date().getTime()
}
