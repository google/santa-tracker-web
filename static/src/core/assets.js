
/**
 * @param {string} sceneName to load a feature image for
 * @return {!Promise<!Image>}
 */
export function sceneImage(sceneName) {
  // TODO: use normalizeSceneName
  if (!sceneName) {
    return Promise.reject('invalid scene name');
  }

  const base = join(import.meta.url, '../../img/scenes/') + sceneName;
  const img = document.createElement('img');
  img.src = base + (window.devicePixelRatio > 1 ? '_2x.png' : '_1x.png');
  img.srcset = `${base}_1x.png, ${img.src}_2x.png 2x`;

  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};
