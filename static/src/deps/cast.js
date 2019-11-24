let castPromise = null;

export default function load() {
  if (castPromise === null) {
    castPromise = internalLoad();
  }
  return castPromise;
}

async function internalLoad() {
  const vendor = navigator.vendor || '';
  if (!vendor.match('Google Inc.')) {
    return null;
  }

  const isAvailable = await new Promise((resolve, reject) => {
    window['__onGCastApiAvailable'] = (isAvailable) => {
      resolve(isAvailable);
      delete window['__onGCastApiAvailable'];
    };
  
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
    document.head.appendChild(script);
    script.onerror = reject;
  });

  if (!isAvailable) {
    return null;
  }

  // nb. application IDs managed by thorogood@, loads /cast.html
  const isProd = (window.location.hostname === 'santatracker.google.com');
  const receiverApplicationId = isProd ? 'DC422219' : '00969AF4';

  cast.framework.CastContext.getInstance().setOptions({
    receiverApplicationId,
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
  });

  const player = new cast.framework.RemotePlayer();
  const playerController = new cast.framework.RemotePlayerController(player);

  playerController.addEventListener(
    cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, () => {
      // TODO(samthor): Show/hide button.
      document.body.classList.toggle('cast', player.isConnected);
    });
}
