import {SantaTrackerAction} from '../action.js';

export const santaTrackerReducer = (state, action) => {
  switch (action.type) {
    case SantaTrackerAction.SCENE_SELECTED:
      if (state.selectedScene === action.payload) {
        // hide sidebar if we're already selected (pretend 'activated' again)
        let showSidebar = state.showSidebar;
        if (state.activeScene === action.payload) {
          showSidebar = false;
        }

        return {
          ...state,
          showSidebar,
          loadAttempt: state.loadAttempt + 1,  // might request reload
        };
      }

      // if the selected scene is already active (but not selected), then it was selected again
      // during another scene's load: so set the scene's loadProgress to done!
      const loadProgress = (state.activeScene === action.payload) ? 1 : 0;
      return {
        ...state,
        selectedScene: action.payload,
        loadAttempt: 0,
        loadProgress,
      };

    case SantaTrackerAction.SCENE_LOAD_PROGRESS:
      if (state.activeScene === state.selectedScene) {
        return state;  // can arrive out-of-order, ignore if scene happy
      }
      return {...state, loadProgress: action.payload};

    case SantaTrackerAction.SCENE_ACTIVATED:
      return {
        ...state,
        activeScene: action.payload,
        loadProgress: 1,
        showError: false,
        showSidebar: false,
        score: null,
      };

    case SantaTrackerAction.SCENE_FAILED:
      // nb. selectedScene remains the same, as the URL should not change.
      return {
        ...state,
        activeScene: null,
        loadProgress: 1,
        showError: true,
        showSidebar: false,
      };

    case SantaTrackerAction.SCORE_UPDATE:
      if (state.activeScene !== action.payload.sceneName) {
        return state;
      }
      return {...state, score: action.payload.detail};

    case SantaTrackerAction.PAGE_BECAME_VISIBLE:
      return {...state, pageVisible: true};

    case SantaTrackerAction.PAGE_BECAME_HIDDEN:
      return {...state, pageVisible: false};

    case SantaTrackerAction.DEVICE_WENT_ONLINE:
      return {...state, online: true};

    case SantaTrackerAction.DEVICE_WENT_OFFLINE:
      return {...state, online: false};

    case SantaTrackerAction.API_SYNC_COMPLETED:
      return {...state, api: action.payload};

    case SantaTrackerAction.SIDEBAR_REQUESTED:
      return {...state, showSidebar: true};

    case SantaTrackerAction.SIDEBAR_DISMISSED:
      return {...state, showSidebar: false};
  }

  return state;
};
