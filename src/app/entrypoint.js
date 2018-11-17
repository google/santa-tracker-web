import {Adapter} from '@polymer/broadway/lib/adapter';
import {logger} from '@polymer/broadway/lib/logger';

import {formatDuration} from '../lib/time.js';
import * as sc from '../soundcontroller.js';

import {SantaTrackerAction} from './action.js';
import {SANTA_TRACKER_CONTROLLER_URL} from './common.js';

logger.enabled = false;


function inferActiveScene(state) {
  if (state.activeScene !== null) {
    return state.activeScene;
  }
  return state.showError ? state.selectedScene : null;
}


export class Entrypoint {
  constructor(santaApp, callback) {
    this.adapter = new Adapter(SANTA_TRACKER_CONTROLLER_URL);

    let hostActiveScene = null;
    let selectedScene = null;

    this.adapter.subscribe((state) => {
      selectedScene = state.selectedScene;

      // We still want to inform the host if our selectedScene didn't load, so infer the "active"
      // scene if showError is true.
      const candidateHostActiveScene = inferActiveScene(state);
      if (hostActiveScene !== candidateHostActiveScene) {
        hostActiveScene = candidateHostActiveScene;
        callback(hostActiveScene);
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

    window.addEventListener('offline', (ev) => this.syncIsOnline());
    window.addEventListener('online', (ev) => this.syncIsOnline());

    this.syncIsOnline();

    document.addEventListener('visibilitychange', (ev) => this.syncVisibility());

    this.syncVisibility();

    this.startDefaultMusic();
  }

  load(sceneName) {
    this.adapter.dispatch({type: SantaTrackerAction.SCENE_SELECTED, payload: sceneName});
  }

  async startDefaultMusic() {
    // Most Klang sounds won't start unless the preload event has been explicitly waited for.
    await sc.fire('village_load_sounds');
    await sc.fire('music_start_village');
    await sc.ambient('village_start', 'village_end');
  }

  syncVisibility() {
    this.adapter.dispatch({
      type: document.hidden ? SantaTrackerAction.PAGE_BECAME_HIDDEN :
                              SantaTrackerAction.PAGE_BECAME_VISIBLE
    });
  }

  syncIsOnline() {
    this.adapter.dispatch({
      type: navigator.onLine ? SantaTrackerAction.DEVICE_WENT_ONLINE :
                               SantaTrackerAction.DEVICE_WENT_OFFLINE
    });
  }
}
