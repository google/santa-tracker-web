/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
