import '../../node_modules/lottie-web/build/player/lottie_light.min.js';

/**
 * Remove redundant clip-paths from the instantiated Lottie element.
 *
 * This speeds up Firefox and Safari because these paths are basically redundant.
 *
 * @param {?SVGElement} svg
 */
export function simplifyClip(svg) {
  if (!svg) {
    return;
  }

  const paths = Array.from(svg.querySelectorAll('clipPath'));
  const width = svg.getAttribute('width');
  const height = svg.getAttribute('height');

  if (!width || !height) {
    return;
  }

  // If this value is in the path, then it's probably a simple rect.
  const rectPath = `M0,0 L${width},0 L${width},${height} L0,${height}z`;

  paths.forEach((path) => {
    if (path.children.length !== 1) {
      return;
    }
    const check = path.children[0];

    if (check.localName === 'rect' && check.getAttribute('width') === width && check.getAttribute('height') === height) {
      // found a bounding rect
    } else if (check.localName === 'path' && check.getAttribute('d') === rectPath) {
      // found a full-sized path
    } else {
      return;
    }

    path.remove();
  });
}

export function loadAnimation(path, options) {
  const container = options.container || document.createElement('div');
  const anim = lottie.loadAnimation(Object.assign({
    path: path + '?#',  // in dev, this ensures JSON is returned raw
    renderer: 'svg',
    container,
    autoplay: false,
  }, options));
  anim.addEventListener('DOMLoaded', () => simplifyClip(anim.renderer.svgElement));
  return anim;
}

export function promisify(anim) {
  return new Promise((resolve, reject) => {
    anim.addEventListener('DOMLoaded', () => resolve(anim));
    anim.addEventListener('data_failed', reject);
  });
}

/**
 * @param {string} path to load
 * @param {!Object<string, string>} options to append to lottie load
 * @return {!Promise<*>}
 */
export function prepareAnimation(path, options) {
  return promisify(loadAnimation(path, options));
}
