
goog.provide('app.Step');

/**
 * Dance step constants.
 * @enum {string}
 */
app.Step = {
  LEFT_ARM: 'leftArm',
  RIGHT_ARM: 'rightArm',
  LEFT_FOOT: 'leftFoot',
  RIGHT_FOOT: 'rightFoot',
  JUMP: 'jump',
  SPLIT: 'split',
  SHAKE: 'shake',

  // Special moves
  CARLTON: 'carlton',

  // Non blockly moves
  IDLE: 'idle',
  FAIL: 'fail',
  WATCH: 'watch'
};
