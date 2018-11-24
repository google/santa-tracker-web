import {Adapter} from '@polymer/broadway/lib/adapter';
import {logger} from '@polymer/broadway/lib/logger';
import '../polyfill/event-target.js';

import {formatDuration} from '../lib/time.js';
import * as sc from '../soundcontroller.js';

import {SantaTrackerAction} from './action.js';
import {SANTA_TRACKER_CONTROLLER_URL} from './common.js';

logger.enabled = false;


export class Entrypoint extends EventTarget {
  constructor(santaApp) {
    super();

    this.adapter = new Adapter(SANTA_TRACKER_CONTROLLER_URL);

    let activeScene = null;

    this.adapter.subscribe((state) => {
      if (state.activeScene !== activeScene || state.showError) {
        activeScene = state.activeScene;
        this.dispatchEvent(new Event('ready'));
      }

      // TODO(samthor): This dispatches constantly when any state changes.
      if (state.selectedScene !== null) {
        const detail = {sceneName: state.selectedScene, data: state.selectedData};
        this.dispatchEvent(new CustomEvent('scene', {detail}))
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

  load(sceneName, data) {
    const payload = {sceneName, data};
    this.adapter.dispatch({type: SantaTrackerAction.SCENE_SELECTED, payload});
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
