
/**
 * @param {string} src asset to load
 * @return {{promise: !Promise<!Image|!HTMLMediaElement>, asset: !Image|!HTMLMediaElement}}
 */
export function prepareAsset(src, options) {
  const extMatch = /(\.\w+)(|\?.*)$/.exec(src);
  const ext = extMatch && extMatch[1] || null;

  options = Object.assign({
    loop: (ext === '.mp4'),
    autoplay: true,
  }, options);

  let asset;
  const promise = new Promise((resolve, reject) => {
    switch (ext) {
      case '.mp4':
        asset = document.createElement('video');
        asset.loop = options.loop;
        asset.autoplay = options.autoplay;
        asset.muted = true;
        asset.addEventListener('canplay', () => resolve(asset));
        break;

      case '.mp3':
      case '.ogg':
        asset = document.createElement('audio');
        asset.loop = options.loop;
        asset.autoplay = options.autoplay;
        asset.addEventListener('canplaythrough', () => resolve(asset));
        break;

      default:
        asset = document.createElement('img');
        asset.addEventListener('load', () => resolve(asset));
        break;
    }

    asset.addEventListener('error', reject);
    asset.src = src;
  });

  return {promise, asset};
}
