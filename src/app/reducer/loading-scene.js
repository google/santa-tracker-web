import {SantaTrackerAction} from '../action.js';
import {UNLOCKED_SCENES} from '../common.js';

export const loadingSceneReducer = (state, action) => {
  const {name} = action.payload;
  const sceneIsUnlocked = UNLOCKED_SCENES.has(name);

  if (!sceneIsUnlocked) {
    return state;
  }

  if (action.type !== SantaTrackerAction.SCENE_LOAD_STARTED && name !== state.name) {
    // This is an action from a scene that we don't care about
    // anymore because it was probably discarded while loading.
    return state;
  }

  switch (action.type) {
    case SantaTrackerAction.SCENE_LOAD_STARTED:
      return {
        ...state,
        ...action.payload,
        loading: true,
        ready: false,
        progress: 0,
        error: null,
      };

    case SantaTrackerAction.SCENE_LOAD_PROGRESSED:
      return {
        ...state,
        ...action.payload,
        loading: true,
      };

    case SantaTrackerAction.SCENE_LOAD_COMPLETED:
      return {...state, loading: false, progress: null, error: null, ready: true};

    case SantaTrackerAction.SCENE_LOAD_FAILED:
      return {
        ...state,
        ...action.payload,
        loading: false,
      };
  };

  return state;
};
