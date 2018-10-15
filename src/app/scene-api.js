import {Adapter} from '@polymer/broadway/lib/adapter';
import {SantaTrackerAction} from './action.js';
import {SANTA_TRACKER_CONTROLLER_URL} from './common.js';

const adapter = new Adapter(SANTA_TRACKER_CONTROLLER_URL);

export class SceneApi {
  constructor(sceneName) {
    this.name = sceneName;
  }

  loadStarted() {
    adapter.dispatch({
      type: SantaTrackerAction.SCENE_LOAD_STARTED,
      payload: {name: this.name}
    });
  }

  loadProgress(progress) {
    adapter.dispatch({
      type: SantaTrackerAction.SCENE_LOAD_PROGRESSED,
      payload: {name: this.name, progress}
    });
  }

  loadCompleted() {
    adapter.dispatch({
      type: SantaTrackerAction.SCENE_LOAD_COMPLETED,
      payload: {name: this.name}
    });
  }

  loadFailed(error) {
    debugger;
    adapter.dispatch({
      type: SantaTrackerAction.SCENE_LOAD_FAILED,
      payload: {name: this.name, error}
    });
  }
}
