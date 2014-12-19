goog.provide('app.Constants');



/**
 * These are gameplay and UI related constants used by the code.
 * Please tweak them to improve gameplay and game balance.
 */
app.Constants = {
  SELECTOR_BLOCKS: '.neighbourhood__block',
  SELECTOR_BLOCKS_CONTAINER: '.neighbourhood__container',
  SELECTOR_CONTROL_BUTTONS: '.control__button',
  SELECTOR_CONTROL_LEFT: '.control__button--left',
  SELECTOR_CONTROL_RIGHT: '.control__button--right',

  CLASS_CONTROL_LEFT_ENABLED: 'control__button control__button--left',
  CLASS_CONTROL_LEFT_DISABLED: 'control__button control__button--left control__button--disabled',
  CLASS_CONTROL_RIGHT_ENABLED: 'control__button control__button--right',
  CLASS_CONTROL_RIGHT_DISABLED: 'control__button control__button--right control__button--disabled',

  FULL_SCENE_MIN_WIDTH: 3068,
  MIN_BLOCK_WIDTH: 1022, // 3068 / 3

  VIEW_SIZE_FACTOR: 0.7,
  VIEW_GAP: 0.22,

  CONTAINER_TRANSITION_DURATION_MS: 800,

  RESIZE_DEBOUNCE_THRESHOLD_MS: 300
};
