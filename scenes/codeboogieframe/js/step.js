
goog.provide('app.Step');

/**
 * Dance step constants.
 * @enum {string}
 */
app.Step = {
  LEFT_ARM: 'pointLeft',
  RIGHT_ARM: 'pointRight',
  LEFT_FOOT: 'stepLeft',
  RIGHT_FOOT: 'stepRight',
  JUMP: 'jump',
  SPLIT: 'splits',
  SHAKE: 'hip',

  // Special moves
  CARLTON: 'carlton',
  SPONGEBOB: 'spongebob',
  ELVIS: 'elvis',
  THRILLER: 'thriller',

  // Non blockly moves
  IDLE: 'idle',
  FAIL: 'fail',
  WATCH: 'watch'
};
