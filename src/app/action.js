export const SantaTrackerAction = {
  // API
  API_SYNC_COMPLETED: 'api-sync-completed',

  // UI
  SIDEBAR_REQUESTED: 'sidebar-requested',
  SIDEBAR_DISMISSED: 'sidebar-dismissed',

  // Scene transition
  SCENE_SELECTED: 'scene-selected',
  SCENE_LOAD_PROGRESS: 'scene-load-progress',
  SCENE_ACTIVATED: 'scene-activated',
  SCENE_FAILED: 'scene-failed',

  // Things a scene can do
  SCORE_UPDATE: 'score-update',
  SCORE_GAMEOVER: 'score-gameover',
  SCENE_DATA: 'scene-data',

  // Visibility / connectivity
  PAGE_BECAME_VISIBLE: 'page-became-visible',
  PAGE_BECAME_HIDDEN: 'page-became-hidden',

  DEVICE_WENT_ONLINE: 'device-went-online',
  DEVICE_WENT_OFFLINE: 'device-went-offline',
};
