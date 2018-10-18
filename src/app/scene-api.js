import {Adapter} from '@polymer/broadway/lib/adapter';
import {SantaTrackerAction} from './action.js';
import {SANTA_TRACKER_CONTROLLER_URL} from './common.js';

const adapter = new Adapter(SANTA_TRACKER_CONTROLLER_URL);

export class SceneApi {
  constructor(sceneName) {
    this.name = sceneName;
  }

  loadStarted() {
    adapter.dispatch({type: SantaTrackerAction.SCENE_LOAD_STARTED, payload: {name: this.name}});
  }

  loadProgress(progress) {
    adapter.dispatch(
        {type: SantaTrackerAction.SCENE_LOAD_PROGRESSED, payload: {name: this.name, progress}});
  }

  loadCompleted() {
    adapter.dispatch({type: SantaTrackerAction.SCENE_LOAD_COMPLETED, payload: {name: this.name}});
  }

  loadFailed(error) {
    adapter.dispatch(
        {type: SantaTrackerAction.SCENE_LOAD_FAILED, payload: {name: this.name, error}});
  }

  installV1Handlers() {
    window.santaApp = {
      fire(eventName, arg) {
        // TODO(samthor): do something with events
        switch (eventName) {
        case 'sound-trigger':
          break;
        case 'sound-ambient':
          break;
        case 'game-score':
          // TODO: emit score to game
          break;
        case 'game-stop':
          // TODO: game is stopped
          break;
        }
      },
    };
    window.ga = function() {
      // TODO: log events
    };
  }
}
