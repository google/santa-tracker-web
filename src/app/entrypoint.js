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

    // start default music
    sc.fire('traditions_load_sounds');  // nb. this loads 'lounge' => 'music_start_scene'
    sc.fire('music_start_scene');

    this.adapter = new Adapter(SANTA_TRACKER_CONTROLLER_URL);

    let activeScene = null;
    this.selectedData = null;

    this.adapter.subscribe((state) => {
      if (state.activeScene !== activeScene || state.showError) {
        activeScene = state.activeScene;
        this.dispatchEvent(new Event('ready'));
      }

      this.selectedData = state.selectedData;

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
  }

  _adapterDispatch(type, payload) {
    this.adapter.dispatch({type, payload});
  }

  async handleSceneMessage(type, payload) {
    switch (type) {
      case 'ready':
        // TODO: configure pause button availability etc
        break;
      case 'go':
        this.load(payload);
        break;
      case 'data':
        this._adapterDispatch(SantaTrackerAction.SCENE_DATA, payload);
        break;
      case 'klang':
        handleKlang(payload[0], payload.slice(1));
        break;
      case 'score':
        this._adapterDispatch(SantaTrackerAction.SCORE_UPDATE, payload);
        break;
      case 'gameover':
        this._adapterDispatch(SantaTrackerAction.SCORE_GAMEOVER, payload);
        break;
      default:
        console.warn('got unhandled scene message', type);
    }
  }

  async scene(port) {
    for (;;) {
      const {type, payload} = await port.next();
      if (type === port.shutdown) {
        return;
      }
      await this.handleSceneMessage(type, payload);
    }
  }

  load(sceneName, data) {
    const payload = {sceneName, data};
    this._adapterDispatch(SantaTrackerAction.SCENE_SELECTED, payload);
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


function handleKlang(command, args) {
  switch (command) {
    case 'play':
      return sc.play(args[0]);
    case 'fire':
      return sc.fire(args[0]);
    case 'ambient':
      return sc.ambient(args[0], args[1]);
    default:
      throw new Error(`unhandled Klang: ${command}`);
  }
}
