
/**
 * @param {!HTMLElement} container
 * @param {string} key
 * @param {string=} preserveAspectRatio
 * @return {!Promise<*>}
 */
export function initAnimation(container, key, preserveAspectRatio = undefined) {
  const p = new Promise((resolve, reject) => {
    const anim = lottie.loadAnimation({
      container,
      autoplay: false,
      renderer: 'svg',
      path: `img/modules/${key}.json`,
      rendererSettings: {
        className: 'animation__svg',
        preserveAspectRatio,
      },
    });
    anim.addEventListener('DOMLoaded', () => resolve(anim));
    anim.addEventListener('data_failed', reject);
  });

  return p;
}

/**
 * @param {function(): void} handler to run on a rAF after scroll or resize
 */
export function installAdjustHandler(handler) {
  let rAF = 0;
  const internalHandler = () => {
    rAF = 0;
    handler();
  };
  rAF = window.requestAnimationFrame(internalHandler);

  const eventHandler = () => {
    if (rAF === 0) {
      rAF = window.requestAnimationFrame(internalHandler);
    }
  };
  ['scroll', 'resize'].forEach((eventType) => {
    window.addEventListener(eventType, eventHandler, {passive: true});
  });
}
