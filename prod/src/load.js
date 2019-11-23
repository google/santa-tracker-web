
/**
 * Loads the passed script.
 *
 * @param {string} src
 * @param {?string=} type
 * @return {!Promise<void>}
 */
export function script(src, type=null) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    if (type) {
      script.type = type;
    }
    script.setAttribute('crossorigin', 'anonymous');
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.append(script);
  });
}

/**
 * Loads a number of passed scripts, without Promise. These unfortunately load in-order.
 *
 * @param {!Array<string>} scripts to load
 * @param {function(): void} callback to call when done
 */
export function supportScripts(scripts, callback) {
  const next = () => {
    const src = scripts.shift();
    if (src === undefined) {
      callback();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.setAttribute('crossorigin', 'anonymous');

    script.onload = next;
    script.onerror = () => {
      console.warn('cannot load', src);
      next();
    };
    document.head.appendChild(script);
  };

  next();
}

/**
 * @param {string} src to load as global CSS
 * @return {!Promise<void>}
 */
export function css(src) {
  return new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.href = src;
    css.type = 'stylesheet';
    css.onload = () => resolve();
    css.onerror = reject;
    document.head.append(css);
  });
}
