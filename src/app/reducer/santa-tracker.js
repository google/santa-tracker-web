import {SantaTrackerAction} from '../action.js';
import {loadingSceneReducer} from './loading-scene.js';

export const santaTrackerReducer = (state, action) => {
  switch (action.type) {
    case SantaTrackerAction.SCENE_SELECTED:
      return {...state, selectedScene: {replace: false, ...action.payload}};

    case SantaTrackerAction.SCENE_ACTIVATED:
      return {...state, activeScene: {...action.payload}, showError: false};

    case SantaTrackerAction.SCENE_FAILED:
      return {
        ...state,
        activeScene: {name: ''},
        selectedScene: {name: ''},
        showError: true
      };

    case SantaTrackerAction.API_SYNC_COMPLETED:
      return {...state, api: action.payload};

    case SantaTrackerAction.SIDEBAR_REQUESTED:
      return {...state, showSidebar: true};

    case SantaTrackerAction.SIDEBAR_DISMISSED:
      return {...state, showSidebar: false};

    case SantaTrackerAction.SCENE_LOAD_STARTED:
    case SantaTrackerAction.SCENE_LOAD_PROGRESSED:
    case SantaTrackerAction.SCENE_LOAD_COMPLETED:
    case SantaTrackerAction.SCENE_LOAD_FAILED:
      return {
        ...state,
        loadingScene: loadingSceneReducer(state.loadingScene, action)
      };
  }

  return state;
};
