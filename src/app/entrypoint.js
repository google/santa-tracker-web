import {Adapter} from '@polymer/broadway/lib/adapter';
import {logger} from '@polymer/broadway/lib/logger';

import {formatDuration} from '../lib/time.js';
import * as route from '../route.js';
import * as sc from '../soundcontroller.js';

import {SantaTrackerAction} from './action.js';
import {SANTA_TRACKER_CONTROLLER_URL} from './common.js';

logger.enabled = false;

export class Entrypoint {
  constructor(santaApp) {
    this.adapter = new Adapter(SANTA_TRACKER_CONTROLLER_URL);
    // Update brower location as the activated
    let selectedSceneName = '';

    this.adapter.subscribe(state => {
      if (state.selectedScene.name !== selectedSceneName) {
        selectedSceneName = state.selectedScene.name;
        const historyStrategy =
            state.selectedScene.replace ? 'replaceState' : 'pushState';
        window.history[historyStrategy](
            null, null, route.urlFromRoute(selectedSceneName));
      }

      const {api} = state;

      if (api == null) {
        return;
      }

      const {now, range} = api;

      if (range === null) {
        // skip
      } else if (now < range.start) {
        console.debug('Santa takeoff in', formatDuration(range.start - now));
      } else if (now >= range.end) {
        console.debug('Santa landed', formatDuration(now - range.end), 'ago');
      } else {
        console.debug(
            'Santa flying for',
            formatDuration(now - range.start),
            'remaining',
            formatDuration(range.end - now));
      }
    });

    // Translate clicks on scene links into dispatched actions
    santaApp.addEventListener('click', (ev) => {
      const sceneName = route.fromClick(ev);
      if (sceneName === null) {
        return null;  // probably an external link
      }
      if (selectedSceneName === sceneName) {
        this.adapter.dispatch({type: SantaTrackerAction.SIDEBAR_DISMISSED});
        // TODO(samthor): If the scene is loaded but there's been an error,
        // perhaps that could be reported declaratively: we could here then
        // `santaApp.error = null`, to indicate that we don't care and we do
        // want to retry.
      } else {
        this.adapter.dispatch({
          type: SantaTrackerAction.SCENE_SELECTED,
          payload: {name: sceneName || 'village'}
        });
      }
      ev.preventDefault();
    });

    window.addEventListener('popstate', (ev) => this.syncLocation());
    this.syncLocation();
    this.startDefaultMusic();
  }

  async startDefaultMusic() {
    // Most Klang sounds won't start unless the preload event has been
    // explicitly waited for.
    await sc.dispatch('village_load_sounds');
    sc.ambient('village_start');
    sc.ambient('music_start_village');

    await new Promise((r) => window.setTimeout(r, 2 * 1000));

    // Some Klang sounds need to be "closed off", otherwise they can keep
    // playing: possibly forever. There should be a way to record 'cleanup'
    // events on scene setup, that are called before a new scene is allowed to
    // make its audio requests.
    sc.ambient('village_end');
  }

  syncLocation() {
    let sceneName = route.fromUrl(window.location);

    if (sceneName === '') {
      sceneName = 'village';
    } else if (sceneName == null) {
      return;
    }

    this.adapter.dispatch({
      type: SantaTrackerAction.SCENE_SELECTED,
      payload: {name: sceneName, replace: true}
    });
  }
}
